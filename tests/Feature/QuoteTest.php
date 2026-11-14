<?php

namespace Tests\Feature;

use Symfony\Component\Mime\Email;
use Tests\TestCase;

class QuoteTest extends TestCase
{
    private array $payload = [
        'name' => 'Maria Souza',
        'email' => 'maria@example.com',
        'phone' => '(44) 99883-3731',
        'services' => ['loja-virtual', 'email-profissional'],
        'needs' => ['vender-online', 'sem-dominio'],
        'references' => 'https://exemplo.com.br',
        'budget' => 5000,
        'summary' => 'Loja de roupas com cerca de 200 produtos.',
    ];

    /**
     * @return array<int, Email>
     */
    private function sentMessages(): array
    {
        return array_map(
            fn ($sent) => $sent->getOriginalMessage(),
            iterator_to_array(app('mailer')->getSymfonyTransport()->messages()),
        );
    }

    public function test_sends_quote_with_readable_answers(): void
    {
        config(['mail.contact_to' => 'contato@fetech.local']);

        $this->postJson('/api/orcamento-site', $this->payload)
            ->assertAccepted()
            ->assertJsonPath('message', 'Recebemos seu pedido de orçamento! Vamos analisar suas respostas e retornar em breve.');

        $messages = $this->sentMessages();
        $this->assertCount(1, $messages);
        $this->assertSame('contato@fetech.local', $messages[0]->getTo()[0]->getAddress());
        $this->assertSame('maria@example.com', $messages[0]->getReplyTo()[0]->getAddress());
        $this->assertSame('[Orçamento de site] Maria Souza', $messages[0]->getSubject());

        $body = $messages[0]->getTextBody();
        $this->assertStringContainsString('Telefone: (44) 99883-3731', $body);
        $this->assertStringContainsString('- Loja Virtual', $body);
        $this->assertStringContainsString('- E-mail Profissional', $body);
        $this->assertStringContainsString('- Quero vender pela internet', $body);
        $this->assertStringContainsString('https://exemplo.com.br', $body);
        $this->assertStringContainsString('Estimativa de investimento: até R$ 5.000', $body);
        $this->assertStringContainsString('Loja de roupas com cerca de 200 produtos.', $body);
    }

    public function test_budget_at_maximum_reads_as_or_more(): void
    {
        $this->postJson('/api/orcamento-site', [...$this->payload, 'budget' => 50000])->assertAccepted();

        $this->assertStringContainsString('Estimativa de investimento: R$ 50.000 ou mais', $this->sentMessages()[0]->getTextBody());
    }

    public function test_rejects_budget_outside_range(): void
    {
        $this->postJson('/api/orcamento-site', [...$this->payload, 'budget' => 100])
            ->assertUnprocessable()
            ->assertJsonPath('errors.budget.0', 'Escolha um valor entre R$ 500 e R$ 50.000.');

        $this->postJson('/api/orcamento-site', [...$this->payload, 'budget' => 60000])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['budget']);
    }

    public function test_only_contact_and_services_are_required(): void
    {
        $this->postJson('/api/orcamento-site', [
            'name' => 'João',
            'email' => 'joao@example.com',
            'services' => ['sistema-web'],
        ])->assertAccepted();

        $body = $this->sentMessages()[0]->getTextBody();
        $this->assertStringContainsString('Telefone: não informado', $body);
        $this->assertStringContainsString('(nenhuma opção marcada)', $body);
        $this->assertStringContainsString('Estimativa de investimento: não informada', $body);
    }

    public function test_validates_fields_in_portuguese(): void
    {
        $this->postJson('/api/orcamento-site', ['email' => 'invalido', 'phone' => 'abc'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'phone', 'services'])
            ->assertJsonPath('errors.name.0', 'O campo nome é obrigatório.')
            ->assertJsonPath('errors.phone.0', 'Informe um telefone válido.')
            ->assertJsonPath('errors.services.0', 'Escolha pelo menos um serviço.');

        $this->assertCount(0, $this->sentMessages());
    }

    public function test_rejects_unknown_options(): void
    {
        $this->postJson('/api/orcamento-site', [...$this->payload, 'services' => ['consultoria'], 'needs' => ['qualquer']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['services.0', 'needs.0']);
    }

    public function test_honeypot_submission_is_accepted_but_not_sent(): void
    {
        $this->postJson('/api/orcamento-site', [...$this->payload, 'website' => 'http://spam.example'])
            ->assertAccepted();

        $this->assertCount(0, $this->sentMessages());
    }

    public function test_shares_rate_limit_with_contact_form(): void
    {
        config(['security.rate_limits.contact_per_minute' => 2]);

        $this->postJson('/api/contato', [
            'name' => 'Maria', 'email' => 'maria@example.com', 'subject' => 'Oi', 'message' => 'Olá',
        ])->assertAccepted();
        $this->postJson('/api/orcamento-site', $this->payload)->assertAccepted();

        $this->postJson('/api/orcamento-site', $this->payload)
            ->assertTooManyRequests()
            ->assertHeader('Retry-After');
    }
}
