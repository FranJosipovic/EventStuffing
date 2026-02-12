<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAssignment;
use App\Models\EventMessage;
use App\Models\Enums\EventStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;
        
        if (!$agency) {
            return Inertia::render('admin/dashboard', [
                'agency' => null,
                'recentActivities' => [],
                'activeProjects' => [],
                'upcomingProjects' => [],
            ]);
        }

        // Get recent activities (messages and assignments)
        $recentActivities = $this->getRecentActivities($agency->id);
        
        // Get active projects (events in the next 7 days)
        $activeProjects = Event::where('agency_id', $agency->id)
            ->where('date', '>=', now())
            ->where('date', '<=', now()->addDays(7))
            ->where('status', '!=', EventStatus::COMPLETED)
            ->with([
                'assignments.user',
                'compensation',
                'requirements'
            ])
            ->withCount([
                'assignments',
                'assignments as accepted_count' => function ($query) {
                    $query->where('status', \App\Models\Enums\AssignmentStatus::ACCEPTED);
                },
                'assignments as pending_count' => function ($query) {
                    $query->where('status', \App\Models\Enums\AssignmentStatus::PENDING);
                },
                'messages',
            ])
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($event) {
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
                    'pending_count' => $event->pending_count,
                    'assignments_count' => $event->assignments_count,
                    'messages_count' => $event->messages_count,
                    'compensation' => $event->compensation ? [
                        'hourly_rate' => $event->compensation->hourly_rate,
                        'total_amount' => $event->compensation->total_amount,
                    ] : null,
                    'days_until' => now()->diffInDays($event->date, false),
                ];
            });
        
        // Get upcoming projects (events after 7 days)
        $upcomingProjects = Event::where('agency_id', $agency->id)
            ->where('date', '>', now()->addDays(7))
            ->where('status', '!=', EventStatus::COMPLETED)
            ->with([
                'assignments.user',
                'compensation',
            ])
            ->withCount([
                'assignments as accepted_count' => function ($query) {
                    $query->where('status', \App\Models\Enums\AssignmentStatus::ACCEPTED);
                },
            ])
            ->orderBy('date', 'asc')
            ->take(10)
            ->get()
            ->map(function ($event) {
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
                    'compensation' => $event->compensation ? [
                        'hourly_rate' => $event->compensation->hourly_rate,
                        'total_amount' => $event->compensation->total_amount,
                    ] : null,
                    'days_until' => now()->diffInDays($event->date, false),
                ];
            });
        
        // Get pending requests (assignments waiting for approval/response)
        $pendingRequests = EventAssignment::whereHas('event', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->where('status', \App\Models\Enums\AssignmentStatus::PENDING)
            ->with(['event', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'event_id' => $assignment->event_id,
                    'event_name' => $assignment->event->name,
                    'event_date' => $assignment->event->date->format('Y-m-d'),
                    'event_location' => $assignment->event->location,
                    'user_id' => $assignment->user_id,
                    'user_name' => $assignment->user->name,
                    'user_email' => $assignment->user->email,
                    'status' => [
                        'value' => $assignment->status->value,
                        'label' => $assignment->status->label(),
                        'color' => $assignment->status->color(),
                    ],
                    'notes' => $assignment->notes,
                    'created_at' => $assignment->created_at->format('Y-m-d H:i'),
                    'time_ago' => $assignment->created_at->diffForHumans(),
                ];
            });
        
        return Inertia::render('admin/dashboard', [
            'agency' => $agency->load('members'),
            'recentActivities' => $recentActivities,
            'activeProjects' => $activeProjects,
            'upcomingProjects' => $upcomingProjects,
            'pendingRequests' => $pendingRequests,
            'stats' => [
                'total_events' => Event::where('agency_id', $agency->id)->count(),
                'active_events' => Event::where('agency_id', $agency->id)
                    ->whereIn('status', [EventStatus::NEW, EventStatus::STAFFING, EventStatus::READY])
                    ->count(),
                'completed_events' => Event::where('agency_id', $agency->id)
                    ->where('status', EventStatus::COMPLETED)
                    ->count(),
                'total_staff' => $agency->members->count(),
            ],
        ]);
    }

    /**
     * Get recent activities (messages and assignments) for the agency
     */
    private function getRecentActivities($agencyId)
    {
        // Get recent messages
        $messages = EventMessage::whereHas('event', function ($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->with(['event', 'user'])
            ->select('id', 'event_id', 'user_id', 'message', 'created_at')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => 'message_' . $message->id,
                    'type' => 'message',
                    'event_id' => $message->event_id,
                    'event_name' => $message->event->name,
                    'user_name' => $message->user->name,
                    'description' => 'New message on event',
                    'message' => $message->message,
                    'created_at' => $message->created_at,
                    'formatted_date' => $message->created_at->diffForHumans(),
                ];
            });

        // Get recent assignment changes
        $assignments = EventAssignment::whereHas('event', function ($query) use ($agencyId) {
                $query->where('agency_id', $agencyId);
            })
            ->with(['event', 'user'])
            ->select('id', 'event_id', 'user_id', 'status', 'notes', 'updated_at', 'responded_at')
            ->get()
            ->map(function ($assignment) {
                $statusLabel = $assignment->status->label();
                return [
                    'id' => 'assignment_' . $assignment->id,
                    'type' => 'assignment',
                    'event_id' => $assignment->event_id,
                    'event_name' => $assignment->event->name,
                    'user_name' => $assignment->user->name,
                    'description' => "Assignment {$statusLabel}",
                    'status' => [
                        'value' => $assignment->status->value,
                        'label' => $statusLabel,
                        'color' => $assignment->status->color(),
                    ],
                    'notes' => $assignment->notes,
                    'created_at' => $assignment->responded_at ?? $assignment->updated_at,
                    'formatted_date' => ($assignment->responded_at ?? $assignment->updated_at)->diffForHumans(),
                ];
            });

        // Merge and sort by date
        return collect($messages)
            ->merge($assignments)
            ->sortByDesc('created_at')
            ->take(20)
            ->values()
            ->all();
    }
}
