<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Pasta do projeto Docker do cliente em /opt/clientes (só o nome); vazio = sem containers para parar
            $table->string('project', 63)->nullable()->unique()->after('plan');
            // Motivo e observação do bloqueio atual (suspended_at guarda desde quando)
            $table->string('block_reason', 20)->nullable()->after('suspended_at');
            $table->string('block_note', 500)->nullable()->after('block_reason');
        });

        // Histórico de bloqueios e desbloqueios: quem, quando e por quê
        Schema::create('client_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 20);
            $table->string('reason', 20)->nullable();
            $table->string('note', 500)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['client_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_events');

        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique(['project']);
            $table->dropColumn(['project', 'block_reason', 'block_note']);
        });
    }
};
