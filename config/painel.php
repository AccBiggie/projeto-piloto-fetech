<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Logs de acesso do Caddy
    |--------------------------------------------------------------------------
    |
    | Arquivos de log em JSON (diretiva "log" com "format json") lidos pelo
    | comando painel:importar-acessos. Vários arquivos separados por vírgula.
    | Em produção, a pasta de logs do Caddy é montada só leitura no container.
    |
    */

    'caddy_logs' => array_values(array_filter(array_map('trim', explode(',', (string) env('CADDY_ACCESS_LOGS', ''))))),

    // Dias de estatística guardados; o que for mais antigo é apagado na importação
    'retention_days' => (int) env('PAINEL_RETENTION_DAYS', 400),

    // Fuso em que os dias dos gráficos começam e terminam (as horas são gravadas em UTC)
    'timezone' => env('PAINEL_TIMEZONE', 'America/Sao_Paulo'),

];
