<?php

namespace App\Console\Commands;

use App\Support\Stats\CaddyLogImporter;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('painel:importar-acessos')]
#[Description('Soma as requisições novas dos logs do Caddy nas estatísticas do painel')]
class ImportAccessLogs extends Command
{
    public function handle(CaddyLogImporter $importer): int
    {
        $paths = config('painel.caddy_logs');
        if ($paths === []) {
            $this->components->warn('Nenhum log configurado (CADDY_ACCESS_LOGS).');

            return self::SUCCESS;
        }

        $status = self::SUCCESS;
        foreach ($paths as $path) {
            try {
                $result = $importer->import($path);
                $this->components->info("{$path}: {$result['lines']} linhas, {$result['skipped']} ignoradas, {$result['buckets']} horas atualizadas.");
            } catch (\Throwable $e) {
                report($e);
                $this->components->error($e->getMessage());
                $status = self::FAILURE;
            }
        }

        $cutoff = now()->utc()->subDays(config('painel.retention_days'))->format('Y-m-d H:00:00');
        DB::table('request_stats')->where('hour', '<', $cutoff)->delete();

        return $status;
    }
}
