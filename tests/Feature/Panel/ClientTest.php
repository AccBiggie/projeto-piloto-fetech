<?php

namespace Tests\Feature\Panel;

use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use PanelTestHelpers, RefreshDatabase;

    public function test_creates_client_with_normalized_domains(): void
    {
        $this->actingAs($this->adminSaved())
            ->postJson('/painel/api/clientes', [
                'name' => 'Padaria Central',
                'email' => 'contato@padaria.com.br',
                'domains' => ['https://WWW.Padaria.com.br/', 'padaria.com.br', 'padaria.com.br', ''],
            ])
            ->assertCreated()
            ->assertJson(['name' => 'Padaria Central', 'status' => 'active', 'domains' => ['padaria.com.br', 'www.padaria.com.br']]);
    }

    public function test_domain_cannot_belong_to_two_clients(): void
    {
        $admin = $this->adminSaved();
        $other = Client::factory()->create();
        $other->domains()->create(['host' => 'loja.com.br']);

        $this->actingAs($admin)
            ->postJson('/painel/api/clientes', ['name' => 'Outro', 'domains' => ['loja.com.br']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('domains.0');

        // O próprio cliente pode manter o domínio ao ser editado
        $this->actingAs($admin)
            ->putJson("/painel/api/clientes/{$other->id}", ['name' => 'Renomeado', 'domains' => ['loja.com.br', 'nova.com.br']])
            ->assertOk()
            ->assertJson(['name' => 'Renomeado', 'domains' => ['loja.com.br', 'nova.com.br']]);
    }

    public function test_rejects_invalid_domain(): void
    {
        $this->actingAs($this->adminSaved())
            ->postJson('/painel/api/clientes', ['name' => 'X', 'domains' => ['nao é domínio']])
            ->assertJsonValidationErrors('domains.0');
    }

    public function test_blocks_and_unblocks_client(): void
    {
        $admin = $this->adminSaved();
        $client = Client::factory()->create();

        $this->actingAs($admin)->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'suspended'])
            ->assertJsonValidationErrors('reason');

        $this->actingAs($admin)->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'suspended', 'reason' => 'manual'])
            ->assertOk()->assertJson(['status' => 'suspended', 'block_reason' => 'manual']);
        $this->assertNotNull($client->fresh()->suspended_at);

        $this->actingAs($admin)->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'active'])
            ->assertOk()->assertJson(['status' => 'active', 'suspended_at' => null, 'block_reason' => null]);

        $this->actingAs($admin)->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'qualquer'])
            ->assertUnprocessable();
    }

    public function test_lists_clients_with_last_30_days_usage(): void
    {
        $this->travelTo(now()->setTimezone('America/Sao_Paulo')->setTime(15, 30));
        $client = Client::factory()->create(['name' => 'Cliente A']);
        $client->domains()->create(['host' => 'a.com.br']);
        DB::table('request_stats')->insert([
            ['host' => 'a.com.br', 'hour' => now()->utc()->subDay()->startOfHour(), 'requests' => 40, 'status_2xx' => 40],
            // Hoje ainda está em andamento: fica fora da série
            ['host' => 'a.com.br', 'hour' => now()->utc()->startOfHour(), 'requests' => 5, 'status_2xx' => 5],
            ['host' => 'a.com.br', 'hour' => now()->utc()->subDays(40)->startOfHour(), 'requests' => 999, 'status_2xx' => 999],
            ['host' => 'outro.com.br', 'hour' => now()->utc()->startOfHour(), 'requests' => 7, 'status_2xx' => 7],
        ]);

        $response = $this->actingAs($this->adminSaved())->getJson('/painel/api/clientes')->assertOk();

        $response->assertJsonPath('clients.0.requests_30d', 40)
            ->assertJsonPath('summary.clients', 1)
            ->assertJsonPath('overview.totals.requests', 40);
        $this->assertCount(30, $response->json('clients.0.spark'));
        $this->assertSame(40, $response->json('clients.0.spark.29'));
    }

    public function test_client_stats_by_period(): void
    {
        $this->travelTo(now()->setTimezone('America/Sao_Paulo')->setTime(15, 30));
        $client = Client::factory()->create();
        $client->domains()->create(['host' => 'a.com.br']);
        DB::table('request_stats')->insert([
            'host' => 'a.com.br', 'hour' => now()->utc()->subDay()->startOfHour(),
            'requests' => 10, 'status_2xx' => 8, 'status_5xx' => 2, 'bytes' => 1000, 'duration_ms_total' => 500,
        ]);
        $admin = $this->adminSaved();

        // 24 horas completas: a hora de ontem às 15h é a primeira da janela (15h de ontem até 15h de hoje)
        $this->actingAs($admin)->getJson("/painel/api/clientes/{$client->id}/estatisticas?period=24h")
            ->assertOk()
            ->assertJsonCount(24, 'points')
            ->assertJsonPath('granularity', 'hour')
            ->assertJsonPath('points.0.requests', 10)
            ->assertJsonPath('totals.error_rate', 20)
            ->assertJsonPath('totals.avg_ms', 50);

        $this->actingAs($admin)->getJson("/painel/api/clientes/{$client->id}/estatisticas?period=90d")
            ->assertOk()->assertJsonCount(90, 'points')->assertJsonPath('points.89.requests', 10);

        $this->actingAs($admin)->getJson("/painel/api/clientes/{$client->id}/estatisticas?period=1y")->assertUnprocessable();
    }

    public function test_deletes_client(): void
    {
        $client = Client::factory()->create();
        $client->domains()->create(['host' => 'a.com.br']);

        $this->actingAs($this->adminSaved())->deleteJson("/painel/api/clientes/{$client->id}")->assertNoContent();
        $this->assertDatabaseMissing('client_domains', ['host' => 'a.com.br']);
    }
}
