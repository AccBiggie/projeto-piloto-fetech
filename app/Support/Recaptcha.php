<?php

namespace App\Support;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class Recaptcha
{
    // Chaves públicas de teste do Google: nunca são aceitas em produção.
    public const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    public const TEST_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

    public function verify(string $token): void
    {
        $siteKey = trim((string) config('services.recaptcha.site_key'));
        $secretKey = trim((string) config('services.recaptcha.secret_key'));
        if ($siteKey === '' || $secretKey === '') {
            throw $this->unavailable('missing-configuration');
        }

        $testKeys = $siteKey === self::TEST_SITE_KEY || $secretKey === self::TEST_SECRET_KEY;
        if ($testKeys && (! app()->environment('local', 'development', 'testing') ||
            $siteKey !== self::TEST_SITE_KEY || $secretKey !== self::TEST_SECRET_KEY)) {
            throw $this->unavailable('invalid-test-configuration');
        }

        $hostname = parse_url((string) config('app.url'), PHP_URL_HOST);
        if (! $testKeys && (! is_string($hostname) || $hostname === '')) {
            throw $this->unavailable('missing-hostname');
        }

        try {
            $response = Http::asForm()->acceptJson()->connectTimeout(3)->timeout(8)
                ->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secretKey,
                    'response' => $token,
                ]);
        } catch (ConnectionException) {
            // A exceção pode conter o corpo da requisição: registre apenas a causa sanitizada.
            throw $this->unavailable('connection-failure');
        }

        if (! $response->successful()) {
            throw $this->unavailable('http-failure');
        }

        $data = $response->json();
        if (! is_array($data) || ! array_key_exists('success', $data) || ! is_bool($data['success'])) {
            throw $this->unavailable('invalid-response');
        }

        if (! $data['success']) {
            $errors = $data['error-codes'] ?? [];
            if (is_array($errors) && array_intersect(['missing-input-secret', 'invalid-input-secret', 'bad-request'], $errors)) {
                throw $this->unavailable('invalid-configuration');
            }

            throw $this->invalidToken();
        }

        if (! isset($data['hostname']) || ! is_string($data['hostname']) || $data['hostname'] === '') {
            throw $this->unavailable('missing-response-hostname');
        }

        if (! $testKeys && strtolower($data['hostname']) !== strtolower($hostname)) {
            throw $this->invalidToken();
        }
    }

    private function invalidToken(): ValidationException
    {
        return ValidationException::withMessages([
            'g-recaptcha-response' => 'Verificação inválida ou expirada. Confirme novamente que você não é um robô.',
        ]);
    }

    private function unavailable(string $reason): ServiceUnavailableHttpException
    {
        Log::warning('Não foi possível validar o reCAPTCHA do login.', ['reason' => $reason]);

        return new ServiceUnavailableHttpException(null, 'Não foi possível verificar o reCAPTCHA. Tente novamente em instantes.');
    }
}
