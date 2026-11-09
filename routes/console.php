<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Estatísticas do painel: lê as linhas novas dos logs do Caddy a cada minuto
Schedule::command('painel:importar-acessos')->everyMinute()->withoutOverlapping(10);
