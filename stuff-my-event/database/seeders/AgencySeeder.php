<?php

namespace Database\Seeders;

use App\Models\Enums\AssignmentStatus;
use App\Models\Enums\EventStatus;
use App\Models\Enums\UserRole;
use App\Models\Agency;
use App\Models\Event;
use App\Models\EventAssignment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        // Create staff members (increased to 5 for better assignment variety)
        $staffMembers = [
            User::create([
                'name' => 'Jane Smith',
                'email' => 'jane@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ]),
            User::create([
                'name' => 'Bob Johnson',
                'email' => 'bob@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ]),
            User::create([
                'name' => 'Alice Williams',
                'email' => 'alice@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ]),
            User::create([
                'name' => 'Mike Davis',
                'email' => 'mike@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ]),
            User::create([
                'name' => 'Sarah Wilson',
                'email' => 'sarah@agency.com',
                'password' => Hash::make('password'),
                'role' => UserRole::STAFF_MEMBER,
                'agency_id' => $agency->id,
            ]),
        ];

        // Create sample events
        $eventsData = [
            [
                'name' => 'Corporate Annual Meeting',
                'description' => 'Large corporate event with presentations and networking.',
                'date' => now()->addDays(15),
                'time_from' => '09:00',
                'time_to' => '17:00',
                'location' => 'Manhattan Convention Center, New York',
                'location_latitude' => 40.7589,
                'location_longitude' => -73.9851,
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
                'location_latitude' => 40.76637,
                'location_longitude' => -73.97142,
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
                'location_latitude' => 40.75476,
                'location_longitude' => -73.97837,
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
                'location_latitude' => 40.76478,
                'location_longitude' => -73.97435,
                'required_staff_count' => 12,
                'status' => EventStatus::COMPLETED,
                'agency_id' => $agency->id,
            ],
        ];

        $events = [];
        foreach ($eventsData as $eventData) {
            $events[] = Event::create($eventData);
        }

        // Create event assignments for each event
        // Event 1: Corporate Annual Meeting - Mix of all statuses
        EventAssignment::create([
            'event_id' => $events[0]->id,
            'user_id' => $staffMembers[0]->id, // Jane - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'notes' => 'Looking forward to this event!',
            'responded_at' => now()->subDays(2),
        ]);
        EventAssignment::create([
            'event_id' => $events[0]->id,
            'user_id' => $staffMembers[1]->id, // Bob - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'notes' => 'Happy to help!',
            'responded_at' => now()->subDays(1),
        ]);
        EventAssignment::create([
            'event_id' => $events[0]->id,
            'user_id' => $staffMembers[2]->id, // Alice - Pending
            'status' => AssignmentStatus::PENDING,
            'notes' => null,
            'responded_at' => null,
        ]);
        EventAssignment::create([
            'event_id' => $events[0]->id,
            'user_id' => $staffMembers[3]->id, // Mike - Rejected
            'status' => AssignmentStatus::REJECTED,
            'notes' => 'I have a conflict on this date.',
            'responded_at' => now()->subDays(3),
        ]);

        // Event 2: Wedding Reception - More assignments
        EventAssignment::create([
            'event_id' => $events[1]->id,
            'user_id' => $staffMembers[0]->id, // Jane - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(5),
        ]);
        EventAssignment::create([
            'event_id' => $events[1]->id,
            'user_id' => $staffMembers[2]->id, // Alice - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(4),
        ]);
        EventAssignment::create([
            'event_id' => $events[1]->id,
            'user_id' => $staffMembers[3]->id, // Mike - Pending
            'status' => AssignmentStatus::PENDING,
            'responded_at' => null,
        ]);
        EventAssignment::create([
            'event_id' => $events[1]->id,
            'user_id' => $staffMembers[4]->id, // Sarah - Pending
            'status' => AssignmentStatus::PENDING,
            'responded_at' => null,
        ]);
        EventAssignment::create([
            'event_id' => $events[1]->id,
            'user_id' => $staffMembers[1]->id, // Bob - Rejected
            'status' => AssignmentStatus::REJECTED,
            'notes' => 'Already booked for another event.',
            'responded_at' => now()->subDays(6),
        ]);

        // Event 3: Product Launch - Mostly accepted
        EventAssignment::create([
            'event_id' => $events[2]->id,
            'user_id' => $staffMembers[1]->id, // Bob - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(8),
        ]);
        EventAssignment::create([
            'event_id' => $events[2]->id,
            'user_id' => $staffMembers[3]->id, // Mike - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(7),
        ]);
        EventAssignment::create([
            'event_id' => $events[2]->id,
            'user_id' => $staffMembers[4]->id, // Sarah - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(6),
        ]);
        EventAssignment::create([
            'event_id' => $events[2]->id,
            'user_id' => $staffMembers[0]->id, // Jane - Pending
            'status' => AssignmentStatus::PENDING,
            'responded_at' => null,
        ]);

        // Event 4: Charity Gala (completed) - All responded
        EventAssignment::create([
            'event_id' => $events[3]->id,
            'user_id' => $staffMembers[0]->id, // Jane - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(15),
        ]);
        EventAssignment::create([
            'event_id' => $events[3]->id,
            'user_id' => $staffMembers[1]->id, // Bob - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(14),
        ]);
        EventAssignment::create([
            'event_id' => $events[3]->id,
            'user_id' => $staffMembers[2]->id, // Alice - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(13),
        ]);
        EventAssignment::create([
            'event_id' => $events[3]->id,
            'user_id' => $staffMembers[3]->id, // Mike - Rejected
            'status' => AssignmentStatus::REJECTED,
            'notes' => 'Out of town that week.',
            'responded_at' => now()->subDays(12),
        ]);
        EventAssignment::create([
            'event_id' => $events[3]->id,
            'user_id' => $staffMembers[4]->id, // Sarah - Accepted
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now()->subDays(11),
        ]);

        $this->command->info('Agency created successfully!');
        $this->command->info('');
        $this->command->info('Users:');
        $this->command->info('  Owner: owner@agency.com');
        $this->command->info('  Staff: jane@agency.com, bob@agency.com, alice@agency.com, mike@agency.com, sarah@agency.com');
        $this->command->info('  Password for all: password');
        $this->command->info('');
        $this->command->info('Events created: 4');
        $this->command->info('Event assignments created with mixed statuses (pending, accepted, rejected)');
    }
}
