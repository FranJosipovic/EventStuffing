<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Event;
use App\Models\User;
use App\Models\Enums\AssignmentStatus;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EventAssignment>
 */
class EventAssignmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'user_id' => User::factory(),
            'status' => fake()->randomElement(AssignmentStatus::cases()),
            'notes' => fake()->optional()->sentence(),
            'responded_at' => fake()->optional()->dateTimeBetween('-1 week', 'now'),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => AssignmentStatus::PENDING,
            'responded_at' => null,
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => AssignmentStatus::ACCEPTED,
            'responded_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => AssignmentStatus::REJECTED,
            'responded_at' => now(),
        ]);
    }
}
