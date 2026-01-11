<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventCompensation extends Model
{
    use HasFactory;

    protected $table = 'event_compensation';

    protected $fillable = [
        'event_id',
        'type',
        'amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 2);
    }
}