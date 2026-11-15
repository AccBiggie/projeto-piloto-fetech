<?php

namespace App\Http\Controllers\Panel;

use App\Enums\BlockReason;
use App\Enums\ClientStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Panel\ClientIndexRequest;
use App\Http\Requests\Panel\ClientRequest;
use App\Models\Client;
use App\Models\ClientDomain;
use App\Models\ClientEvent;
use App\Support\Blocking\BlockSync;
use App\Support\Stats\UsageStats;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    /** @var list<string>|null */
    private ?array $stopped = null;

    public function __construct(private BlockSync $blocks) {}

    /** Lista paginada de clientes, com busca e filtro por situação. */
    public function index(ClientIndexRequest $request): JsonResponse
    {
        $page = Client::query()
            ->with('domains')
            ->when($request->search(), fn (Builder $query, string $term) => $query->search($term))
            ->when($request->status(), fn (Builder $query, ClientStatus $status) => $query->withStatus($status))
            ->orderBy('name')
            ->orderBy('id')
            ->paginate($request->perPage());

        return response()->json([
            'data' => $page->getCollection()->map(fn (Client $client) => $this->present($client))->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'last_page' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($this->present($client->load('domains'), withEvents: true));
    }

    public function store(ClientRequest $request): JsonResponse
    {
        $client = DB::transaction(function () use ($request) {
            $client = Client::create($request->safe()->except('domains'));
            $this->syncDomains($client, $request->validated('domains'));

            return $client;
        });

        return response()->json($this->present($client->load('domains')), 201);
    }

    public function update(ClientRequest $request, Client $client): JsonResponse
    {
        DB::transaction(function () use ($request, $client) {
            $client->update($request->safe()->except('domains'));
            $this->syncDomains($client, $request->validated('domains'));
        });
        // Domínios ou projeto de um cliente bloqueado podem ter mudado
        $this->syncBlocks();

        return response()->json($this->present($client->load('domains'), withEvents: true));
    }

    /** Bloqueia ("suspended", com motivo), cancela ("cancelled") ou volta para ativo ("active") o cliente. */
    public function status(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(ClientStatus::class)],
            'reason' => ['required_if:status,suspended', 'nullable', Rule::enum(BlockReason::class)],
            'note' => ['nullable', 'string', 'max:500'],
        ], [], ['reason' => 'motivo', 'note' => 'observação']);

        $note = isset($data['note']) && trim($data['note']) !== '' ? trim($data['note']) : null;
        match (ClientStatus::from($data['status'])) {
            ClientStatus::Suspended => $client->block(BlockReason::from($data['reason']), $note, $request->user()),
            ClientStatus::Cancelled => $client->cancel($note, $request->user()),
            ClientStatus::Active => $client->unblock($note, $request->user()),
        };
        $this->syncBlocks();

        return response()->json($this->present($client->load('domains'), withEvents: true));
    }

    /** Remove o cliente e os domínios; as estatísticas por host ficam (somem do painel até o domínio ser recadastrado). */
    public function destroy(Client $client): Response
    {
        $client->delete();
        $this->syncBlocks();

        return response()->noContent();
    }

    public function stats(Request $request, Client $client, UsageStats $stats): JsonResponse
    {
        $data = $request->validate(['period' => ['sometimes', Rule::in(array_keys(UsageStats::PERIODS))]]);

        return response()->json($stats->series($client->load('domains')->hosts(), $data['period'] ?? '7d'));
    }

    /** @param list<string> $hosts */
    private function syncDomains(Client $client, array $hosts): void
    {
        $client->domains()->whereNotIn('host', $hosts)->delete();
        $existing = $client->domains()->pluck('host')->all();
        foreach (array_diff($hosts, $existing) as $host) {
            $client->domains()->create(['host' => $host]);
        }
    }

    /** Aplica o bloqueio na hora; se falhar (pasta sem permissão, por exemplo), o agendador tenta de novo a cada minuto. */
    private function syncBlocks(): void
    {
        try {
            $this->blocks->sync();
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Situação dos containers do projeto: sem projeto (null), rodando, parada agendada ou parados.
     *
     * @return array{state: string, stop_at: string|null}|null
     */
    private function containers(Client $client): ?array
    {
        if ($client->project === null) {
            return null;
        }

        $this->stopped ??= $this->blocks->stoppedProjects();
        if (in_array($client->project, $this->stopped, true)) {
            return ['state' => $client->isBlocked() ? 'stopped' : 'starting', 'stop_at' => null];
        }

        $at = $client->containersStopAt();
        if ($at === null) {
            return ['state' => 'running', 'stop_at' => null];
        }

        return ['state' => $at->isPast() ? 'stopping' : 'scheduled', 'stop_at' => $at->toIso8601String()];
    }

    /** @return array<string, mixed> */
    private function present(Client $client, bool $withEvents = false): array
    {
        $data = [
            'id' => $client->id,
            'name' => $client->name,
            'legal_name' => $client->legal_name,
            'contact_name' => $client->contact_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'plan' => $client->plan,
            'project' => $client->project,
            'notes' => $client->notes,
            'status' => $client->status->value,
            'suspended_at' => $client->suspended_at?->toIso8601String(),
            'block_reason' => $client->block_reason?->value,
            'block_note' => $client->block_note,
            'containers' => $this->containers($client),
            'domains' => $client->domains->map(fn (ClientDomain $domain) => $domain->host)->values(),
            'created_at' => $client->created_at?->toIso8601String(),
        ];

        if ($withEvents) {
            $data['events'] = $client->events()->with('user:id,name')->limit(20)->get()->map(fn (ClientEvent $event) => [
                'action' => $event->action,
                'reason' => $event->reason?->value,
                'note' => $event->note,
                'user' => $event->user?->name,
                'created_at' => $event->created_at?->toIso8601String(),
            ])->values();
        }

        return $data;
    }
}
