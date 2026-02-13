<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\StaffController as AdminStaffController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Admin\AssignmentController as AdminAssignmentController;
use App\Http\Controllers\Admin\PayrollController as AdminPayrollController;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;
use App\Http\Controllers\EventMessageController;

Route::middleware(['auth', 'role:agency_owner'])->prefix('admin')->group(function () {
    //dashboard route
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // Event routes
    Route::get('/events', [AdminEventController::class, 'index'])->name('admin.events.index');
    Route::get('/events/create', [AdminEventController::class, 'create'])->name('admin.events.create');
    Route::post('/events', [AdminEventController::class, 'store'])->name('admin.events.store');
    Route::get('/events/{event}', [AdminEventController::class, 'show'])->name('admin.events.show');
    Route::put('/events/{event}', [AdminEventController::class, 'update'])->name('admin.events.update');
    Route::delete('/events/{event}', [AdminEventController::class, 'destroy'])->name('admin.events.destroy');
    Route::post('/events/{event}/messages', [EventMessageController::class, 'store'])->name('admin.events.messages.store');

    // Assignment routes
    Route::post('/assignments/{assignment}/approve', [AdminAssignmentController::class, 'approve'])->name('admin.assignments.approve');
    Route::post('/assignments/{assignment}/reject', [AdminAssignmentController::class, 'reject'])->name('admin.assignments.reject');

    // Payroll routes
    Route::get('/payroll', [AdminPayrollController::class, 'index'])->name('admin.payroll.index');
    Route::post('/payroll/events/{event}/process', [AdminPayrollController::class, 'processPayment'])->name('admin.payroll.process');

    // Reports routes
    Route::get('/reports', [AdminReportsController::class, 'index'])->name('admin.reports.index');

    // Staff management routes
    Route::get('/staff', [AdminStaffController::class, 'index'])->name('admin.staff.index');
    Route::post('/staff', [AdminStaffController::class, 'store'])->name('admin.staff.store');
    Route::put('/staff/{staff}', [AdminStaffController::class, 'update'])->name('admin.staff.update');
    Route::delete('/staff/{staff}', [AdminStaffController::class, 'destroy'])->name('admin.staff.destroy');

    // Role management routes
    Route::get('/roles', [AdminRoleController::class, 'index'])->name('admin.roles.index');
    Route::post('/roles', [AdminRoleController::class, 'store'])->name('admin.roles.store');
    Route::put('/roles/{role}', [AdminRoleController::class, 'update'])->name('admin.roles.update');
    Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy'])->name('admin.roles.destroy');
});
