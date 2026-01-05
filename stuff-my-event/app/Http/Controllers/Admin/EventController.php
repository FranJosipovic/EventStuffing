<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Event;
use App\Models\Enums\EventStatus;

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
}
