<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display all roles
     */
    public function index()
    {
        $roles = Role::withCount('users')
            ->orderBy('is_system', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'label' => $role->label,
                    'description' => $role->description,
                    'permissions' => $role->permissions ?? [],
                    'is_system' => $role->is_system,
                    'users_count' => $role->users_count,
                    'created_at' => $role->created_at->format('Y-m-d'),
                ];
            });

        // Available permissions
        $availablePermissions = [
            'manage_staff' => 'Manage Staff Members',
            'manage_events' => 'Manage Events',
            'manage_roles' => 'Manage Roles',
            'manage_payroll' => 'Manage Payroll',
            'view_reports' => 'View Reports',
            'manage_agency' => 'Manage Agency Settings',
            'view_schedule' => 'View Schedule',
            'manage_timesheet' => 'Manage Timesheet',
            'view_agency' => 'View Agency Info',
            'manage_assignments' => 'Manage Event Assignments',
            'view_messages' => 'View Messages',
            'send_messages' => 'Send Messages',
        ];

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'availablePermissions' => $availablePermissions,
        ]);
    }

    /**
     * Store a new role
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name', 'regex:/^[a-z_]+$/'],
            'label' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
            'is_system' => false,
        ]);

        return back()->with('success', 'Role created successfully.');
    }

    /**
     * Update a role
     */
    public function update(Request $request, Role $role)
    {
        // Prevent editing system roles' name and permissions
        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be modified.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-z_]+$/', 'unique:roles,name,' . $role->id],
            'label' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role->update([
            'name' => $validated['name'],
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
        ]);

        return back()->with('success', 'Role updated successfully.');
    }

    /**
     * Delete a role
     */
    public function destroy(Role $role)
    {
        // Prevent deleting system roles
        if ($role->is_system) {
            return back()->with('error', 'System roles cannot be deleted.');
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role that is assigned to users. Please reassign users first.');
        }

        $role->delete();

        return back()->with('success', 'Role deleted successfully.');
    }
}
