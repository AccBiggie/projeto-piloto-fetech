<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;

/**
 * Login do painel administrativo (/painel): e-mail e senha (Argon2id) seguidos do código TOTP.
 * As telas são do React; o Fortify só registra as rotas POST e responde JSON.
 */
class FortifyServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Cinco tentativas por minuto para cada combinação de e-mail e IP, mais um teto por IP
        // contra quem varre vários e-mails.
        RateLimiter::for('login', function (Request $request) {
            $email = Str::transliterate(Str::lower((string) $request->input(Fortify::username())));

            return [
                Limit::perMinute(5)->by('login:'.$email.'|'.$request->ip()),
                Limit::perMinute(20)->by('login-ip:'.$request->ip()),
            ];
        });

        // O código de 6 dígitos tem 1 milhão de combinações: cinco tentativas por minuto por login pendente
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by('two-factor:'.($request->session()->get('login.id') ?: $request->ip()));
        });
    }
}
