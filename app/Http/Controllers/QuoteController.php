<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class QuoteController extends Controller
{
    public function store(QuoteRequest $request): JsonResponse
    {
        $response = response()->json([
            'message' => 'Recebemos seu pedido de orçamento! Vamos analisar suas respostas e retornar em breve.',
        ], 202);

        // Bot preencheu o honeypot: responde igual para não revelar o filtro
        if ($request->filled('website')) {
            return $response;
        }

        $data = $request->safe()->except('website');

        $list = fn (array $ids, array $labels) => $ids
            ? implode("\n", array_map(fn ($id) => '- '.$labels[$id], $ids))
            : '- (nenhuma opção marcada)';

        $body = implode("\n", [
            "Nome: {$data['name']}",
            "E-mail: {$data['email']}",
            'Telefone: '.(($data['phone'] ?? null) ?: 'não informado'),
            '',
            'Serviços:',
            $list($data['services'], QuoteRequest::SERVICES),
            '',
            'Com o que se identifica:',
            $list($data['needs'] ?? [], QuoteRequest::NEEDS),
            '',
            'Sites de referência:',
            ($data['references'] ?? null) ?: '(não informado)',
            '',
            'Mais sobre o projeto:',
            ($data['details'] ?? null) ?: '(não informado)',
        ]);

        Mail::raw($body, function (Message $mail) use ($data) {
            $mail->to(config('mail.contact_to'))
                ->replyTo($data['email'], $data['name'])
                ->subject('[Orçamento de site] '.$data['name']);
        });

        return $response;
    }
}
