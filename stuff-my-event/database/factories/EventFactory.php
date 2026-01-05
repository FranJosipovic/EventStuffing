<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Agency;
use App\Models\Enums\EventStatus;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('now', '+2 months');
        $timeFrom = fake()->time('H:i');
        $timeToTimestamp = strtotime($timeFrom) + (3 * 3600); // +3 hours
        $timeTo = date('H:i', $timeToTimestamp);

        return [
            'name' => fake()->randomElement([
                'Corporate Event',
                'Wedding Reception',
                'Birthday Party',
                'Conference',
                'Product Launch',
                'Gala Dinner',
                'Team Building',
                'Trade Show',
            ]),
            'description' => fake()->paragraph(),
            'date' => $date,
            'time_from' => $timeFrom,
            'time_to' => $timeTo,
            'location' => fake()->city() . ', ' . fake()->streetAddress(),
            'required_staff_count' => fake()->numberBetween(2, 15),
            'status' => fake()->randomElement(EventStatus::cases()),
            'agency_id' => Agency::factory(),
        ];
    }
}
