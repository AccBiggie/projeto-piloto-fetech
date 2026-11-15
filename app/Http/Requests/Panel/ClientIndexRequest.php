<?php

namespace App\Http\Requests\Panel;

use App\Enums\ClientStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Filtros e paginação da listagem de clientes (/painel/api/clientes). */
class ClientIndexRequest extends FormRequest
{
    /** Opções do seletor "por página" do painel. */
    public const PER_PAGE = [10, 25, 50, 100];

    protected function prepareForValidation(): void
    {
        $search = $this->input('search');
        $this->merge(['search' => is_string($search) ? trim($search) : null]);
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(ClientStatus::class)],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', Rule::in(self::PER_PAGE)],
        ];
    }

    public function attributes(): array
    {
        return ['search' => 'busca', 'status' => 'situação', 'per_page' => 'itens por página'];
    }

    public function search(): ?string
    {
        return $this->validated('search') ?: null;
    }

    public function status(): ?ClientStatus
    {
        $status = $this->validated('status');

        return $status ? ClientStatus::from($status) : null;
    }

    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? self::PER_PAGE[0]);
    }
}
