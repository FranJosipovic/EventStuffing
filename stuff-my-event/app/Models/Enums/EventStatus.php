<?php

namespace App\Models\Enums;

enum EventStatus: string
{
    case NEW = 'new';
    case STAFFING = 'staffing';
    case READY = 'ready';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match($this) {
            self::NEW => 'New',
            self::STAFFING => 'Staffing',
            self::READY => 'Ready',
            self::COMPLETED => 'Completed',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::NEW => 'blue',
            self::STAFFING => 'yellow',
            self::READY => 'green',
            self::COMPLETED => 'gray',
        };
    }
}
