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
        Schema::dropIfExists('event_requirements');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('event_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('clothing_requirements')->nullable();
            $table->text('special_instructions')->nullable();
            $table->time('arrival_time')->nullable();
            $table->string('meeting_point')->nullable();
            $table->text('equipment_needed')->nullable();
            $table->text('other_notes')->nullable();
            $table->timestamps();
        });
    }
};
