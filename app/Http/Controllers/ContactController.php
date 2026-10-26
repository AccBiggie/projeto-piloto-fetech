<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(ContactRequest $request): JsonResponse
    {
        $response = response()->json([
            'message' => 'Recebemos sua mensagem, agradecemos o contato e logo responderemos!',
        ], 202);

        // Bot preencheu o honeypot: responde igual para não revelar o filtro
        if ($request->filled('website')) {
            return $response;
        }

        $data = $request->safe()->except('website');

        Mail::raw(
            "Nome: {$data['name']}\nE-mail: {$data['email']}\n\n{$data['message']}",
            function (Message $mail) use ($data) {
                $mail->to(config('mail.contact_to'))
                    ->replyTo($data['email'], $data['name'])
                    ->subject('[Contato do site] '.$data['subject']);
            },
        );

        return $response;
    }
}
