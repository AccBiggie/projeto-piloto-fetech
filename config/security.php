<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Rate Limits
    |--------------------------------------------------------------------------
    |
    | Requisições permitidas por IP. "web" e "api" são por minuto; o
    | formulário de contato tem limite por minuto e por dia.
    |
    */

    'rate_limits' => [
        'web' => (int) env('RATE_LIMIT_WEB', 300),
        'api' => (int) env('RATE_LIMIT_API', 60),
        'contact_per_minute' => (int) env('RATE_LIMIT_CONTACT_MINUTE', 3),
        'contact_per_day' => (int) env('RATE_LIMIT_CONTACT_DAY', 20),
    ],

];
