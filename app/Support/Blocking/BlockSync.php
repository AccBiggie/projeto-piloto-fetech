<?php

namespace App\Support\Blocking;

use App\Models\Client;

/**
 * Deixa os arquivos lidos pelo Caddy e pelo script da VPS iguais ao que está no banco:
 *
 * - hosts/<domínio>: um arquivo vazio por domínio bloqueado. O Caddy confere a existência dele a cada
 *   requisição e responde com a página de suspensão, sem precisar de reload.
 * - parar.txt: um projeto (pasta em /opt/clientes) por linha, dos clientes bloqueados há mais de
 *   painel.bloqueios.parar_apos_dias. O script da VPS para esses containers e religa os que saírem da lista.
 *
 * Os domínios de um projeto que o script ainda não religou continuam bloqueados, para o site não voltar
 * com erro enquanto os containers sobem. Idempotente: roda a cada minuto e depois de cada alteração.
 */
class BlockSync
{
    /** Nome aceito para a pasta do projeto (o script da VPS usa a mesma regra). */
    public const PROJECT_PATTERN = '/^[a-z0-9][a-z0-9_-]{0,62}$/';

    public function enabled(): bool
    {
        return $this->dir() !== '';
    }

    /**
     * @return array{hosts: int, stop: int}|null null quando o recurso está desligado
     */
    public function sync(): ?array
    {
        if (! $this->enabled()) {
            return null;
        }

        $stopped = $this->stoppedProjects();
        $hosts = [];
        $stop = [];

        foreach (Client::with('domains')->get() as $client) {
            $pending = $client->project !== null && in_array($client->project, $stopped, true);
            if ($client->isBlocked() || $pending) {
                array_push($hosts, ...$client->hosts());
            }
            if ($client->containersDue()) {
                $stop[] = $client->project;
            }
        }

        $hosts = array_values(array_unique($hosts));
        sort($stop);

        $this->writeHosts($hosts);
        $this->writeAtomic($this->dir().'/parar.txt', $stop === [] ? '' : implode("\n", $stop)."\n");

        return ['hosts' => count($hosts), 'stop' => count($stop)];
    }

    /**
     * Projetos que o script da VPS deixou parados (um arquivo por projeto em parados_dir).
     *
     * @return list<string>
     */
    public function stoppedProjects(): array
    {
        $dir = rtrim((string) config('painel.bloqueios.parados_dir'), '/');
        if ($dir === '' || ! is_dir($dir)) {
            return [];
        }

        $names = array_filter(scandir($dir) ?: [], fn (string $name) => preg_match(self::PROJECT_PATTERN, $name) === 1);

        return array_values($names);
    }

    private function dir(): string
    {
        return rtrim((string) config('painel.bloqueios.dir'), '/');
    }

    /** @param list<string> $hosts */
    private function writeHosts(array $hosts): void
    {
        $dir = $this->dir().'/hosts';
        if (! is_dir($dir) && ! mkdir($dir, 0755, true) && ! is_dir($dir)) {
            throw new \RuntimeException("Não foi possível criar {$dir}.");
        }

        $wanted = array_flip($hosts);
        foreach (scandir($dir) ?: [] as $name) {
            if ($name !== '.' && $name !== '..' && ! isset($wanted[$name])) {
                unlink("{$dir}/{$name}");
            }
        }
        foreach ($hosts as $host) {
            // O host já passou pela validação de domínio do cadastro (sem barra nem "..")
            if (! is_file("{$dir}/{$host}") && file_put_contents("{$dir}/{$host}", '') === false) {
                throw new \RuntimeException("Não foi possível gravar {$dir}/{$host}.");
            }
        }
    }

    private function writeAtomic(string $path, string $content): void
    {
        $tmp = $path.'.tmp';
        if (file_put_contents($tmp, $content) === false || ! rename($tmp, $path)) {
            throw new \RuntimeException("Não foi possível gravar {$path}.");
        }
    }
}
