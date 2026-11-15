<?php

namespace App\Models;

use App\Enums\BlockReason;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Registro de mudança de situação do cliente: bloqueio, desbloqueio, cancelamento ou reativação. */
#[Fillable(['user_id', 'action', 'reason', 'note'])]
class ClientEvent extends Model
{
    public const BLOCKED = 'blocked';

    public const UNBLOCKED = 'unblocked';

    public const CANCELLED = 'cancelled';

    public const REACTIVATED = 'reactivated';

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return ['reason' => BlockReason::class];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
