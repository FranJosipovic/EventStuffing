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

        return Inertia::render('Admin/Events/Create', [
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
            'required_staff_count' => ['required', 'integer', 'min:1', 'max:100'],
        ], [
            'date.after_or_equal' => 'Event date must be today or in the future.',
            'time_to.after' => 'End time must be after start time.',
            'required_staff_count.min' => 'At least 1 staff member is required.',
            'required_staff_count.max' => 'Maximum 100 staff members allowed.',
        ]);

        // Create the event
        $event = Event::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'date' => $validated['date'],
            'time_from' => $validated['time_from'],
            'time_to' => $validated['time_to'],
            'location' => $validated['location'],
            'required_staff_count' => $validated['required_staff_count'],
            'status' => EventStatus::NEW,
            'agency_id' => $user->agency_id,
        ]);

        return redirect()->route('admin.events.index')
            ->with('success', 'Event created successfully!');
    }
}
