<?php

namespace App\Enums;

/** Por que o cliente foi bloqueado. O controle de faturas usa Nonpayment; o botão do painel, Manual ou Nonpayment. */
enum BlockReason: string
{
    case Manual = 'manual';
    case Nonpayment = 'nonpayment';

    public function label(): string
    {
        return match ($this) {
            self::Manual => 'Bloqueio manual',
            self::Nonpayment => 'Inadimplência',
        };
    }
}
