<?php

namespace Tests\Feature\Panel;

use App\Support\Recaptcha;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class RecaptchaTest extends TestCase
{
    use PanelTestHelpers, RefreshDatabase;

    private const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Http::preventStrayRequests();
        config([
            'app.url' => 'https://www.fetech.systems',
            'services.recaptcha.site_key' => 'test-site-key',
            'services.recaptcha.secret_key' => 'test-secret-key',
        ]);
    }

    public function test_missing_or_malformed_token_does_not_reach_google_or_start_login(): void
    {
        Http::fake();

        $this->postJson('/painel/login', ['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123'])
            ->assertUnprocessable()->assertJsonValidationErrors('g-recaptcha-response');

        foreach ([['invalid'], str_repeat('a', 8193)] as $token) {
            $this->login(['g-recaptcha-response' => $token])
                ->assertUnprocessable()->assertJsonValidationErrors('g-recaptcha-response');
        }

        Http::assertNothingSent();
        $this->assertGuest();
        $this->assertNull(session('login.id'));
    }

    public function test_rejected_and_expired_tokens_block_login(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);
        Http::fake([self::VERIFY_URL => Http::sequence()
            ->push(['success' => false, 'error-codes' => ['invalid-input-response']])
            ->push(['success' => false, 'error-codes' => ['timeout-or-duplicate']])]);

        for ($attempt = 0; $attempt < 2; $attempt++) {
            $this->login()->assertUnprocessable()->assertJsonValidationErrors('g-recaptcha-response');
            $this->assertGuest();
            $this->assertNull(session('login.id'));
        }
    }

    public function test_success_for_another_hostname_is_rejected(): void
    {
        Http::fake([self::VERIFY_URL => Http::response(['success' => true, 'hostname' => 'other.example'])]);

        $this->login()->assertUnprocessable()->assertJsonValidationErrors('g-recaptcha-response');
        $this->assertGuest();
        $this->assertNull(session('login.id'));
    }

    public function test_success_without_a_hostname_is_rejected(): void
    {
        Http::fake([self::VERIFY_URL => Http::response(['success' => true])]);

        $this->login()->assertServiceUnavailable();
        $this->assertGuest();
    }

    public function test_unavailable_google_blocks_login_without_retrying(): void
    {
        Http::fake([self::VERIFY_URL => Http::response('Unavailable', 503)]);

        $this->login()->assertServiceUnavailable();
        Http::assertSentCount(1);
        $this->assertGuest();
        $this->assertNull(session('login.id'));
    }

    public function test_connection_failure_blocks_login(): void
    {
        Http::fake([self::VERIFY_URL => Http::failedConnection()]);

        $this->login()->assertServiceUnavailable();
        $this->assertGuest();
        $this->assertNull(session('login.id'));
    }

    public function test_malformed_responses_and_non_boolean_success_block_login(): void
    {
        Http::fake([self::VERIFY_URL => Http::sequence()
            ->push('invalid json', 200)
            ->push(['success' => 'true', 'hostname' => 'www.fetech.systems'])
            ->push(['hostname' => 'www.fetech.systems'])]);

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->login()->assertServiceUnavailable();
            $this->assertGuest();
            $this->assertNull(session('login.id'));
        }
    }

    public function test_google_configuration_errors_block_login(): void
    {
        Http::fake([self::VERIFY_URL => Http::response(['success' => false, 'error-codes' => ['invalid-input-secret']])]);

        $this->login()->assertServiceUnavailable();
        $this->assertGuest();
    }

    public function test_missing_production_keys_block_login_before_contacting_google(): void
    {
        $this->app->instance('env', 'production');
        config(['services.recaptcha.site_key' => '', 'services.recaptcha.secret_key' => '']);
        Http::fake();

        $this->login()->assertServiceUnavailable();
        Http::assertNothingSent();
        $this->assertGuest();
    }

    public function test_public_test_keys_cannot_be_used_in_production(): void
    {
        $this->app->instance('env', 'production');
        config([
            'services.recaptcha.site_key' => Recaptcha::TEST_SITE_KEY,
            'services.recaptcha.secret_key' => Recaptcha::TEST_SECRET_KEY,
        ]);
        Http::fake();

        $this->login()->assertServiceUnavailable();
        Http::assertNothingSent();
        $this->assertGuest();
    }

    public function test_valid_captcha_preserves_the_two_factor_challenge(): void
    {
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);
        Http::fake([self::VERIFY_URL => Http::response(['success' => true, 'hostname' => 'www.fetech.systems'])]);

        $this->login()->assertOk()->assertJson(['two_factor' => true]);
        $this->assertGuest();
        $this->getJson('/painel/api/clientes')->assertUnauthorized();

        Http::assertSent(fn (Request $request) => $request->url() === self::VERIFY_URL
            && $request->method() === 'POST'
            && $request->hasHeader('Content-Type', 'application/x-www-form-urlencoded')
            && $request['secret'] === 'test-secret-key'
            && $request['response'] === 'valid-captcha-token');
        Http::assertSentCount(1);

        $this->postJson('/painel/two-factor-challenge', ['code' => $this->totp()])->assertNoContent();
        $this->assertAuthenticated();
    }

    public function test_public_test_keys_work_in_local_development(): void
    {
        $this->app->instance('env', 'local');
        config([
            'services.recaptcha.site_key' => Recaptcha::TEST_SITE_KEY,
            'services.recaptcha.secret_key' => Recaptcha::TEST_SECRET_KEY,
        ]);
        $this->adminSaved(['email' => 'admin@fetech.systems', 'password' => 'Senha-Forte-123']);
        Http::fake([self::VERIFY_URL => Http::response(['success' => true, 'hostname' => 'testkey.google.com'])]);

        $this->login()->assertOk()->assertJson(['two_factor' => true]);
        $this->assertGuest();
    }

    public function test_panel_shell_exposes_only_the_public_site_key(): void
    {
        $this->get('/painel/login')->assertOk()
            ->assertSee('<meta name="recaptcha-site-key" content="test-site-key">', false)
            ->assertDontSee('test-secret-key', false);
    }

    private function login(array $overrides = []): TestResponse
    {
        // O token mantém a proteção CSRF ativa mesmo nos testes que simulam production/local.
        return $this->withSession(['_token' => 'csrf-test-token'])->postJson('/painel/login', array_merge([
            '_token' => 'csrf-test-token',
            'email' => 'admin@fetech.systems',
            'password' => 'Senha-Forte-123',
            'g-recaptcha-response' => 'valid-captcha-token',
        ], $overrides));
    }
}
