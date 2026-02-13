<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\EventAssignment;
use App\Models\EventPayment;
use App\Models\Enums\AssignmentStatus;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(): Response
    {
        $user = auth()->guard()->user();

        // Get past events where user had accepted assignments
        $pastEvents = EventAssignment::where('user_id', $user->id)
            ->where('status', AssignmentStatus::ACCEPTED)
            ->whereHas('event', function ($query) {
                $query->where('date', '<', now()->toDateString());
            })
            ->with(['event.compensation', 'event.agency'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($assignment) {
                $event = $assignment->event;
                return [
                    'id' => $assignment->id,
                    'event_id' => $event->id,
                    'event_name' => $event->name,
                    'event_date' => $event->date->format('Y-m-d'),
                    'event_time_from' => $event->time_from,
                    'event_time_to' => $event->time_to,
                    'event_location' => $event->location,
                    'agency_name' => $event->agency?->name,
                    'compensation' => $event->compensation ? [
                        'hourly_rate' => $event->compensation->hourly_rate,
                        'total_amount' => $event->compensation->total_amount,
                    ] : null,
                ];
            });

        // Get all payments for the user
        $payments = EventPayment::where('user_id', $user->id)
            ->with(['event'])
            ->orderBy('paid_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'event_id' => $payment->event_id,
                    'event_name' => $payment->event?->name,
                    'hours_worked' => $payment->hours_worked,
                    'hourly_rate' => $payment->hourly_rate,
                    'amount' => $payment->amount,
                    'paid_at' => $payment->paid_at?->format('Y-m-d'),
                    'paid_at_human' => $payment->paid_at?->diffForHumans(),
                    'notes' => $payment->notes,
                ];
            });

        // Calculate totals
        $totalEarnings = EventPayment::where('user_id', $user->id)
            ->whereNotNull('paid_at')
            ->sum('amount');

        $pendingPayments = EventPayment::where('user_id', $user->id)
            ->whereNull('paid_at')
            ->sum('amount');

        $totalEventsWorked = EventAssignment::where('user_id', $user->id)
            ->where('status', AssignmentStatus::ACCEPTED)
            ->whereHas('event', function ($query) {
                $query->where('date', '<', now()->toDateString());
            })
            ->count();

        return Inertia::render('staff/profile', [
            'pastEvents' => $pastEvents,
            'payments' => $payments,
            'stats' => [
                'total_earnings' => (float) $totalEarnings,
                'pending_payments' => (float) $pendingPayments,
                'total_events_worked' => $totalEventsWorked,
            ],
        ]);
    }
}
