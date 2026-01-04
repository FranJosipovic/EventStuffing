<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Agency;
use App\Models\User;
use App\UserRole;
use Illuminate\Support\Facades\Hash;

class AgencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
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

        $this->command->info('Agency created with 1 owner and 2 staff members!');
        $this->command->info('Owner: owner@agency.com');
        $this->command->info('Staff 1: jane@agency.com');
        $this->command->info('Staff 2: bob@agency.com');
        $this->command->info('Password for all: password');
    }
}
