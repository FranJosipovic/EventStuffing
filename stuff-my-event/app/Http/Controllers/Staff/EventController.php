<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAssignment;
use App\Models\Enums\AssignmentStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display event details
     */
    public function show(Event $event)
    {
        $user = auth()->user();

        // Verify user belongs to the same agency as the event
        if ($user->agency_id !== $event->agency_id) {
            abort(403, 'You do not have access to this event.');
        }

        // Load relationships
        $event->load([
            'compensation',
            'requirements',
            'agency',
            'messages.user',
            'assignments' => function ($query) {
                $query->with('user');
            }
        ]);

        // Get user's assignment if exists
        $userAssignment = $event->assignments()
            ->where('user_id', $user->id)
            ->first();

        return Inertia::render('staff/event-details', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'formatted_date' => $event->date->format('l, F j, Y'),
                'time_from' => $event->time_from,
                'time_to' => $event->time_to,
                'location' => $event->location,
                'location_latitude' => $event->location_latitude,
                'location_longitude' => $event->location_longitude,
                'google_maps_url' => $event->google_maps_url,
                'has_coordinates' => $event->hasCoordinates(),
                'required_staff_count' => $event->required_staff_count,
                'status' => [
                    'value' => $event->status->value,
                    'label' => $event->status->label(),
                    'color' => $event->status->color(),
                ],
                'compensation' => $event->compensation ? [
                    'hourly_rate' => $event->compensation->hourly_rate,
                    'total_amount' => $event->compensation->total_amount,
                    'type' => $event->compensation->type->value,
                ] : null,
                'requirements' => $event->requirements ? [
                    'age_minimum' => $event->requirements->age_minimum,
                    'experience_years' => $event->requirements->experience_years,
                    'skills_required' => $event->requirements->skills_required,
                    'certifications_required' => $event->requirements->certifications_required,
                    'physical_requirements' => $event->requirements->physical_requirements,
                ] : null,
                'agency' => [
                    'id' => $event->agency->id,
                    'name' => $event->agency->name,
                ],
                'accepted_count' => $event->assignments()
                    ->where('status', AssignmentStatus::ACCEPTED)
                    ->count(),
            ],
            'initial_messages' => $event->messages->map(fn($message) => [
                'id' => $message->id,
                'user_id' => $message->user_id,
                'user_name' => $message->user->name,
                'user_role' => $message->user->role->value,
                'message' => $message->message,
                'created_at' => $message->created_at->diffForHumans(),
                'created_at_full' => $message->created_at->format('M d, Y H:i'),
            ]),
            'userAssignment' => $userAssignment ? [
                'id' => $userAssignment->id,
                'status' => [
                    'value' => $userAssignment->status->value,
                    'label' => $userAssignment->status->label(),
                    'color' => $userAssignment->status->color(),
                ],
                'notes' => $userAssignment->notes,
                'responded_at' => $userAssignment->responded_at?->format('Y-m-d H:i'),
                'responded_at_human' => $userAssignment->responded_at?->diffForHumans(),
            ] : null,
        ]);
    }

    /**
     * Apply for an event (create assignment request)
     */
    public function apply(Request $request, Event $event)
    {
        $user = auth()->user();

        // Verify user belongs to the same agency as the event
        if ($user->agency_id !== $event->agency_id) {
            return back()->with('error', 'You cannot apply for events from other agencies.');
        }

        // Check if user already has an assignment for this event
        $existingAssignment = EventAssignment::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingAssignment) {
            // If rejected, allow reapply
            if ($existingAssignment->status === AssignmentStatus::REJECTED) {
                $existingAssignment->update([
                    'status' => AssignmentStatus::PENDING,
                    'notes' => $request->notes,
                    'responded_at' => null,
                ]);

                return back()->with('success', 'Your application has been resubmitted!');
            }

            // If pending or accepted, don't allow
            return back()->with('error', 'You already have an application for this event.');
        }

        // Create new assignment request
        DB::transaction(function () use ($event, $user, $request) {
            EventAssignment::create([
                'event_id' => $event->id,
                'user_id' => $user->id,
                'status' => AssignmentStatus::PENDING,
                'notes' => $request->notes,
                'responded_at' => null,
            ]);
        });

        return back()->with('success', 'Application submitted successfully! Waiting for approval.');
    }

    /**
     * Cancel application (pending assignment)
     */
    public function cancelApplication(Event $event)
    {
        $user = auth()->user();

        $assignment = EventAssignment::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->where('status', AssignmentStatus::PENDING)
            ->first();

        if (!$assignment) {
            return back()->with('error', 'No pending application found.');
        }

        $assignment->delete();

        return back()->with('success', 'Application cancelled successfully.');
    }
}
