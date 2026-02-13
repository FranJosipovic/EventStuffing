<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAssignment;
use App\Models\Enums\EventStatus;
use App\Models\Enums\AssignmentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->guard()->user();

        // Get activity history - all assignments (accepted, pending, rejected)
        $activityHistory = EventAssignment::where('user_id', $user->id)
            ->with([
                'event' => function ($query) {
                    $query->with(['compensation', 'agency']);
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($assignment) {
                $event = $assignment->event;
                return [
                    'id' => $assignment->id,
                    'event_id' => $event->id,
                    'event_name' => $event->name,
                    'event_description' => $event->description,
                    'event_date' => $event->date->format('Y-m-d'),
                    'event_time_from' => $event->time_from,
                    'event_time_to' => $event->time_to,
                    'event_location' => $event->location,
                    'event_status' => [
                        'value' => $event->status->value,
                        'label' => $event->status->label(),
                        'color' => $event->status->color(),
                    ],
                    'assignment_status' => [
                        'value' => $assignment->status->value,
                        'label' => $assignment->status->label(),
                        'color' => $assignment->status->color(),
                    ],
                    'compensation' => $event->compensation ? [
                        'hourly_rate' => $event->compensation->hourly_rate,
                        'total_amount' => $event->compensation->total_amount,
                    ] : null,
                    'agency_name' => $event->agency->name,
                    'assignment_notes' => $assignment->notes,
                    'applied_at' => $assignment->created_at->format('Y-m-d H:i'),
                    'applied_at_human' => $assignment->created_at->diffForHumans(),
                    'responded_at' => $assignment->responded_at ? $assignment->responded_at->format('Y-m-d H:i') : null,
                    'responded_at_human' => $assignment->responded_at ? $assignment->responded_at->diffForHumans() : null,
                    'days_until' => now()->diffInDays($event->date, false),
                    'is_upcoming' => $event->date >= now(),
                ];
            });

        // Get available events that staff can apply for
        // (events in NEW/STAFFING/READY status that the user is not assigned to or has pending/rejected assignments)
        $availableEvents = Event::whereIn('status', [EventStatus::NEW, EventStatus::STAFFING, EventStatus::READY])
            ->where('date', '>=', now())
            ->whereDoesntHave('assignments', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('status', AssignmentStatus::ACCEPTED);
            })
            ->with(['compensation', 'agency'])
            ->withCount([
                'assignments as accepted_count' => function ($query) {
                    $query->where('status', AssignmentStatus::ACCEPTED);
                },
            ])
            ->orderBy('date', 'asc')
            ->take(10)
            ->get()
            ->map(function ($event) use ($user) {
                // Check if user has any assignment (pending/rejected)
                $userAssignment = $event->assignments()->where('user_id', $user->id)->first();

                return [
                    'id' => $event->id,
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
                    'required_staff_count' => $event->required_staff_count,
                    'accepted_count' => $event->accepted_count,
                    'spots_remaining' => $event->required_staff_count - $event->accepted_count,
                    'compensation' => $event->compensation ? [
                        'hourly_rate' => $event->compensation->hourly_rate,
                        'total_amount' => $event->compensation->total_amount,
                    ] : null,
                    'agency_name' => $event->agency?->name,
                    'days_until' => now()->diffInDays($event->date, false),
                    'user_assignment_status' => $userAssignment ? $userAssignment->status->value : null,
                    'can_apply' => !$userAssignment || $userAssignment->status === AssignmentStatus::REJECTED,
                ];
            });

        return Inertia::render('staff/dashboard', [
            'agency' => $user->agency ? $user->agency->load('owner') : null,
            'activityHistory' => $activityHistory,
            'availableEvents' => $availableEvents,
        ]);
    }
}
