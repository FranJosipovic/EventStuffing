<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Models\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display staff management dashboard
     */
    public function index(Request $request)
    {
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency) {
            return redirect()->route('admin.dashboard')
                ->with('error', 'You must have an agency to manage staff.');
        }

        // Get search query
        $search = $request->input('search', '');
        $roleFilter = $request->input('role', '');

        // Build query
        $query = User::where('agency_id', $agency->id)
            ->orWhere('id', $user->id); // Include owner

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Apply role filter - support both role_id and old role enum
        if ($roleFilter && $roleFilter !== 'all') {
            $query->where(function ($q) use ($roleFilter) {
                $q->where('role', $roleFilter)
                    ->orWhereHas('userRole', function ($subQuery) use ($roleFilter) {
                        $subQuery->where('name', $roleFilter);
                    });
            });
        }

        // Get staff members with their event assignments
        $staffMembers = $query->with('userRole')
            ->withCount([
                'eventAssignments',
                'acceptedEvents',
                'pendingEvents'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($member) {
                // Support both new role_id and old role enum
                $roleName = $member->role_id && $member->userRole
                    ? $member->userRole->name
                    : $member->role?->value;
                $roleLabel = $member->role_id && $member->userRole
                    ? $member->userRole->label
                    : $member->role?->label();

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => [
                        'value' => $roleName,
                        'label' => $roleLabel,
                    ],
                    'role_id' => $member->role_id,
                    'event_assignments_count' => $member->event_assignments_count,
                    'accepted_events_count' => $member->accepted_events_count,
                    'pending_events_count' => $member->pending_events_count,
                    'created_at' => $member->created_at->format('Y-m-d'),
                    'is_owner' => $member->isAgencyOwner(),
                ];
            });

        // Get all available roles from database
        $roles = Role::orderBy('is_system', 'desc')
            ->orderBy('label', 'asc')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'value' => $role->name,
                    'label' => $role->label,
                    'is_system' => $role->is_system,
                ];
            });

        // Stats
        $stats = [
            'total_staff' => User::where('agency_id', $agency->id)->count(),
            'agency_owners' => User::where('agency_id', $agency->id)
                ->where(function ($q) {
                    $q->where('role', UserRole::AGENCY_OWNER)
                        ->orWhereHas('userRole', function ($subQuery) {
                            $subQuery->where('name', 'agency_owner');
                        });
                })
                ->count(),
            'staff_members' => User::where('agency_id', $agency->id)
                ->where(function ($q) {
                    $q->where('role', UserRole::STAFF_MEMBER)
                        ->orWhereHas('userRole', function ($subQuery) {
                            $subQuery->where('name', 'staff_member');
                        });
                })
                ->count(),
            'active_this_month' => User::where('agency_id', $agency->id)
                ->whereHas('eventAssignments', function ($query) {
                    $query->where('created_at', '>=', now()->startOfMonth());
                })
                ->count(),
        ];

        return Inertia::render('admin/staff/index', [
            'staffMembers' => $staffMembers,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ],
        ]);
    }

    /**
     * Store a new staff member
     */
    public function store(Request $request)
    {
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency) {
            return back()->with('error', 'You must have an agency to add staff.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Rules\Password::defaults()],
            'role_id' => ['required', 'exists:roles,id'],
        ]);

        // Get the role to set the old enum field for backwards compatibility
        $role = Role::find($validated['role_id']);
        $roleEnum = null;
        if ($role->name === 'agency_owner') {
            $roleEnum = UserRole::AGENCY_OWNER;
        } elseif ($role->name === 'staff_member') {
            $roleEnum = UserRole::STAFF_MEMBER;
        }

        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $roleEnum,
            'role_id' => $validated['role_id'],
            'agency_id' => $agency->id,
        ]);

        return back()->with('success', 'Staff member created successfully.');
    }

    /**
     * Update a staff member's role
     */
    public function update(Request $request, User $staff)
    {
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency) {
            return back()->with('error', 'You must have an agency to manage staff.');
        }

        // Check if the staff member belongs to this agency
        if ($staff->agency_id !== $agency->id && $staff->id !== $user->id) {
            return back()->with('error', 'You cannot edit this user.');
        }

        // Prevent owner from changing their own role
        if ($staff->id === $user->id && $request->input('role_id') != $user->role_id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $staff->id],
            'role_id' => ['required', 'exists:roles,id'],
            'password' => ['nullable', Rules\Password::defaults()],
        ]);

        // Get the role to set the old enum field for backwards compatibility
        $role = Role::find($validated['role_id']);
        $roleEnum = null;
        if ($role->name === 'agency_owner') {
            $roleEnum = UserRole::AGENCY_OWNER;
        } elseif ($role->name === 'staff_member') {
            $roleEnum = UserRole::STAFF_MEMBER;
        }

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $roleEnum,
            'role_id' => $validated['role_id'],
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $staff->update($updateData);

        return back()->with('success', 'Staff member updated successfully.');
    }

    /**
     * Delete a staff member
     */
    public function destroy(User $staff)
    {
        $user = auth()->guard()->user();
        $agency = $user->ownedAgency;

        if (!$agency) {
            return back()->with('error', 'You must have an agency to manage staff.');
        }

        // Check if the staff member belongs to this agency
        if ($staff->agency_id !== $agency->id) {
            return back()->with('error', 'You cannot delete this user.');
        }

        // Prevent owner from deleting themselves
        if ($staff->id === $user->id) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        // Delete the staff member
        $staff->delete();

        return back()->with('success', 'Staff member deleted successfully.');
    }
}
