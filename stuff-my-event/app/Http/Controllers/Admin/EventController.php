<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Event;
use App\Models\Enums\EventStatus;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class EventController extends Controller
{
    public function index(): Response
    {
        $user = auth()->guard()->user();

        $events = Event::where('agency_id', $user->agency_id)
            ->with('agency')
            ->orderBy('date', 'asc')
            ->orderBy('time_from', 'asc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'description' => $event->description,
                    'date' => $event->date->format('Y-m-d'),
                    'formatted_date' => $event->date->format('d.m.Y'),
                    'time_from' => $event->time_from->format('H:i'),
                    'time_to' => $event->time_to->format('H:i'),
                    'time_range' => $event->time_from->format('H:i') . ' - ' . $event->time_to->format('H:i'),
                    'location' => $event->location,
                    'required_staff_count' => $event->required_staff_count,
                    'accepted_staff_count' => $event->getAcceptedStaffCountAttribute(),
                    'status' => $event->status->value,
                    'status_label' => $event->status->label(),
                    'status_color' => $event->status->color(),
                    'agency_id' => $event->agency_id,
                ];
            });

        return Inertia::render('admin/events', [
            'events' => $events,
        ]);
    }

    /**
     * Show the form for creating a new event.
     */
    public function create(): Response
    {
        $user = auth()->guard()->user();

        // Get all available statuses
        $statuses = collect(EventStatus::cases())->map(function ($status) {
            return [
                'value' => $status->value,
                'label' => $status->label(),
            ];
        });

        return Inertia::render('admin/events', [
            'statuses' => $statuses,
            'agency' => [
                'id' => $user->agency_id,
                'name' => $user->agency->name,
            ],
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->guard()->user();

        // Validate the request
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time_from' => ['required', 'date_format:H:i'],
            'time_to' => ['required', 'date_format:H:i', 'after:time_from'],
            'location' => ['required', 'string', 'max:255'],
            'location_latitude' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'location_longitude' => ['nullable', 'numeric', 'min:-180', 'max:180'],
            'required_staff_count' => ['required', 'integer', 'min:1', 'max:100'],
            'wage_amount' => ['nullable', 'numeric', 'min:0'],
            'wage_type' => ['nullable', 'in:fixed,hourly'],
        ], [
            'date.after_or_equal' => 'Event date must be today or in the future.',
            'time_to.after' => 'End time must be after start time.',
            'required_staff_count.min' => 'At least 1 staff member is required.',
            'required_staff_count.max' => 'Maximum 100 staff members allowed.',
            'location_latitude.min' => 'Latitude must be between -90 and 90.',
            'location_latitude.max' => 'Latitude must be between -90 and 90.',
            'location_longitude.min' => 'Longitude must be between -180 and 180.',
            'location_longitude.max' => 'Longitude must be between -180 and 180.',
        ]);

        // Create the event
        $event = Event::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'date' => $validated['date'],
            'time_from' => $validated['time_from'],
            'time_to' => $validated['time_to'],
            'location' => $validated['location'],
            'location_latitude' => $validated['location_latitude'] ?? null,
            'location_longitude' => $validated['location_longitude'] ?? null,
            'required_staff_count' => $validated['required_staff_count'],
            'status' => EventStatus::NEW,
            'agency_id' => $user->agency_id,
        ]);

        // Create compensation if wage data is provided
        if (isset($validated['wage_amount']) && $validated['wage_amount'] > 0) {
            $event->compensation()->create([
                'type' => $validated['wage_type'] ?? 'hourly',
                'amount' => $validated['wage_amount'],
            ]);
        }

        return redirect()->route('admin.events.index')
            ->with('success', 'Event created successfully!');
    }

    public function show(Event $event): Response
    {
        $user = auth()->guard()->user();

        if ($event->agency_id !== $user->agency_id) {
            abort(403, 'Unauthorized access to this event.');
        }

        // Load all relationships
        $event->load([
            'agency',
            'compensation',
            'messages.user.userRole',
            'assignments.user.userRole'
        ]);

        return Inertia::render('admin/event-details', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'date' => $event->date->format('Y-m-d'),
                'formatted_date' => $event->date->format('l, F j, Y'),
                'time_from' => $event->time_from->format('H:i'),
                'time_to' => $event->time_to->format('H:i'),
                'time_range' => $event->time_from->format('H:i') . ' - ' . $event->time_to->format('H:i'),
                'location' => $event->location,
                'location_latitude' => $event->location_latitude,
                'location_longitude' => $event->location_longitude,
                'google_maps_url' => $event->google_maps_url,
                'has_coordinates' => $event->hasCoordinates(),
                'required_staff_count' => $event->required_staff_count,
                'accepted_staff_count' => $event->getAcceptedStaffCountAttribute(),
                'status' => $event->status->value,
                'status_label' => $event->status->label(),
                'status_color' => $event->status->color(),
                'agency_id' => $event->agency_id,
                'created_at' => $event->created_at->format('M d, Y'),
            ],
            'agency' => [
                'id' => $event->agency->id,
                'name' => $event->agency->name,
            ],
            'compensation' => $event->compensation ? [
                'type' => $event->compensation->type,
                'amount' => $event->compensation->amount,
                'formatted_amount' => $event->compensation->formatted_amount,
                'notes' => $event->compensation->notes,
            ] : null,
            'initial_messages' => $event->messages->map(fn($message) => [
                'id' => $message->id,
                'user_id' => $message->user_id,
                'user_name' => $message->user->name,
                'user_role' => $message->user->getRoleValue(),
                'message' => $message->message,
                'created_at' => $message->created_at->diffForHumans(),
                'created_at_full' => $message->created_at->format('M d, Y H:i'),
            ]),
            'assignments' => $event->assignments->map(fn($assignment) => [
                'id' => $assignment->id,
                'user_id' => $assignment->user_id,
                'user_name' => $assignment->user->name,
                'user_role' => $assignment->user->getRoleValue(),
                'status' => $assignment->status->value,
                'notes' => $assignment->notes,
                'responded_at' => $assignment->responded_at ? $assignment->responded_at->format('M d, Y H:i') : null,
            ])
        ]);
    }

    /**
     * Update an event
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        $user = auth()->guard()->user();

        // Check if the event belongs to the user's agency
        if ($event->agency_id !== $user->agency_id) {
            abort(403, 'Unauthorized to update this event.');
        }

        // Validate the request
        $validated = $request->validate([
            'date' => ['sometimes', 'date'],
            'time_from' => ['sometimes', 'date_format:H:i'],
            'time_to' => ['sometimes', 'date_format:H:i'],
            'wage_amount' => ['sometimes', 'numeric', 'min:0'],
            'wage_type' => ['sometimes', 'in:fixed,hourly'],
        ]);

        // Update event fields
        $eventData = [];
        if (isset($validated['date'])) {
            $eventData['date'] = $validated['date'];
        }
        if (isset($validated['time_from'])) {
            $eventData['time_from'] = $validated['time_from'];
        }
        if (isset($validated['time_to'])) {
            $eventData['time_to'] = $validated['time_to'];
        }

        if (!empty($eventData)) {
            $event->update($eventData);
        }

        // Update compensation if wage data is provided
        if (isset($validated['wage_amount']) || isset($validated['wage_type'])) {
            $compensationData = [];
            if (isset($validated['wage_amount'])) {
                $compensationData['amount'] = $validated['wage_amount'];
            }
            if (isset($validated['wage_type'])) {
                $compensationData['type'] = $validated['wage_type'];
            }

            if ($event->compensation) {
                $event->compensation->update($compensationData);
            } else {
                $event->compensation()->create(array_merge([
                    'event_id' => $event->id,
                    'type' => $validated['wage_type'] ?? 'hourly',
                    'amount' => $validated['wage_amount'] ?? 0,
                ], $compensationData));
            }
        }

        return back()->with('success', 'Event updated successfully.');
    }

    /**
     * Delete an event (only by the agency owner)
     */
    public function destroy(Event $event): RedirectResponse
    {
        $user = auth()->guard()->user();

        // Check if the event belongs to the user's agency
        if ($event->agency_id !== $user->agency_id) {
            abort(403, 'Unauthorized to delete this event.');
        }

        // Delete related records first
        $event->messages()->delete();
        $event->assignments()->delete();
        $event->compensation()->delete();
        $event->payments()->delete();

        // Delete the event
        $event->delete();

        return redirect()->route('admin.events.index')
            ->with('success', 'Event deleted successfully.');
    }
}
