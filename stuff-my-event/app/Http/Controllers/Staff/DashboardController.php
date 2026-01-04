<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->guard()->user();
        
        return Inertia::render('staff/dashboard', [
            'agency' => $user->agency ? $user->agency->load('owner') : null,
        ]);
    }
}
