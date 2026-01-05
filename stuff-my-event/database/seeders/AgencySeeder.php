<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agency;
use App\Models\User;
use App\Models\Enums\UserRole;
use Illuminate\Support\Facades\Hash;
use App\Models\Event;
use App\Models\Enums\EventStatus;

class AgencySeeder extends Seeder
{
    public function run(): void
    {
        // Create the agency owner
        $owner = User::create([
            'name' => 'John Doe',
            'email' => 'owner@agency.com',
            'password' => Hash::make('password'),
            'role' => UserRole::AGENCY_OWNER,
        ]);

        // Create the agency
        $agency = Agency::create([
            'name' => 'Digital Solutions Agency',
            'description' => 'A full-service digital marketing and development agency specializing in web solutions and brand strategy.',
            'company_location' => 'New York, USA',
            'owner_id' => $owner->id,
        ]);

        // Link owner to agency
        $owner->update(['agency_id' => $agency->id]);

        // Create 2 staff members
        $staffMembers = [
            [
                'name' => 'Jane Smith',
                'email' => 'jane@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ],
            [
                'name' => 'Bob Johnson',
                'email' => 'bob@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ],
        ];

        foreach ($staffMembers as $memberData) {
            User::create($memberData);
        }

        // Create sample events
        $events = [
            [
                'name' => 'Corporate Annual Meeting',
                'description' => 'Large corporate event with presentations and networking.',
                'date' => now()->addDays(15),
                'time_from' => '09:00',
                'time_to' => '17:00',
                'location' => 'Manhattan Convention Center, New York',
                'required_staff_count' => 10,
                'status' => EventStatus::NEW,
                'agency_id' => $agency->id,
            ],
            [
                'name' => 'Wedding Reception',
                'description' => 'Elegant wedding reception for 200 guests.',
                'date' => now()->addDays(30),
                'time_from' => '18:00',
                'time_to' => '23:00',
                'location' => 'Grand Hotel Ballroom, New York',
                'required_staff_count' => 8,
                'status' => EventStatus::STAFFING,
                'agency_id' => $agency->id,
            ],
            [
                'name' => 'Product Launch Event',
                'description' => 'Tech product launch with media coverage.',
                'date' => now()->addDays(7),
                'time_from' => '19:00',
                'time_to' => '22:00',
                'location' => 'Tech Hub, Brooklyn',
                'required_staff_count' => 5,
                'status' => EventStatus::READY,
                'agency_id' => $agency->id,
            ],
            [
                'name' => 'Charity Gala',
                'description' => 'Fundraising gala for local charity.',
                'date' => now()->subDays(10),
                'time_from' => '18:00',
                'time_to' => '23:00',
                'location' => 'Plaza Hotel, New York',
                'required_staff_count' => 12,
                'status' => EventStatus::COMPLETED,
                'agency_id' => $agency->id,
            ],
        ];

        foreach ($events as $eventData) {
            Event::create($eventData);
        }

        $this->command->info('Agency created with 1 owner, 2 staff members, and 4 sample events!');
        $this->command->info('Owner: owner@agency.com');
        $this->command->info('Staff 1: jane@agency.com');
        $this->command->info('Staff 2: bob@agency.com');
        $this->command->info('Password for all: password');
    }
}