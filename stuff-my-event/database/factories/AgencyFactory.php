<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Enums\UserRole;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agency>
 */
class AgencyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'description' => fake()->paragraph(),
            'company_location' => fake()->city() . ', ' . fake()->country(),
            'owner_id' => User::factory()->state([
                'role' => UserRole::AGENCY_OWNER,
            ]),
        ];
    }

    /**
     * Configure the factory to set up the owner relationship properly
     */
    public function configure()
    {
        return $this->afterCreating(function ($agency) {
            // Update the owner's agency_id to link them to this agency
            $agency->owner->update(['agency_id' => $agency->id]);
        });
    }
}
