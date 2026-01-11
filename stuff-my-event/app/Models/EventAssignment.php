<?php

namespace App\Models;

use App\Models\Enums\AssignmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'notes',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => AssignmentStatus::class,
            'responded_at' => 'datetime',
        ];
    }

    // Relationships
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isPending(): bool
    {
        return $this->status === AssignmentStatus::PENDING;
    }

    public function isAccepted(): bool
    {
        return $this->status === AssignmentStatus::ACCEPTED;
    }

    public function isRejected(): bool
    {
        return $this->status === AssignmentStatus::REJECTED;
    }

    public function accept(?string $notes = null): void
    {
        $this->update([
            'status' => AssignmentStatus::ACCEPTED,
            'notes' => $notes,
            'responded_at' => now(),
        ]);
    }

    public function reject(?string $notes = null): void
    {
        $this->update([
            'status' => AssignmentStatus::REJECTED,
            'notes' => $notes,
            'responded_at' => now(),
        ]);
    }
}
