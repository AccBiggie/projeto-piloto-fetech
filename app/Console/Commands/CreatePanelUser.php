<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

/**
 * O painel não tem cadastro público: administradores são criados (ou têm a senha trocada) por aqui.
 * O 2FA é configurado pela própria pessoa no primeiro acesso, obrigatório antes de ver o painel.
 */
#[Signature('painel:usuario {email : E-mail do administrador} {--name= : Nome exibido no painel} {--reset-2fa : Desativa o 2FA para ser configurado de novo}')]
#[Description('Cria um administrador do painel ou troca a senha de um existente')]
class CreatePanelUser extends Command
{
    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        if (Validator::make(['email' => $email], ['email' => 'required|email'])->fails()) {
            $this->components->error('E-mail inválido.');

            return self::FAILURE;
        }

        $user = User::firstWhere('email', $email);

        $name = $this->option('name') ?: ($user->name ?? text('Nome', required: true));

        $plain = password(
            label: $user ? 'Nova senha' : 'Senha',
            required: true,
            validate: fn (string $value) => Validator::make(['password' => $value], ['password' => self::passwordRule()])->errors()->first('password') ?: null,
            hint: 'Mínimo de 12 caracteres, com maiúsculas, minúsculas, números e símbolos.',
        );

        $user ??= new User(['email' => $email]);
        $user->name = $name;
        $user->password = $plain; // cast "hashed": Argon2id
        if ($this->option('reset-2fa')) {
            $user->forceFill(['two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null]);
        }
        $user->save();

        $this->components->info("Administrador {$email} salvo. No primeiro acesso a /painel será pedido o app autenticador.");

        return self::SUCCESS;
    }

    public static function passwordRule(): Password
    {
        return Password::min(12)->mixedCase()->numbers()->symbols();
    }
}
