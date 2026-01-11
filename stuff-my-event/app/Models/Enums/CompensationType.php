<?php

namespace App\Models\Enums;

enum CompensationType: string
{
    case HOURLY = 'hourly';
    case FIXED = 'fixed';

    public function label(): string
    {
        return match ($this) {
            self::HOURLY => 'Hourly',
            self::FIXED => 'Fixed',
        };
    }
}
