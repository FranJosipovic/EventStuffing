<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Models\Enums\UserRole;
use Illuminate\Support\Facades\Auth;

require __DIR__.'/admin.php';
require __DIR__.'/staff.php';

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
