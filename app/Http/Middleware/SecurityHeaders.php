<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Content-Security-Policy das páginas HTML. Os demais headers de segurança
 * (nosniff, frame, referrer) são definidos no Nginx para valer também nos estáticos.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        $response = $next($request);

        if (str_contains((string) $response->headers->get('Content-Type'), 'text/html')) {
            $response->headers->set('Content-Security-Policy', $this->policy($request));
        }

        return $response;
    }

    protected function policy(Request $request): string
    {
        $nonce = Vite::cspNonce();
        $scripts = ["'self'", "'nonce-{$nonce}'"];
        $connect = ["'self'"];
        $fonts = ["'self'", 'data:'];
        $frames = [];

        // O reCAPTCHA é carregado pelo login do painel; o site público mantém a política restrita.
        if ($request->is('painel', 'painel/*')) {
            $scripts[] = 'https://www.google.com/recaptcha/';
            $scripts[] = 'https://www.gstatic.com/recaptcha/';
            $connect[] = 'https://www.google.com/recaptcha/';
            $frames = ["'self'", 'https://www.google.com/recaptcha/', 'https://recaptcha.google.com/recaptcha/'];
        }

        // Em desenvolvimento os scripts e as fontes vêm do servidor do Vite (HMR)
        if (Vite::isRunningHot()) {
            $hot = rtrim(file_get_contents(Vite::hotFile()));
            $scripts[] = $hot;
            $fonts[] = $hot;
            $connect[] = $hot;
            $connect[] = preg_replace('#^http#', 'ws', $hot);
        }

        $directives = [
            "default-src 'self'",
            'script-src '.implode(' ', $scripts),
            // O Emotion (MUI) injeta <style> em tempo de execução
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            'font-src '.implode(' ', $fonts),
            'connect-src '.implode(' ', $connect),
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ];

        if ($frames !== []) {
            $directives[] = 'frame-src '.implode(' ', $frames);
        }

        return implode('; ', $directives);
    }
}
