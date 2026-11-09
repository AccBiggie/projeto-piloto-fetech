<?php

namespace Tests\Feature\Panel;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

trait PanelTestHelpers
{
    protected const SECRET = 'JBSWY3DPEHPK3PXP';

    /** Administrador com o app autenticador já confirmado. */
    protected function admin(array $attributes = []): User
    {
        return User::factory()->create($attributes)->forceFill([
            'two_factor_secret' => encrypt(self::SECRET),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1', 'recovery-code-2'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }

    protected function adminSaved(array $attributes = []): User
    {
        return tap($this->admin($attributes))->save();
    }

    protected function totp(): string
    {
        return (new Google2FA)->getCurrentOtp(self::SECRET);
    }
}
