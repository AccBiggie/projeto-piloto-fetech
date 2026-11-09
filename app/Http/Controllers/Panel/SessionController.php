<?php

namespace App\Http\Controllers\Panel;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /** Quem está logado e se o 2FA já foi confirmado (o React decide entre o painel e a configuração do 2FA). */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'two_factor_confirmed' => $user->hasConfirmedTwoFactor(),
        ]);
    }
}
