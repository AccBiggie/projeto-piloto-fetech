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

    /*
    |--------------------------------------------------------------------------
    | Bloqueio de clientes
    |--------------------------------------------------------------------------
    |
    | O painel grava em "dir" um arquivo vazio por domínio bloqueado (hosts/<domínio>), que o Caddy
    | confere a cada requisição para mostrar a página de suspensão, e a lista dos projetos cujos
    | containers devem ficar parados (parar.txt). Um script na VPS lê essa lista, para e religa os
    | containers e marca em "parados_dir" os projetos que estão parados. Vazio desliga o recurso.
    |
    */

    'bloqueios' => [
        'dir' => env('PAINEL_BLOQUEIOS_DIR', ''),
        'parados_dir' => env('PAINEL_PARADOS_DIR', ''),
        // Dias de bloqueio (manual ou por inadimplência) até os containers do projeto serem parados
        'parar_apos_dias' => (int) env('PAINEL_PARAR_APOS_DIAS', 7),
    ],

    // Fuso em que os dias dos gráficos começam e terminam (as horas são gravadas em UTC)
    'timezone' => env('PAINEL_TIMEZONE', 'America/Sao_Paulo'),

];
