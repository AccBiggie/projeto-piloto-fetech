<?php

namespace App\Http\Requests\Panel;

use App\Models\Client;
use App\Models\ClientDomain;
use App\Support\Blocking\BlockSync;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $domains = collect((array) $this->input('domains', []))
            ->filter(fn ($host) => is_string($host) && trim($host) !== '')
            ->map(fn (string $host) => ClientDomain::normalize($host))
            ->unique()
            ->values()
            ->all();

        $project = $this->input('project');
        $this->merge([
            'domains' => $domains,
            'project' => is_string($project) && trim($project) !== '' ? strtolower(trim($project)) : null,
        ]);
    }

    public function rules(): array
    {
        /** @var Client|null $client */
        $client = $this->route('client');

        return [
            'name' => ['required', 'string', 'max:120'],
            'contact_name' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'plan' => ['nullable', 'string', 'max:60'],
            // Pasta do projeto Docker em /opt/clientes: só o nome, nunca um caminho
            'project' => ['nullable', 'string', 'regex:'.BlockSync::PROJECT_PATTERN, Rule::unique('clients', 'project')->ignore($client?->id)],
            'notes' => ['nullable', 'string', 'max:2000'],
            'domains' => ['array', 'max:20'],
            'domains.*' => [
                'string',
                'max:253',
                // Nome de domínio com pelo menos um ponto (ex.: cliente.com.br, www.cliente.com.br)
                'regex:/^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/',
                Rule::unique('client_domains', 'host')->ignore($client?->id, 'client_id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'domains.*.regex' => 'Domínio inválido: :input.',
            'domains.*.unique' => 'O domínio :input já pertence a outro cliente.',
            'project.regex' => 'Use só letras minúsculas, números, hífen e sublinhado (o nome da pasta em /opt/clientes).',
            'project.unique' => 'Este projeto já pertence a outro cliente.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'contact_name' => 'contato',
            'phone' => 'telefone',
            'plan' => 'plano',
            'project' => 'projeto',
            'notes' => 'observações',
        ];
    }
}
