<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventPayment;
use App\Models\User;
use App\Models\Enums\AssignmentStatus;
use App\Models\Enums\EventStatus;
use App\Models\Enums\UserRole;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display reports page with statistics
     */
    public function index(): Response
    {
        $user = auth()->guard()->user();
        $agency = $user->agency;

        if (!$agency) {
            return Inertia::render('admin/reports/index', [
                'staffMembers' => [],
                'eventHistory' => [],
                'overallStats' => [],
            ]);
        }

        // Get all staff members with their participation and earnings
        $staffMembers = User::where('agency_id', $agency->id)
            ->where('role', UserRole::STAFF_MEMBER)
            ->withCount([
                'assignments as total_assignments',
                'assignments as accepted_assignments' => function ($query) {
                    $query->where('status', AssignmentStatus::ACCEPTED);
                },
            ])
            ->with(['assignments' => function ($query) {
                $query->where('status', AssignmentStatus::ACCEPTED)
                    ->with('event:id,name,date');
            }])
            ->get()
            ->map(function ($staff) use ($agency) {
                // Get total earnings for this staff member
                $totalEarnings = EventPayment::whereHas('event', function ($query) use ($agency) {
                    $query->where('agency_id', $agency->id);
                })
                    ->where('user_id', $staff->id)
                    ->sum('amount');

                // Get last 5 events they worked on
                $recentEvents = $staff->assignments()
                    ->where('status', AssignmentStatus::ACCEPTED)
                    ->with('event')
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(fn($assignment) => [
                        'event_id' => $assignment->event->id,
                        'event_name' => $assignment->event->name,
                        'event_date' => $assignment->event->date->format('M d, Y'),
                        'status' => $assignment->event->status->label(),
                    ]);

                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'email' => $staff->email,
                    'total_assignments' => $staff->total_assignments,
                    'accepted_assignments' => $staff->accepted_assignments,
                    'total_earnings' => $totalEarnings,
                    'recent_events' => $recentEvents,
                ];
            });

        // Get all events with payment history
        $eventHistory = Event::where('agency_id', $agency->id)
            ->whereHas('payments')
            ->with([
                'payments.user',
                'assignments' => function ($query) {
                    $query->where('status', AssignmentStatus::ACCEPTED)
                        ->with('user');
                }
            ])
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($event) {
                $totalPaid = $event->payments->sum('amount');

                // Get payment breakdown by staff
                $staffPayments = $event->payments->groupBy('user_id')->map(function ($payments, $userId) {
                    $user = $payments->first()->user;
                    return [
                        'user_id' => $userId,
                        'user_name' => $user->name,
                        'total_paid' => $payments->sum('amount'),
                        'payment_count' => $payments->count(),
                        'last_paid_at' => $payments->sortByDesc('paid_at')->first()->paid_at->format('M d, Y H:i'),
                    ];
                })->values();

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'date' => $event->date->format('Y-m-d'),
                    'formatted_date' => $event->date->format('M d, Y'),
                    'location' => $event->location,
                    'status' => [
                        'value' => $event->status->value,
                        'label' => $event->status->label(),
                        'color' => $event->status->color(),
                    ],
                    'total_paid' => $totalPaid,
                    'staff_count' => $event->assignments->count(),
                    'staff_payments' => $staffPayments,
                ];
            });

        // Overall statistics
        $overallStats = [
            'total_staff' => User::where('agency_id', $agency->id)
                ->where('role', UserRole::STAFF_MEMBER)
                ->count(),
            'total_events' => Event::where('agency_id', $agency->id)->count(),
            'completed_events' => Event::where('agency_id', $agency->id)
                ->where('status', EventStatus::COMPLETED)
                ->count(),
            'total_paid' => EventPayment::whereHas('event', function ($query) use ($agency) {
                $query->where('agency_id', $agency->id);
            })
                ->sum('amount'),
            'active_staff' => User::where('agency_id', $agency->id)
                ->where('role', UserRole::STAFF_MEMBER)
                ->whereHas('assignments', function ($query) {
                    $query->where('status', AssignmentStatus::ACCEPTED);
                })
                ->count(),
        ];

        return Inertia::render('admin/reports/index', [
            'staffMembers' => $staffMembers,
            'eventHistory' => $eventHistory,
            'overallStats' => $overallStats,
        ]);
    }
}
