<?php

namespace Tests\Feature\Panel;

use App\Enums\BlockReason;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class BlockingTest extends TestCase
{
    use PanelTestHelpers, RefreshDatabase;

    private string $dir;

    private string $stoppedDir;

    protected function setUp(): void
    {
        parent::setUp();

        $base = sys_get_temp_dir().'/painel-bloqueios-'.bin2hex(random_bytes(4));
        $this->dir = "{$base}/painel";
        $this->stoppedDir = "{$base}/parados";
        File::ensureDirectoryExists($this->dir);
        File::ensureDirectoryExists($this->stoppedDir);

        config([
            'painel.bloqueios.dir' => $this->dir,
            'painel.bloqueios.parados_dir' => $this->stoppedDir,
            'painel.bloqueios.parar_apos_dias' => 7,
        ]);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory(dirname($this->dir));

        parent::tearDown();
    }

    private function client(string $project = 'padaria'): Client
    {
        $client = Client::factory()->create(['project' => $project]);
        $client->domains()->create(['host' => "{$project}.com.br"]);
        $client->domains()->create(['host' => "www.{$project}.com.br"]);

        return $client;
    }

    private function stopList(): string
    {
        return (string) file_get_contents("{$this->dir}/parar.txt");
    }

    public function test_blocking_writes_the_domains_for_caddy_and_unblocking_removes_them(): void
    {
        $admin = $this->adminSaved(['name' => 'Ana']);
        $client = $this->client();
        $this->client('outro');

        $this->actingAs($admin)
            ->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'suspended', 'reason' => 'nonpayment', 'note' => 'Fatura de outubro'])
            ->assertOk()
            ->assertJson([
                'status' => 'suspended',
                'block_reason' => 'nonpayment',
                'block_note' => 'Fatura de outubro',
                'containers' => ['state' => 'scheduled'],
                'events' => [['action' => 'blocked', 'reason' => 'nonpayment', 'user' => 'Ana']],
            ]);

        $this->assertFileExists("{$this->dir}/hosts/padaria.com.br");
        $this->assertFileExists("{$this->dir}/hosts/www.padaria.com.br");
        $this->assertFileDoesNotExist("{$this->dir}/hosts/outro.com.br");
        $this->assertSame('', $this->stopList(), 'Containers só param depois do prazo');

        $this->actingAs($admin)
            ->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'active'])
            ->assertOk()
            ->assertJson(['status' => 'active', 'containers' => ['state' => 'running'], 'events' => [['action' => 'unblocked'], ['action' => 'blocked']]]);

        $this->assertSame([], array_values(array_diff(scandir("{$this->dir}/hosts"), ['.', '..'])));
    }

    public function test_containers_are_listed_to_stop_after_the_deadline_for_any_reason(): void
    {
        $manual = $this->client('manual');
        $nonpayment = $this->client('devedor');
        $recent = $this->client('recente');
        $withoutProject = Client::factory()->create();
        $withoutProject->domains()->create(['host' => 'sem-projeto.com.br']);

        $this->travelTo(now()->subDays(8));
        $manual->block(BlockReason::Manual);
        $nonpayment->block(BlockReason::Nonpayment);
        $withoutProject->block(BlockReason::Manual);
        $this->travelBack();
        $recent->block(BlockReason::Nonpayment);

        $this->artisan('painel:sincronizar-bloqueios')->assertSuccessful();

        $this->assertSame("devedor\nmanual\n", $this->stopList());
        $this->assertFileExists("{$this->dir}/hosts/recente.com.br");
        $this->assertFileExists("{$this->dir}/hosts/sem-projeto.com.br");
    }

    public function test_blocking_again_keeps_the_original_deadline(): void
    {
        $client = $this->client();
        $this->travelTo(now()->subDays(8));
        $client->block(BlockReason::Manual);
        $this->travelBack();

        $client->block(BlockReason::Nonpayment, 'Agora por fatura');

        $this->assertTrue($client->fresh()->containersDue());
        $this->assertSame(BlockReason::Nonpayment, $client->fresh()->block_reason);
    }

    public function test_domains_stay_blocked_until_the_vps_restarts_the_containers(): void
    {
        $admin = $this->adminSaved();
        $client = $this->client();
        $this->travelTo(now()->subDays(8));
        $client->block(BlockReason::Nonpayment);
        $this->travelBack();
        touch("{$this->stoppedDir}/padaria"); // o script da VPS parou o projeto

        $this->actingAs($admin)->getJson("/painel/api/clientes/{$client->id}")->assertJsonPath('containers.state', 'stopped');

        $this->actingAs($admin)->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'active'])
            ->assertOk()->assertJsonPath('containers.state', 'starting');
        $this->assertSame('', $this->stopList());
        $this->assertFileExists("{$this->dir}/hosts/padaria.com.br");

        unlink("{$this->stoppedDir}/padaria"); // o script religou
        $this->artisan('painel:sincronizar-bloqueios')->assertSuccessful();
        $this->assertFileDoesNotExist("{$this->dir}/hosts/padaria.com.br");
    }

    public function test_editing_domains_of_a_blocked_client_updates_the_files(): void
    {
        $admin = $this->adminSaved();
        $client = $this->client();
        $client->block(BlockReason::Manual);

        $this->actingAs($admin)
            ->putJson("/painel/api/clientes/{$client->id}", ['name' => $client->name, 'project' => 'padaria', 'domains' => ['padaria.com.br', 'novo.com.br']])
            ->assertOk();

        $this->assertFileExists("{$this->dir}/hosts/novo.com.br");
        $this->assertFileDoesNotExist("{$this->dir}/hosts/www.padaria.com.br");

        $this->actingAs($admin)->deleteJson("/painel/api/clientes/{$client->id}")->assertNoContent();
        $this->assertFileDoesNotExist("{$this->dir}/hosts/novo.com.br");
    }

    public function test_project_must_be_a_folder_name_and_unique(): void
    {
        $admin = $this->adminSaved();
        $this->client('padaria');

        foreach (['../wedding', '/opt/clientes/x', 'com espaço', '-inicio'] as $project) {
            $this->actingAs($admin)
                ->postJson('/painel/api/clientes', ['name' => 'X', 'project' => $project, 'domains' => []])
                ->assertJsonValidationErrors('project');
        }

        $this->actingAs($admin)
            ->postJson('/painel/api/clientes', ['name' => 'X', 'project' => 'Padaria', 'domains' => []])
            ->assertJsonValidationErrors('project');

        $this->actingAs($admin)
            ->postJson('/painel/api/clientes', ['name' => 'X', 'project' => 'Loja_2', 'domains' => []])
            ->assertCreated()->assertJsonPath('project', 'loja_2');
    }

    public function test_sync_is_off_without_directory(): void
    {
        config(['painel.bloqueios.dir' => '']);
        $client = $this->client();

        $this->actingAs($this->adminSaved())
            ->patchJson("/painel/api/clientes/{$client->id}/status", ['status' => 'suspended', 'reason' => 'manual'])
            ->assertOk();

        $this->assertDirectoryDoesNotExist("{$this->dir}/hosts");
        $this->artisan('painel:sincronizar-bloqueios')->assertSuccessful();
    }
}
