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
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('company_location')->nullable();
            $table->foreignId('owner_id')->unique()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Add agency_id to users table for many-to-one relationship
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('agency_id')->nullable()->after('role')->constrained('agencies')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['agency_id']);
            $table->dropColumn('agency_id');
        });
        
        Schema::dropIfExists('agencies');
    }
};
