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

    // Faixa da estimativa de investimento, em reais. Mantenha igual a BUDGET_* em QuotePage.tsx.
    public const BUDGET_MIN = 500;

    public const BUDGET_MAX = 50000;

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
            'budget' => ['nullable', 'integer', 'between:'.self::BUDGET_MIN.','.self::BUDGET_MAX],
            'summary' => ['nullable', 'string', 'max:2000'],
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
            'budget' => 'estimativa de investimento',
            'summary' => 'resumo do negócio',
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
            'budget.integer' => 'Informe um valor válido.',
            'budget.between' => sprintf(
                'Escolha um valor entre R$ %s e R$ %s.',
                number_format(self::BUDGET_MIN, 0, ',', '.'),
                number_format(self::BUDGET_MAX, 0, ',', '.'),
            ),
            'phone.regex' => 'Informe um telefone válido.',
            'services.required' => 'Escolha pelo menos um serviço.',
            'services.min' => 'Escolha pelo menos um serviço.',
            'in' => 'Opção inválida.',
            'distinct' => 'Opção repetida.',
        ];
    }
}
