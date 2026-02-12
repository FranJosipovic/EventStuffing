<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->json('permissions')->nullable();
            $table->boolean('is_system')->default(false); // System roles cannot be deleted
            $table->timestamps();
        });

        // Insert default system roles
        DB::table('roles')->insert([
            [
                'name' => 'agency_owner',
                'label' => 'Agency Owner',
                'description' => 'Full access to all agency features and settings',
                'permissions' => json_encode([
                    'manage_staff',
                    'manage_events',
                    'manage_roles',
                    'manage_payroll',
                    'view_reports',
                    'manage_agency',
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'staff_member',
                'label' => 'Staff Member',
                'description' => 'Standard staff member with limited access',
                'permissions' => json_encode([
                    'view_schedule',
                    'manage_timesheet',
                    'view_agency',
                ]),
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
