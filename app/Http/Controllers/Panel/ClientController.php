<?php

namespace App\Http\Controllers\Panel;

use App\Enums\BlockReason;
use App\Enums\ClientStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Panel\ClientRequest;
use App\Models\Client;
use App\Models\ClientDomain;
use App\Models\ClientEvent;
use App\Support\Blocking\BlockSync;
use App\Support\Stats\UsageStats;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    private const SPARK_DAYS = 30;

    /** @var list<string>|null */
    private ?array $stopped = null;

    public function __construct(private BlockSync $blocks) {}

    /** Lista de clientes com o uso dos últimos 30 dias e o resumo do topo do painel. */
    public function index(UsageStats $stats): JsonResponse
    {
        $clients = Client::with('domains')->orderBy('name')->get();
        $hosts = $clients->flatMap->hosts()->values()->all();
        $daily = $stats->dailyByHost($hosts, self::SPARK_DAYS);

        $rows = $clients->map(function (Client $client) use ($daily) {
            $spark = array_fill(0, self::SPARK_DAYS, 0);
            foreach ($client->hosts() as $host) {
                foreach ($daily[$host] ?? [] as $i => $count) {
                    $spark[$i] += $count;
                }
            }

            return $this->present($client) + [
                'requests_30d' => array_sum($spark),
                'spark' => $spark,
            ];
        });

        return response()->json([
            'clients' => $rows,
            'summary' => [
                'clients' => $clients->count(),
                'active' => $clients->where('status', ClientStatus::Active)->count(),
                'suspended' => $clients->where('status', ClientStatus::Suspended)->count(),
            ],
            'overview' => $stats->series($hosts, '30d'),
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

    /** Bloqueia (status "suspended", com motivo) ou desbloqueia ("active") o site do cliente. */
    public function status(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(ClientStatus::class)],
            'reason' => ['required_if:status,suspended', 'nullable', Rule::enum(BlockReason::class)],
            'note' => ['nullable', 'string', 'max:500'],
        ], [], ['reason' => 'motivo', 'note' => 'observação']);

        $note = isset($data['note']) && trim($data['note']) !== '' ? trim($data['note']) : null;
        if ($data['status'] === ClientStatus::Suspended->value) {
            $client->block(BlockReason::from($data['reason']), $note, $request->user());
        } else {
            $client->unblock($note, $request->user());
        }
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
