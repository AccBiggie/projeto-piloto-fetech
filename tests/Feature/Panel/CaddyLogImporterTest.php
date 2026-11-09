<?php

namespace Tests\Feature\Panel;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CaddyLogImporterTest extends TestCase
{
    use RefreshDatabase;

    private string $dir;

    private string $log;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dir = sys_get_temp_dir().'/caddy-'.bin2hex(random_bytes(4));
        mkdir($this->dir);
        $this->log = $this->dir.'/access.log';
        config(['painel.caddy_logs' => [$this->log]]);
    }

    protected function tearDown(): void
    {
        array_map('unlink', glob($this->dir.'/*'));
        rmdir($this->dir);

        parent::tearDown();
    }

    private function line(string $host, int $status, string $time = '2026-11-08 13:15:00', int $size = 100): string
    {
        return json_encode([
            'level' => 'info', 'ts' => strtotime($time.' UTC') + 0.123, 'logger' => 'http.log.access',
            'msg' => 'handled request', 'request' => ['host' => $host, 'method' => 'GET', 'uri' => '/'],
            'duration' => 0.05, 'size' => $size, 'status' => $status,
        ])."\n";
    }

    private function stat(string $host, string $hour = '2026-11-08 13:00:00'): ?object
    {
        return DB::table('request_stats')->where('host', $host)->where('hour', $hour)->first();
    }

    public function test_aggregates_by_host_and_hour(): void
    {
        file_put_contents($this->log,
            $this->line('A.com.br:443', 200).$this->line('a.com.br', 404).$this->line('a.com.br', 502)
            .$this->line('b.com.br', 301, '2026-11-08 14:01:00')."lixo que não é json\n");

        $this->artisan('painel:importar-acessos')->assertSuccessful();

        $a = $this->stat('a.com.br');
        $this->assertSame([3, 1, 1, 1, 300, 150], [(int) $a->requests, (int) $a->status_2xx, (int) $a->status_4xx, (int) $a->status_5xx, (int) $a->bytes, (int) $a->duration_ms_total]);
        $this->assertSame(1, (int) $this->stat('b.com.br', '2026-11-08 14:00:00')->status_3xx);
    }

    public function test_only_reads_new_complete_lines(): void
    {
        file_put_contents($this->log, $this->line('a.com.br', 200));
        $this->artisan('painel:importar-acessos');

        // Uma linha nova completa e uma ainda sendo escrita
        $partial = $this->line('a.com.br', 200);
        file_put_contents($this->log, $this->line('a.com.br', 200).substr($partial, 0, 20), FILE_APPEND);
        $this->artisan('painel:importar-acessos');
        $this->assertSame(2, (int) $this->stat('a.com.br')->requests);

        file_put_contents($this->log, substr($partial, 20), FILE_APPEND);
        $this->artisan('painel:importar-acessos');
        $this->assertSame(3, (int) $this->stat('a.com.br')->requests);
    }

    public function test_finishes_rotated_file_before_reading_the_new_one(): void
    {
        file_put_contents($this->log, $this->line('a.com.br', 200));
        $this->artisan('painel:importar-acessos');

        // Linha escrita depois da última leitura, e então o Caddy renomeia o arquivo e abre outro
        file_put_contents($this->log, $this->line('a.com.br', 200), FILE_APPEND);
        rename($this->log, $this->dir.'/access-2026-11-08T13-20-00.000.log');
        file_put_contents($this->log, $this->line('a.com.br', 200));

        $this->artisan('painel:importar-acessos');
        $this->assertSame(3, (int) $this->stat('a.com.br')->requests);
    }

    public function test_missing_log_fails_without_crashing(): void
    {
        config(['painel.caddy_logs' => [$this->dir.'/nao-existe.log']]);

        $this->artisan('painel:importar-acessos')->assertFailed();
    }
}
