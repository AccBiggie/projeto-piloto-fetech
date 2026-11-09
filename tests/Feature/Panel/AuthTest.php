<?php

namespace Tests\Feature\Panel;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use PanelTestHelpers, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_panel_shell_is_not_indexed(): void
    {
        $this->get('/painel/login')
            ->assertOk()
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }

    public function test_passwords_are_hashed_with_argon2id(): void
    {
        $user = User::factory()->create(['password' => 'Senha-Forte-123']);

        $this->assertStringStartsWith('$argon2id$', $user->password);
        $this->assertTrue(Hash::check('Senha-Forte-123', $user->password));
    }

    public function test_guest_cannot_use_the_api(): void
    {
        $this->getJson('/painel/api/sessao')->assertUnauthorized();
        $this->getJson('/painel/api/clientes')->assertUnauthorized();
    }

    public function test_admin_without_two_factor_must_set_it_up_first(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/painel/api/sessao')
            ->assertOk()
            ->assertJson(['two_factor_confirmed' => false]);

        $this->actingAs($user)->getJson('/painel/api/clientes')
            ->assertForbidden()
            ->assertJson(['code' => 'two_factor_required']);
    }

    public function test_login_with_two_factor_requires_the_totp_code(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);

        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123'])
            ->assertOk()
            ->assertJson(['two_factor' => true]);
        $this->assertGuest();

        $this->postJson('/painel/two-factor-challenge', ['code' => '000000'])->assertUnprocessable();
        $this->assertGuest();

        $this->postJson('/painel/two-factor-challenge', ['code' => $this->totp()])->assertNoContent();
        $this->assertAuthenticated();
        $this->getJson('/painel/api/clientes')->assertOk();
    }

    public function test_recovery_code_logs_in_once(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);

        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);
        $this->postJson('/painel/two-factor-challenge', ['recovery_code' => 'recovery-code-1'])->assertNoContent();
        $this->assertAuthenticated();
    }

    public function test_wrong_password_is_rejected_and_throttled(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'errada'])->assertUnprocessable();
        }
        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123'])->assertTooManyRequests();
        $this->assertGuest();
    }

    public function test_public_registration_does_not_exist(): void
    {
        $payload = ['name' => 'X', 'email' => 'x@x.com', 'password' => 'Senha-Forte-123', 'password_confirmation' => 'Senha-Forte-123'];

        // Só o fallback (GET) casa com esses caminhos: 404 ou 405, e nenhum usuário é criado
        foreach (['/painel/register', '/register'] as $path) {
            $this->assertContains($this->postJson($path, $payload)->status(), [404, 405]);
        }
        $this->assertDatabaseCount('users', 0);
    }

    public function test_create_user_command_stores_argon2id_hash(): void
    {
        $this->artisan('painel:usuario', ['email' => 'Novo@Fetech.systems', '--name' => 'Novo'])
            ->expectsQuestion('Senha', 'Senha-Forte-123!')
            ->assertSuccessful();

        $user = User::firstWhere('email', 'novo@fetech.systems');
        $this->assertNotNull($user);
        $this->assertStringStartsWith('$argon2id$', $user->password);
        $this->assertFalse($user->hasConfirmedTwoFactor());
    }
}
