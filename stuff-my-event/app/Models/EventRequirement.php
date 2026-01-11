<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'clothing_requirements',
        'special_instructions',
        'arrival_time',
        'meeting_point',
        'equipment_needed',
        'other_notes',
    ];

    protected function casts(): array
    {
        return [
            'arrival_time' => 'datetime:H:i',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}