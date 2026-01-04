<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\UserRole;
use Illuminate\Support\Facades\Auth;

Route::middleware(['auth', 'role:agency_owner'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
});

Route::middleware(['auth', 'role:staff_member'])->prefix('staff')->group(function () {
    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');
});

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->guard()->user();
        
        // Redirect to appropriate dashboard
        return match($user->role->value) {
            'agency_owner' => redirect()->route('admin.dashboard'),
            'staff_member' => redirect()->route('staff.dashboard'),
            default => abort(403),
        };
    })->name('dashboard');
});

Route::fallback(function () {
    if (Auth::check()) { // Use Auth facade
        $user = Auth::user();
        return match($user->role) {
            UserRole::AGENCY_OWNER => redirect('/admin/dashboard'),
            UserRole::STAFF_MEMBER => redirect('/staff/dashboard'),
            default => redirect('/login'),
        };
    }
    return redirect('/');
});

require __DIR__.'/settings.php';
