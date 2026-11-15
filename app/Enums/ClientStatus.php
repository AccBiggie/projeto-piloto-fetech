<?php

namespace App\Enums;

/**
 * Situação do cliente. Bloqueado e Cancelado tiram o site do ar (página de suspensão no Caddy e, depois do
 * prazo, containers parados); a diferença é o motivo: bloqueio é temporário, cancelamento encerra o contrato.
 */
enum ClientStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Ativo',
            self::Suspended => 'Bloqueado',
            self::Cancelled => 'Cancelado',
        };
    }

    /** O site fica fora do ar nesta situação. */
    public function takesSiteDown(): bool
    {
        return $this !== self::Active;
    }
}
