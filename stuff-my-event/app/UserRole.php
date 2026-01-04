<?php

namespace App;

enum UserRole: string
{
    case AGENCY_OWNER = 'agency_owner';
    case STAFF_MEMBER = 'staff_member';

    public function label(): string
    {
        return match($this) {
            self::AGENCY_OWNER => 'Agency Owner',
            self::STAFF_MEMBER => 'Staff Member',
        };
    }
}
