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
        Schema::create('event_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Staff member who worked
            $table->decimal('hours_worked', 8, 2);
            $table->decimal('hourly_rate', 8, 2);
            $table->decimal('amount', 10, 2); // Total amount for this payment
            $table->timestamp('paid_at');
            $table->foreignId('paid_by')->constrained('users'); // Admin who processed the payment
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['event_id', 'user_id']);
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_payments');
    }
};
