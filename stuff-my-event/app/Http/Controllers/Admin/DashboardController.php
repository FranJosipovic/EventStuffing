<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->guard()->user();
        
        return Inertia::render('admin/dashboard', [
            'agency' => $user->ownedAgency ? $user->ownedAgency->load('members') : null,
        ]);
    }
}
