<?php

namespace App\Http\Controllers\Panel;

use App\Enums\ClientStatus;
use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientDomain;
use App\Support\Stats\UsageStats;
use Illuminate\Http\JsonResponse;

/** Painel de controle: totais por situação, requisições de todos os sites e os clientes com mais acessos. */
class DashboardController extends Controller
{
    private const DAYS = 30;

    private const TOP = 5;

    public function __invoke(UsageStats $stats): JsonResponse
    {
        $clients = Client::with('domains')->get();
        $hosts = $clients->flatMap->hosts()->values()->all();
        $daily = $stats->dailyByHost($hosts, self::DAYS);

        $counts = $clients->countBy(fn (Client $client) => $client->status->value);
        $summary = ['clients' => $clients->count()];
        foreach (ClientStatus::cases() as $status) {
            $summary[$status->value] = $counts[$status->value] ?? 0;
        }

        $top = $clients
            ->map(function (Client $client) use ($daily) {
                $spark = array_fill(0, self::DAYS, 0);
                foreach ($client->hosts() as $host) {
                    foreach ($daily[$host] ?? [] as $i => $count) {
                        $spark[$i] += $count;
                    }
                }

                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'status' => $client->status->value,
                    'domains' => $client->domains->map(fn (ClientDomain $domain) => $domain->host)->values(),
                    'requests_30d' => array_sum($spark),
                    'spark' => $spark,
                ];
            })
            ->filter(fn (array $row) => $row['requests_30d'] > 0)
            ->sortByDesc('requests_30d')
            ->take(self::TOP)
            ->values();

        return response()->json([
            'summary' => $summary,
            'overview' => $stats->series($hosts, '30d'),
            'top' => $top,
        ]);
    }
}
