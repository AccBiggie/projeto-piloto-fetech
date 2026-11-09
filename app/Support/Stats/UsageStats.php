<?php

namespace App\Support\Stats;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Séries de uso montadas a partir de request_stats (gravado por hora, em UTC). O período de 24 horas
 * sai hora a hora; os demais, dia a dia no fuso do painel. Só entram horas e dias completos (a hora ou
 * o dia em andamento pareceria uma queda no fim do gráfico). Buckets sem requisição entram zerados.
 */
class UsageStats
{
    public const PERIODS = ['24h' => 24, '7d' => 7, '30d' => 30, '90d' => 90];

    private const COUNTERS = ['requests', 'status_2xx', 'status_3xx', 'status_4xx', 'status_5xx', 'bytes', 'duration_ms_total'];

    public function __construct(private ?CarbonImmutable $now = null) {}

    /**
     * Série de um conjunto de hosts no período, com os totais e a comparação com o período anterior.
     *
     * @param  list<string>  $hosts
     * @return array{period: string, granularity: string, points: list<array<string, int|string>>, totals: array<string, int|float>, previous_requests: int}
     */
    public function series(array $hosts, string $period): array
    {
        [$start, $end, $granularity, $count] = $this->window($period);
        $length = $end->getTimestamp() - $start->getTimestamp();
        $rows = $this->rows($hosts, $start->subSeconds($length), $end);

        $points = [];
        $cursor = $start;
        for ($i = 0; $i < $count; $i++) {
            $points[$this->bucketKey($cursor, $granularity)] = ['start' => $cursor->toIso8601String()] + array_fill_keys(self::COUNTERS, 0);
            $cursor = $granularity === 'hour' ? $cursor->addHour() : $cursor->addDay();
        }

        $previous = 0;
        foreach ($rows as $row) {
            $hour = CarbonImmutable::parse($row->hour, 'UTC')->setTimezone($this->timezone());
            if ($hour < $start) {
                $previous += (int) $row->requests;

                continue;
            }
            $key = $this->bucketKey($hour, $granularity);
            if (! isset($points[$key])) {
                continue;
            }
            foreach (self::COUNTERS as $counter) {
                $points[$key][$counter] += (int) $row->{$counter};
            }
        }

        $points = array_values($points);
        $totals = array_fill_keys(self::COUNTERS, 0);
        foreach ($points as $point) {
            foreach (self::COUNTERS as $counter) {
                $totals[$counter] += $point[$counter];
            }
        }
        $totals['avg_ms'] = $totals['requests'] > 0 ? round($totals['duration_ms_total'] / $totals['requests'], 1) : 0;
        $totals['error_rate'] = $totals['requests'] > 0 ? round($totals['status_5xx'] / $totals['requests'] * 100, 2) : 0;

        return [
            'period' => $period,
            'granularity' => $granularity,
            'points' => $points,
            'totals' => $totals,
            'previous_requests' => $previous,
        ];
    }

    /**
     * Requisições por dia de cada host nos últimos dias completos (para as minisséries da lista de clientes).
     *
     * @param  list<string>  $hosts
     * @return array<string, list<int>> host => contagem por dia, do mais antigo ao mais recente
     */
    public function dailyByHost(array $hosts, int $days): array
    {
        $today = $this->now()->startOfDay();
        $start = $today->subDays($days);
        $index = [];
        for ($i = 0; $i < $days; $i++) {
            $index[$start->addDays($i)->toDateString()] = $i;
        }

        $result = array_fill_keys($hosts, array_fill(0, $days, 0));
        foreach ($this->rows($hosts, $start, $today) as $row) {
            $day = CarbonImmutable::parse($row->hour, 'UTC')->setTimezone($this->timezone())->toDateString();
            if (isset($index[$day], $result[$row->host])) {
                $result[$row->host][$index[$day]] += (int) $row->requests;
            }
        }

        return $result;
    }

    /** @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: string, 3: int} */
    private function window(string $period): array
    {
        $size = self::PERIODS[$period] ?? throw new \InvalidArgumentException("Período inválido: {$period}");

        if ($period === '24h') {
            $end = $this->now()->startOfHour();

            return [$end->subHours($size), $end, 'hour', $size];
        }

        $end = $this->now()->startOfDay();

        return [$end->subDays($size), $end, 'day', $size];
    }

    /** @param list<string> $hosts */
    private function rows(array $hosts, CarbonImmutable $from, CarbonImmutable $to): iterable
    {
        if ($hosts === []) {
            return [];
        }

        return DB::table('request_stats')
            ->whereIn('host', $hosts)
            ->where('hour', '>=', $from->utc()->format('Y-m-d H:i:s'))
            ->where('hour', '<', $to->utc()->format('Y-m-d H:i:s'))
            ->orderBy('hour')
            ->get();
    }

    private function bucketKey(CarbonImmutable $time, string $granularity): string
    {
        return $granularity === 'hour' ? $time->format('Y-m-d H') : $time->toDateString();
    }

    private function now(): CarbonImmutable
    {
        return ($this->now ?? CarbonImmutable::now())->setTimezone($this->timezone());
    }

    private function timezone(): string
    {
        return config('painel.timezone');
    }
}
