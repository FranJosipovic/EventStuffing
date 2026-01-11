<?php

namespace App\Models\Enums;

enum AssignmentStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::ACCEPTED => 'Accepted',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::ACCEPTED => 'green',
            self::REJECTED => 'red',
        };
    }

    public function badge(): string
    {
        return match ($this) {
            self::PENDING => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            self::ACCEPTED => 'bg-green-100 text-green-800 border-green-200',
            self::REJECTED => 'bg-red-100 text-red-800 border-red-200',
        };
    }
}
