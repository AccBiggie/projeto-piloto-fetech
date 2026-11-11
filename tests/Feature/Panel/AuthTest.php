<?php

namespace Tests\Feature\Panel;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use PanelTestHelpers, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        config([
            'app.url' => 'http://localhost',
            'services.recaptcha.site_key' => 'test-site-key',
            'services.recaptcha.secret_key' => 'test-secret-key',
        ]);
        Http::preventStrayRequests();
        Http::fake(['https://www.google.com/recaptcha/api/siteverify' => Http::response(['success' => true, 'hostname' => 'localhost'])]);
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

    public function test_local_two_factor_qr_code_identifies_homologation(): void
    {
        config(['app.name' => 'Fetech']);
        $user = $this->adminSaved();

        foreach (['local', 'development'] as $environment) {
            $this->app->instance('env', $environment);

            $this->assertTwoFactorQrCodeIssuer($user, 'fetechhomologação');
            $this->assertSame('Fetech', config('app.name'));
        }
    }

    public function test_production_two_factor_qr_code_keeps_application_name(): void
    {
        config(['app.name' => 'Fetech Produção']);
        $this->app->instance('env', 'production');

        $this->assertTwoFactorQrCodeIssuer($this->adminSaved(), 'Fetech Produção');
    }

    public function test_two_factor_qr_code_requires_login_and_recent_password_confirmation(): void
    {
        $this->getJson('/painel/user/two-factor-qr-code')->assertUnauthorized();

        $this->actingAs($this->adminSaved())
            ->getJson('/painel/user/two-factor-qr-code')->assertStatus(423);

        $this->withSession(['auth.password_confirmed_at' => now()->subSeconds((int) config('auth.password_timeout') + 1)->timestamp])
            ->getJson('/painel/user/two-factor-qr-code')->assertStatus(423);
    }

    public function test_two_factor_reset_keeps_password_and_requires_setup_again(): void
    {
        $user = $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);
        $passwordHash = $user->password;

        app(DisableTwoFactorAuthentication::class)($user);
        $user->refresh();

        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_recovery_codes);
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertSame($passwordHash, $user->password);

        $this->postJson('/painel/login', ['email' => $user->email, 'password' => 'Senha-Forte-123', 'g-recaptcha-response' => 'test-captcha-token'])
            ->assertOk()->assertJson(['two_factor' => false]);
        $this->assertAuthenticatedAs($user);

        $this->getJson('/painel/api/sessao')->assertOk()->assertJson(['two_factor_confirmed' => false]);
        $this->getJson('/painel/api/clientes')->assertForbidden()->assertJson(['code' => 'two_factor_required']);
    }

    public function test_login_with_two_factor_requires_the_totp_code(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);

        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123', 'g-recaptcha-response' => 'test-captcha-token'])
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

        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123', 'g-recaptcha-response' => 'test-captcha-token']);
        $this->postJson('/painel/two-factor-challenge', ['recovery_code' => 'recovery-code-1'])->assertNoContent();
        $this->assertAuthenticated();
    }

    public function test_wrong_password_is_rejected_and_throttled(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'errada', 'g-recaptcha-response' => 'test-captcha-token'])->assertUnprocessable();
        }
        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123', 'g-recaptcha-response' => 'test-captcha-token'])->assertTooManyRequests();
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

    private function assertTwoFactorQrCodeIssuer(User $user, string $issuer): void
    {
        $response = $this->actingAs($user)
            ->withSession(['auth.password_confirmed_at' => now()->timestamp])
            ->getJson('/painel/user/two-factor-qr-code')
            ->assertOk();

        $url = $response->json('url');
        parse_str(parse_url($url, PHP_URL_QUERY), $query);

        $this->assertSame($issuer, $query['issuer']);
        $this->assertSame('/'.$issuer.':'.$user->email, rawurldecode(parse_url($url, PHP_URL_PATH)));
        $this->assertStringContainsString('<svg', $response->json('svg'));
    }
}
