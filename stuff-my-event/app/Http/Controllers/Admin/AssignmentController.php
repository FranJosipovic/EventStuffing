<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventAssignment;
use App\Models\Enums\AssignmentStatus;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    /**
     * Approve an assignment request
     */
    public function approve(EventAssignment $assignment)
    {
        // Verify ownership (assignment belongs to agency's event)
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency || $assignment->event->agency_id !== $agency->id) {
            return back()->with('error', 'Unauthorized action.');
        }

        // Check if assignment is pending
        if ($assignment->status !== AssignmentStatus::PENDING) {
            return back()->with('error', 'This assignment is not pending.');
        }

        // Approve the assignment
        $assignment->accept();

        return back()->with('success', "Assignment approved for {$assignment->user->name}!");
    }

    /**
     * Reject an assignment request
     */
    public function reject(Request $request, EventAssignment $assignment)
    {
        // Verify ownership (assignment belongs to agency's event)
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency || $assignment->event->agency_id !== $agency->id) {
            return back()->with('error', 'Unauthorized action.');
        }

        // Check if assignment is pending
        if ($assignment->status !== AssignmentStatus::PENDING) {
            return back()->with('error', 'This assignment is not pending.');
        }

        // Reject the assignment
        $assignment->reject($request->notes);

        return back()->with('success', "Assignment rejected for {$assignment->user->name}.");
    }

    /**
     * Remove a staff member from an event
     */
    public function destroy(EventAssignment $assignment)
    {
        // Verify ownership (assignment belongs to agency's event)
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency || $assignment->event->agency_id !== $agency->id) {
            return back()->with('error', 'Unauthorized action.');
        }

        $staffName = $assignment->user->name;
        $assignment->delete();

        return back()->with('success', "$staffName has been removed from the event.");
    }
}
