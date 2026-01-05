<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Agency;
use App\Models\Enums\EventStatus;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'date',
        'time_from',
        'time_to',
        'location',
        'required_staff_count',
        'status',
        'agency_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'time_from' => 'datetime:H:i',
            'time_to' => 'datetime:H:i',
            'status' => EventStatus::class,
        ];
    }

    // Relationship: Event belongs to an Agency
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    // Helper methods
    public function isNew(): bool
    {
        return $this->status === EventStatus::NEW;
    }

    public function isStaffing(): bool
    {
        return $this->status === EventStatus::STAFFING;
    }

    public function isReady(): bool
    {
        return $this->status === EventStatus::READY;
    }

    public function isCompleted(): bool
    {
        return $this->status === EventStatus::COMPLETED;
    }

    // Get formatted date and time
    public function getFormattedDateAttribute(): string
    {
        return $this->date->format('d.m.Y');
    }

    public function getFormattedTimeRangeAttribute(): string
    {
        return $this->time_from->format('H:i') . ' - ' . $this->time_to->format('H:i');
    }
}
