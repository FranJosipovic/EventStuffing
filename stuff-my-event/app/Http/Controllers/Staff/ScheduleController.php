<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\EventAssignment;
use App\Models\Enums\AssignmentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        // Get all events where user is assigned (accepted) for the entire year
        $assignments = EventAssignment::where('user_id', $user->id)
            ->where('status', AssignmentStatus::ACCEPTED)
            ->with(['event' => function ($query) use ($year) {
                $query->whereYear('date', $year)
                    ->with(['compensation', 'agency'])
                    ->orderBy('date', 'asc');
            }])
            ->get()
            ->filter(function ($assignment) {
                return $assignment->event !== null;
            })
            ->map(function ($assignment) {
                $event = $assignment->event;
                return [
                    'id' => $event->id,
                    'assignment_id' => $assignment->id,
                    'name' => $event->name,
                    'description' => $event->description,
                    'date' => $event->date->format('Y-m-d'),
                    'time_from' => $event->time_from,
                    'time_to' => $event->time_to,
                    'location' => $event->location,
                    'status' => [
                        'value' => $event->status->value,
                        'label' => $event->status->label(),
                        'color' => $event->status->color(),
                    ],
                    'compensation' => $event->compensation ? [
                        'hourly_rate' => $event->compensation->hourly_rate,
                        'total_amount' => $event->compensation->total_amount,
                    ] : null,
                    'agency_name' => $event->agency->name,
                    'assignment_notes' => $assignment->notes,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('staff/schedule', [
            'events' => $assignments,
            'currentYear' => (int) $year,
            'currentMonth' => (int) $month,
            'agency' => $user->agency ? $user->agency->load('owner') : null,
        ]);
    }
}
