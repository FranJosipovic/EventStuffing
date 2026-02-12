<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Staff\EventController as StaffEventController;
use App\Http\Controllers\Staff\ScheduleController as StaffScheduleController;
use App\Http\Controllers\EventMessageController;

Route::middleware(['auth', 'role:staff_member'])->prefix('staff')->group(function () {
    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');
    Route::get('/schedule', [StaffScheduleController::class, 'index'])->name('staff.schedule');
    
    // Event routes
    Route::get('/events/{event}', [StaffEventController::class, 'show'])->name('staff.events.show');
    Route::post('/events/{event}/apply', [StaffEventController::class, 'apply'])->name('staff.events.apply');
    Route::delete('/events/{event}/cancel-application', [StaffEventController::class, 'cancelApplication'])->name('staff.events.cancel-application');
    Route::post('/events/{event}/messages', [EventMessageController::class, 'store'])->name('staff.events.messages.store');
});
