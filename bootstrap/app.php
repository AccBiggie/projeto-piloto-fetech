<?php

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Os contadores ficam no cache (Redis via CACHE_STORE), compartilhados entre todos os workers do PHP-FPM
        $middleware->throttleApi();
        // Visitante sem login no painel vai para a tela de login; logado que abre o login vai para o painel
        $middleware->redirectGuestsTo('/painel/login');
        $middleware->redirectUsersTo('/painel');
        $middleware->web(append: [
            'throttle:web',
            SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
