<?php

namespace App\Console\Commands;

use App\Support\Blocking\BlockSync;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('painel:sincronizar-bloqueios')]
#[Description('Atualiza os domínios bloqueados no Caddy e a lista de containers a parar')]
class SyncBlocks extends Command
{
    public function handle(BlockSync $sync): int
    {
        $result = $sync->sync();
        if ($result === null) {
            $this->components->warn('Bloqueio desligado (PAINEL_BLOQUEIOS_DIR vazio).');

            return self::SUCCESS;
        }

        $this->components->info("{$result['hosts']} domínios bloqueados, {$result['stop']} projetos a parar.");

        return self::SUCCESS;
    }
}
