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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('role')->constrained('roles')->onDelete('set null');
        });

        // Migrate existing enum roles to role_id
        $agencyOwnerRole = DB::table('roles')->where('name', 'agency_owner')->first();
        $staffMemberRole = DB::table('roles')->where('name', 'staff_member')->first();

        if ($agencyOwnerRole) {
            DB::table('users')
                ->where('role', 'agency_owner')
                ->update(['role_id' => $agencyOwnerRole->id]);
        }

        if ($staffMemberRole) {
            DB::table('users')
                ->where('role', 'staff_member')
                ->update(['role_id' => $staffMemberRole->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
