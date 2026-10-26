<?php

namespace Tests\Feature;

use Tests\TestCase;

class ContactTest extends TestCase
{
    private array $payload = [
        'name' => 'Maria Souza',
        'email' => 'maria@example.com',
        'subject' => 'Orçamento de notebook',
        'message' => 'Meu notebook não liga.',
    ];

    /**
     * @return array<int, \Symfony\Component\Mime\Email>
     */
    private function sentMessages(): array
    {
        return array_map(
            fn ($sent) => $sent->getOriginalMessage(),
            iterator_to_array(app('mailer')->getSymfonyTransport()->messages()),
        );
    }

    public function test_sends_contact_message(): void
    {
        config(['mail.contact_to' => 'contato@fetech.local']);

        $this->postJson('/api/contato', $this->payload)
            ->assertAccepted()
            ->assertJsonPath('message', 'Recebemos sua mensagem, agradecemos o contato e logo responderemos!');

        $messages = $this->sentMessages();
        $this->assertCount(1, $messages);
        $this->assertSame('contato@fetech.local', $messages[0]->getTo()[0]->getAddress());
        $this->assertSame('maria@example.com', $messages[0]->getReplyTo()[0]->getAddress());
        $this->assertSame('[Contato do site] Orçamento de notebook', $messages[0]->getSubject());
    }

    public function test_validates_fields_in_portuguese(): void
    {
        $this->postJson('/api/contato', ['email' => 'invalido'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message'])
            ->assertJsonPath('errors.name.0', 'O campo nome é obrigatório.')
            ->assertJsonPath('errors.email.0', 'Informe um e-mail válido.');

        $this->assertCount(0, $this->sentMessages());
    }

    public function test_rejects_oversized_message(): void
    {
        $this->postJson('/api/contato', [...$this->payload, 'message' => str_repeat('a', 2001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);
    }

    public function test_honeypot_submission_is_accepted_but_not_sent(): void
    {
        $this->postJson('/api/contato', [...$this->payload, 'website' => 'http://spam.example'])
            ->assertAccepted();

        $this->assertCount(0, $this->sentMessages());
    }

    public function test_contact_is_rate_limited_per_ip(): void
    {
        config(['security.rate_limits.contact_per_minute' => 2]);

        $this->postJson('/api/contato', $this->payload)->assertAccepted();
        $this->postJson('/api/contato', $this->payload)->assertAccepted();

        $this->postJson('/api/contato', $this->payload)
            ->assertTooManyRequests()
            ->assertHeader('Retry-After');

        $this->assertCount(2, $this->sentMessages());
    }
}
