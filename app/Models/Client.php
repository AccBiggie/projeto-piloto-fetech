<?php

namespace App\Models;

use App\Enums\ClientStatus;
use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'contact_name', 'email', 'phone', 'plan', 'notes'])]
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
        ];
    }

    /** @return HasMany<ClientDomain, $this> */
    public function domains(): HasMany
    {
        return $this->hasMany(ClientDomain::class)->orderBy('host');
    }

    public function setStatus(ClientStatus $status): void
    {
        $this->status = $status;
        $this->suspended_at = $status === ClientStatus::Suspended ? ($this->suspended_at ?? now()) : null;
        $this->save();
    }

    /** @return list<string> */
    public function hosts(): array
    {
        return $this->domains->pluck('host')->all();
    }
}
