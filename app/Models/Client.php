<?php

namespace App\Models;

use App\Enums\BlockReason;
use App\Enums\ClientStatus;
use Carbon\CarbonInterface;
use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

#[Fillable(['name', 'contact_name', 'email', 'phone', 'plan', 'project', 'notes'])]
class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'active',
    ];

    protected function casts(): array
    {
        return [
            'status' => ClientStatus::class,
            'suspended_at' => 'datetime',
            'block_reason' => BlockReason::class,
        ];
    }

    /** @return HasMany<ClientDomain, $this> */
    public function domains(): HasMany
    {
        return $this->hasMany(ClientDomain::class)->orderBy('host');
    }

    /** @return HasMany<ClientEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(ClientEvent::class)->latest('created_at')->latest('id');
    }

    public function isBlocked(): bool
    {
        return $this->status === ClientStatus::Suspended;
    }

    /**
     * Bloqueia o site: o Caddy passa a mostrar a página de suspensão e, depois do prazo de
     * painel.bloqueios.parar_apos_dias, os containers do projeto são parados. Bloquear quem já está
     * bloqueado só troca o motivo e a observação; o prazo continua contando do primeiro bloqueio.
     */
    public function block(BlockReason $reason, ?string $note = null, ?User $by = null): void
    {
        DB::transaction(function () use ($reason, $note, $by) {
            $this->status = ClientStatus::Suspended;
            $this->suspended_at ??= now();
            $this->block_reason = $reason;
            $this->block_note = $note;
            $this->save();

            $this->events()->create(['user_id' => $by?->id, 'action' => ClientEvent::BLOCKED, 'reason' => $reason, 'note' => $note]);
        });
    }

    public function unblock(?string $note = null, ?User $by = null): void
    {
        if (! $this->isBlocked()) {
            return;
        }

        DB::transaction(function () use ($note, $by) {
            $this->status = ClientStatus::Active;
            $this->suspended_at = null;
            $this->block_reason = null;
            $this->block_note = null;
            $this->save();

            $this->events()->create(['user_id' => $by?->id, 'action' => ClientEvent::UNBLOCKED, 'note' => $note]);
        });
    }

    /** Quando os containers do projeto devem ser parados (null se não está bloqueado ou não tem projeto). */
    public function containersStopAt(): ?CarbonInterface
    {
        if (! $this->isBlocked() || $this->project === null || $this->suspended_at === null) {
            return null;
        }

        return $this->suspended_at->copy()->addDays((int) config('painel.bloqueios.parar_apos_dias'));
    }

    public function containersDue(): bool
    {
        $at = $this->containersStopAt();

        return $at !== null && $at->lessThanOrEqualTo(now());
    }

    /** @return list<string> */
    public function hosts(): array
    {
        return $this->domains->pluck('host')->all();
    }
}
