<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPayment;
use App\Models\Enums\AssignmentStatus;
use App\Models\Enums\EventStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    /**
     * Display the payroll page with events and assignments
     */
    public function index(): Response
    {
        $user = auth()->user();
        $agency = $user->agency;

        if (!$agency) {
            return Inertia::render('admin/payroll/index', [
                'events' => [],
                'staffSummary' => [],
            ]);
        }

        // Get completed events with accepted assignments that have NOT been paid yet
        $events = Event::where('agency_id', $agency->id)
            ->where('status', EventStatus::COMPLETED)
            ->whereDoesntHave('payments')
            ->with([
                'assignments' => function ($query) {
                    $query->where('status', AssignmentStatus::ACCEPTED)
                        ->with('user');
                }
            ])
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($event) {
                // Calculate hours worked from event time
                $hoursWorked = $event->time_from && $event->time_to 
                    ? $event->time_from->diffInHours($event->time_to, false) 
                    : 0;

                // Check if this event has already been paid
                $hasBeenPaid = EventPayment::where('event_id', $event->id)->exists();

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'date' => $event->date->format('Y-m-d'),
                    'formatted_date' => $event->date->format('M d, Y'),
                    'time_from' => $event->time_from?->format('H:i'),
                    'time_to' => $event->time_to?->format('H:i'),
                    'hours_worked' => $hoursWorked,
                    'has_been_paid' => $hasBeenPaid,
                    'staff' => $event->assignments->map(function ($assignment) use ($hoursWorked, $event) {
                        // Get payments for this user on this event
                        $payments = EventPayment::where('event_id', $event->id)
                            ->where('user_id', $assignment->user_id)
                            ->orderBy('paid_at', 'desc')
                            ->get();
                        
                        $totalPaid = $payments->sum('amount');
                        $lastPayment = $payments->first();

                        return [
                            'assignment_id' => $assignment->id,
                            'user_id' => $assignment->user_id,
                            'user_name' => $assignment->user->name,
                            'user_email' => $assignment->user->email,
                            'hours_worked' => $hoursWorked,
                            'total_paid' => $totalPaid,
                            'last_hourly_rate' => $lastPayment?->hourly_rate ?? 0,
                            'last_paid_at' => $lastPayment?->paid_at?->format('M d, Y H:i'),
                            'payment_count' => $payments->count(),
                        ];
                    }),
                ];
            });

        // Calculate staff summary (total earnings per staff member)
        $staffSummary = EventPayment::whereHas('event', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
            ->with('user')
            ->select('user_id', DB::raw('SUM(amount) as total_earned'), DB::raw('COUNT(*) as payment_count'))
            ->groupBy('user_id')
            ->get()
            ->map(function ($summary) {
                return [
                    'user_id' => $summary->user_id,
                    'user_name' => $summary->user->name,
                    'user_email' => $summary->user->email,
                    'total_earned' => $summary->total_earned,
                    'payment_count' => $summary->payment_count,
                ];
            });

        return Inertia::render('admin/payroll/index', [
            'events' => $events,
            'staffSummary' => $staffSummary,
        ]);
    }

    /**
     * Process payment for an event's staff
     */
    public function processPayment(Request $request, Event $event)
    {
        $user = auth()->user();

        // Verify access
        if ($event->agency_id !== $user->agency_id) {
            abort(403, 'Unauthorized access to this event.');
        }

        // Check if payment has already been processed for this event
        if (EventPayment::where('event_id', $event->id)->exists()) {
            return back()->with('error', 'Payment has already been processed for this event.');
        }

        // Validate request
        $validated = $request->validate([
            'payments' => 'required|array',
            'payments.*.assignment_id' => 'required|exists:event_assignments,id',
            'payments.*.user_id' => 'required|exists:users,id',
            'payments.*.hours_worked' => 'required|numeric|min:0',
            'payments.*.hourly_rate' => 'required|numeric|min:0',
            'payments.*.amount' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $event, $user) {
            foreach ($validated['payments'] as $payment) {
                EventPayment::create([
                    'event_id' => $event->id,
                    'user_id' => $payment['user_id'],
                    'hours_worked' => $payment['hours_worked'],
                    'hourly_rate' => $payment['hourly_rate'],
                    'amount' => $payment['amount'],
                    'paid_at' => now(),
                    'paid_by' => $user->id,
                ]);
            }
        });

        return back()->with('success', 'Payment processed successfully!');
    }
}
