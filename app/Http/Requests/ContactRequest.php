<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:150'],
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:2000'],
            // Honeypot: campo invisível no formulário, só bots preenchem
            'website' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'email' => 'e-mail',
            'subject' => 'assunto',
            'message' => 'mensagem',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'O campo :attribute é obrigatório.',
            'email' => 'Informe um :attribute válido.',
            'max' => 'O campo :attribute deve ter no máximo :max caracteres.',
        ];
    }
}
