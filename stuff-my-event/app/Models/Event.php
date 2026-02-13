<?php

namespace App\Models;

use App\Models\Enums\EventStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'location_latitude',
        'location_longitude',
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
            'location_latitude' => 'decimal:7',
            'location_longitude' => 'decimal:7',
        ];
    }

    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function compensation(): HasOne
    {
        return $this->hasOne(EventCompensation::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(EventMessage::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(EventAssignment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(EventPayment::class);
    }

    // Get assigned staff (all statuses)
    public function assignedStaff(): HasMany
    {
        return $this->hasMany(EventAssignment::class);
    }

    // Get only accepted staff
    public function acceptedStaff(): HasMany
    {
        return $this->hasMany(EventAssignment::class)
            ->where('status', \App\Models\Enums\AssignmentStatus::ACCEPTED);
    }

    // Get only pending assignments
    public function pendingAssignments(): HasMany
    {
        return $this->hasMany(EventAssignment::class)
            ->where('status', \App\Models\Enums\AssignmentStatus::PENDING);
    }

    public function getAcceptedStaffCountAttribute(): int
    {
        return $this->acceptedStaff()->count();
    }

    public function getPendingStaffCountAttribute(): int
    {
        return $this->pendingAssignments()->count();
    }

    public function isFullyStaffed(): bool
    {
        return $this->accepted_staff_count >= $this->required_staff_count;
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

    public function getFormattedDateAttribute(): string
    {
        return $this->date->format('d.m.Y');
    }

    public function getFormattedTimeRangeAttribute(): string
    {
        return $this->time_from->format('H:i') . ' - ' . $this->time_to->format('H:i');
    }

    public function hasCoordinates(): bool
    {
        return $this->location_latitude !== null && $this->location_longitude !== null;
    }

    public function getGoogleMapsUrlAttribute(): ?string
    {
        if (!$this->hasCoordinates()) {
            return null;
        }

        return "https://www.google.com/maps?q={$this->location_latitude},{$this->location_longitude}";
    }
}
