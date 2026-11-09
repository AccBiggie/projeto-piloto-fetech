<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * O painel só abre depois que o administrador confirmou o app autenticador. Sem isso, a API
 * responde 403 com o código "two_factor_required" e o React leva para a configuração do 2FA.
 */
class EnsureTwoFactorEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->hasConfirmedTwoFactor()) {
            return response()->json([
                'message' => 'Configure a autenticação em dois fatores para acessar o painel.',
                'code' => 'two_factor_required',
            ], 403);
        }

        return $next($request);
    }
}
