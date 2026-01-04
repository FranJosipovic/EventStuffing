<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'company_location',
        'owner_id',
    ];

    // One-to-one: Agency belongs to one owner
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // One-to-many: Agency has many members (staff)
    public function members(): HasMany
    {
        return $this->hasMany(User::class, 'agency_id');
    }

    // Get all users (owner + members)
    public function allUsers(): HasMany
    {
        return $this->hasMany(User::class, 'agency_id');
    }

    // Get only staff members (excluding owner if needed)
    public function staffMembers(): HasMany
    {
        return $this->hasMany(User::class, 'agency_id')
                    ->where('id', '!=', $this->owner_id);
    }
}
