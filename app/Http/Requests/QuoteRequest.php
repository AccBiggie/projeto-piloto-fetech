<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuoteRequest extends FormRequest
{
    // Mesmos ids usados no formulário de orçamento (resources/js/pages/QuotePage.tsx)
    public const SERVICES = [
        'criacao-de-sites' => 'Criação de Sites',
        'loja-virtual' => 'Loja Virtual',
        'sistema-web' => 'Sistema Web',
        'hospedagem-de-sites' => 'Hospedagem de Sites',
        'email-profissional' => 'E-mail Profissional',
        'suporte-ti' => 'Suporte e Soluções em TI',
    ];

    public const NEEDS = [
        'pouco-investimento' => 'Tenho pouco orçamento para investir',
        'fortalecer-marca' => 'Quero fortalecer minha marca na internet',
        'blog' => 'Gostaria de ter um blog',
        'divulgar' => 'Pretendo divulgar produtos ou serviços',
        'vender-online' => 'Quero vender pela internet',
        'automatizar' => 'Preciso automatizar processos da empresa',
        'sem-dominio' => 'Não tenho domínio registrado',
        'emails' => 'Preciso de e-mails personalizados',
    ];

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[\d\s()+-]+$/'],
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['string', 'distinct', Rule::in(array_keys(self::SERVICES))],
            'needs' => ['nullable', 'array'],
            'needs.*' => ['string', 'distinct', Rule::in(array_keys(self::NEEDS))],
            'references' => ['nullable', 'string', 'max:2000'],
            'details' => ['nullable', 'string', 'max:2000'],
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
            'phone' => 'telefone',
            'services' => 'serviços',
            'needs' => 'perfil',
            'references' => 'sites de referência',
            'details' => 'detalhes do projeto',
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
            'phone.regex' => 'Informe um telefone válido.',
            'services.required' => 'Escolha pelo menos um serviço.',
            'services.min' => 'Escolha pelo menos um serviço.',
            'in' => 'Opção inválida.',
            'distinct' => 'Opção repetida.',
        ];
    }
}
