<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['host'])]
class ClientDomain extends Model
{
    /** @return BelongsTo<Client, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Forma em que o host aparece no log do Caddy: minúsculo, sem protocolo, caminho, porta nem ponto final.
     */
    public static function normalize(string $host): string
    {
        $host = strtolower(trim($host));
        $host = preg_replace('#^[a-z][a-z0-9+.-]*://#', '', $host);
        $host = preg_replace('#[/?\#].*$#', '', $host);
        $host = preg_replace('#:\d+$#', '', $host);

        return rtrim($host, '.');
    }
}
