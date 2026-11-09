<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Estatísticas do painel: lê as linhas novas dos logs do Caddy a cada minuto
Schedule::command('painel:importar-acessos')->everyMinute()->withoutOverlapping(10);

// Bloqueio de clientes: domínios bloqueados no Caddy e containers a parar depois do prazo
Schedule::command('painel:sincronizar-bloqueios')->everyMinute()->withoutOverlapping(10);
