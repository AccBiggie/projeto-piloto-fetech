<?php

namespace App\Models;

use App\Enums\BlockReason;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Registro de bloqueio ou desbloqueio de um cliente. */
#[Fillable(['user_id', 'action', 'reason', 'note'])]
class ClientEvent extends Model
{
    public const BLOCKED = 'blocked';

    public const UNBLOCKED = 'unblocked';

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
