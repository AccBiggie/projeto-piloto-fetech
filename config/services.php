<?php

use App\Support\Recaptcha;

$recaptchaTestEnvironment = in_array(env('APP_ENV', 'production'), ['local', 'development', 'testing'], true);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'recaptcha' => [
        // O par público de testes só é usado no desenvolvimento; produção exige chaves próprias.
        'site_key' => trim((string) env('RECAPTCHA_SITE_KEY', '')) ?: ($recaptchaTestEnvironment ? Recaptcha::TEST_SITE_KEY : ''),
        'secret_key' => trim((string) env('RECAPTCHA_SECRET_KEY', '')) ?: ($recaptchaTestEnvironment ? Recaptcha::TEST_SECRET_KEY : ''),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
