<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Models\Enums\UserRole;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Enums\AssignmentStatus;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
        'agency_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    // Relationships
    public function userRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // Helper methods
    public function isAgencyOwner(): bool
    {
        // Check both role_id (new) and role enum (old) for backwards compatibility
        if ($this->role_id && $this->userRole) {
            return $this->userRole->name === 'agency_owner';
        }
        return $this->role === UserRole::AGENCY_OWNER;
    }

    public function isStaffMember(): bool
    {
        // Check both role_id (new) and role enum (old) for backwards compatibility
        if ($this->role_id && $this->userRole) {
            return $this->userRole->name === 'staff_member';
        }
        return $this->role === UserRole::STAFF_MEMBER;
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role_id && $this->userRole) {
            return $this->userRole->hasPermission($permission);
        }
        return false;
    }

    public function getRoleName(): string
    {
        if ($this->role_id && $this->userRole) {
            return $this->userRole->label;
        }
        return $this->role?->label() ?? 'Unknown';
    }

    public function getRoleValue(): string
    {
        if ($this->role_id && $this->userRole) {
            return $this->userRole->name;
        }
        return $this->role?->value ?? 'unknown';
    }

    public function ownedAgency(): HasOne
    {
        return $this->hasOne(Agency::class, 'owner_id');
    }

    // Many-to-one: User belongs to an agency
    public function agency(): BelongsTo
    {
        return $this->belongsTo(Agency::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(EventAssignment::class);
    }

    public function eventAssignments(): HasMany
    {
        return $this->hasMany(EventAssignment::class);
    }

    public function acceptedEvents(): HasMany
    {
        return $this->hasMany(EventAssignment::class)
            ->where('status', AssignmentStatus::ACCEPTED);
    }

    public function pendingEvents(): HasMany
    {
        return $this->hasMany(EventAssignment::class)
            ->where('status', AssignmentStatus::PENDING);
    }
}
