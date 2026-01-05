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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Naziv eventa
            $table->text('description')->nullable(); // Opis eventa
            $table->date('date'); // Datum
            $table->time('time_from'); // Vrijeme od
            $table->time('time_to'); // Vrijeme do
            $table->string('location'); // Lokacija
            $table->integer('required_staff_count'); // Broj potrebnih radnika
            $table->enum('status', ['new', 'staffing', 'ready', 'completed'])->default('new'); // Status eventa
            $table->foreignId('agency_id')->constrained('agencies')->onDelete('cascade'); // Foreign key to agency
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
