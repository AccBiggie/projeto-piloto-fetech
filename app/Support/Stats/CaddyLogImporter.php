<?php

namespace App\Support\Stats;

use App\Models\ClientDomain;
use Illuminate\Support\Facades\DB;

/**
 * Lê o log de acesso do Caddy (uma linha JSON por requisição) e soma as requisições por host e hora
 * em request_stats. Guarda em log_cursors até onde cada arquivo foi lido: cada execução só processa
 * as linhas novas, e uma linha incompleta (ainda sendo escrita) fica para a próxima.
 *
 * Quando o Caddy rotaciona o log (renomeia o arquivo e abre um novo), o inode muda: o importador
 * procura na mesma pasta o arquivo antigo pelo inode, termina de lê-lo e começa o novo do início.
 */
class CaddyLogImporter
{
    /** @var array<string, array{host: string, hour: string, requests: int, status_2xx: int, status_3xx: int, status_4xx: int, status_5xx: int, bytes: int, duration_ms_total: int}> */
    private array $buckets = [];

    private int $lines = 0;

    private int $skipped = 0;

    /**
     * @return array{lines: int, skipped: int, buckets: int}
     */
    public function import(string $path): array
    {
        $this->buckets = [];
        $this->lines = 0;
        $this->skipped = 0;

        clearstatcache();
        if (! is_file($path) || ! is_readable($path)) {
            throw new \RuntimeException("Log não encontrado ou sem permissão de leitura: {$path}");
        }

        $cursor = DB::table('log_cursors')->where('path', $path)->first();
        $inode = (int) fileinode($path);
        $position = (int) ($cursor->position ?? 0);

        if ($cursor && $cursor->inode !== null && (int) $cursor->inode !== $inode) {
            // Arquivo rotacionado: termina o antigo, se ainda estiver na pasta e sem compressão
            $rotated = $this->findByInode(dirname($path), (int) $cursor->inode);
            if ($rotated !== null) {
                $this->readFrom($rotated, $position);
            }
            $position = 0;
        } elseif ($position > filesize($path)) {
            // Arquivo truncado no lugar (copytruncate)
            $position = 0;
        }

        $position = $this->readFrom($path, $position);

        DB::transaction(function () use ($path, $inode, $position) {
            $this->flush();
            DB::table('log_cursors')->updateOrInsert(
                ['path' => $path],
                ['inode' => $inode, 'position' => $position, 'updated_at' => now()],
            );
        });

        return ['lines' => $this->lines, 'skipped' => $this->skipped, 'buckets' => count($this->buckets)];
    }

    /** Lê as linhas completas a partir da posição e devolve a posição depois da última. */
    private function readFrom(string $file, int $position): int
    {
        $handle = fopen($file, 'rb');
        if ($handle === false) {
            return $position;
        }

        try {
            fseek($handle, $position);
            while (($line = fgets($handle)) !== false) {
                if (! str_ends_with($line, "\n")) {
                    break; // linha ainda sendo escrita
                }
                $position += strlen($line);
                $this->add($line);
            }
        } finally {
            fclose($handle);
        }

        return $position;
    }

    private function add(string $line): void
    {
        $this->lines++;
        $entry = json_decode($line, true);
        $host = is_array($entry) ? ($entry['request']['host'] ?? null) : null;
        $status = is_array($entry) ? (int) ($entry['status'] ?? 0) : 0;
        $time = is_array($entry) ? $this->timestamp($entry['ts'] ?? null) : null;

        if (! is_string($host) || $host === '' || $status < 100 || $time === null) {
            $this->skipped++;

            return;
        }

        $host = ClientDomain::normalize($host);
        $hour = gmdate('Y-m-d H:00:00', $time);
        $key = $host.'|'.$hour;

        $this->buckets[$key] ??= [
            'host' => $host, 'hour' => $hour, 'requests' => 0,
            'status_2xx' => 0, 'status_3xx' => 0, 'status_4xx' => 0, 'status_5xx' => 0,
            'bytes' => 0, 'duration_ms_total' => 0,
        ];
        $bucket = &$this->buckets[$key];
        $bucket['requests']++;
        $class = intdiv($status, 100);
        if ($class >= 2 && $class <= 5) {
            $bucket["status_{$class}xx"]++;
        }
        $bucket['bytes'] += max(0, (int) ($entry['size'] ?? 0));
        $bucket['duration_ms_total'] += (int) round(max(0, (float) ($entry['duration'] ?? 0)) * 1000);
    }

    /** "ts" vem em segundos (padrão do Caddy) ou como data ISO 8601 (time_format iso8601/rfc3339). */
    private function timestamp(mixed $ts): ?int
    {
        if (is_int($ts) || is_float($ts)) {
            return (int) $ts;
        }
        if (is_string($ts) && $ts !== '') {
            $time = strtotime($ts);

            return $time === false ? null : $time;
        }

        return null;
    }

    /** Soma os totais lidos às linhas existentes (cria a linha da hora se ainda não houver). */
    private function flush(): void
    {
        $columns = ['requests', 'status_2xx', 'status_3xx', 'status_4xx', 'status_5xx', 'bytes', 'duration_ms_total'];

        foreach ($this->buckets as $bucket) {
            DB::table('request_stats')->insertOrIgnore(['host' => $bucket['host'], 'hour' => $bucket['hour']]);

            $increments = [];
            foreach ($columns as $column) {
                $increments[$column] = DB::raw("{$column} + ".(int) $bucket[$column]);
            }
            DB::table('request_stats')
                ->where('host', $bucket['host'])
                ->where('hour', $bucket['hour'])
                ->update($increments);
        }
    }

    private function findByInode(string $dir, int $inode): ?string
    {
        foreach (glob($dir.'/*') ?: [] as $candidate) {
            if (is_file($candidate) && ! str_ends_with($candidate, '.gz') && @fileinode($candidate) === $inode) {
                return $candidate;
            }
        }

        return null;
    }
}
