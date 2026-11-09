<?php

namespace App\Http\Controllers\Panel;

use App\Enums\ClientStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Panel\ClientRequest;
use App\Models\Client;
use App\Models\ClientDomain;
use App\Support\Stats\UsageStats;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    private const SPARK_DAYS = 30;

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
        return response()->json($this->present($client->load('domains')));
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

        return response()->json($this->present($client->load('domains')));
    }

    public function status(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::enum(ClientStatus::class)]]);
        $client->setStatus(ClientStatus::from($data['status']));

        return response()->json($this->present($client->load('domains')));
    }

    /** Remove o cliente e os domínios; as estatísticas por host ficam (somem do painel até o domínio ser recadastrado). */
    public function destroy(Client $client): Response
    {
        $client->delete();

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

    /** @return array<string, mixed> */
    private function present(Client $client): array
    {
        return [
            'id' => $client->id,
            'name' => $client->name,
            'contact_name' => $client->contact_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'plan' => $client->plan,
            'notes' => $client->notes,
            'status' => $client->status->value,
            'suspended_at' => $client->suspended_at?->toIso8601String(),
            'domains' => $client->domains->map(fn (ClientDomain $domain) => $domain->host)->values(),
            'created_at' => $client->created_at?->toIso8601String(),
        ];
    }
}
