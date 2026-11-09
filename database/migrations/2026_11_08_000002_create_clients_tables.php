<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('plan', 60)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();
        });

        // Endereços do site do cliente, como aparecem no campo "host" do log do Caddy
        Schema::create('client_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('host')->unique();
            $table->timestamps();
        });

        // Requisições agregadas por host e hora (UTC). Guardar pelo host, e não pelo cliente, mantém o
        // histórico de domínios que ainda não foram cadastrados e o preserva se o domínio mudar de cliente.
        Schema::create('request_stats', function (Blueprint $table) {
            $table->id();
            $table->string('host');
            $table->dateTime('hour');
            $table->unsignedInteger('requests')->default(0);
            $table->unsignedInteger('status_2xx')->default(0);
            $table->unsignedInteger('status_3xx')->default(0);
            $table->unsignedInteger('status_4xx')->default(0);
            $table->unsignedInteger('status_5xx')->default(0);
            $table->unsignedBigInteger('bytes')->default(0);
            $table->unsignedBigInteger('duration_ms_total')->default(0);

            $table->unique(['host', 'hour']);
            $table->index('hour');
        });

        // Até onde cada arquivo de log já foi lido (inode + posição), para continuar de lá na próxima execução
        Schema::create('log_cursors', function (Blueprint $table) {
            $table->id();
            $table->string('path')->unique();
            $table->unsignedBigInteger('inode')->nullable();
            $table->unsignedBigInteger('position')->default(0);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_cursors');
        Schema::dropIfExists('request_stats');
        Schema::dropIfExists('client_domains');
        Schema::dropIfExists('clients');
    }
};
