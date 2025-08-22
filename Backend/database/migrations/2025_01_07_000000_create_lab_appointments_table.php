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
        Schema::create('lab_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lab_provider_id')->constrained('lab_providers')->onDelete('cascade');
            $table->dateTime('appointment_datetime');
            $table->enum('status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'in_progress'])->default('scheduled');
            $table->json('test_ids'); // Array of selected lab test service IDs
            $table->decimal('total_amount', 10, 2);
            $table->boolean('is_paid')->default(false);
            $table->string('payment_reference')->nullable(); // M-Pesa or other payment reference
            $table->text('notes')->nullable(); // Patient notes or special instructions
            $table->text('results')->nullable(); // Lab test results
            $table->text('lab_notes')->nullable(); // Lab technician notes
            $table->timestamps();

            // Indexes for better performance
            $table->index(['patient_id', 'appointment_datetime']);
            $table->index(['lab_provider_id', 'appointment_datetime']);
            $table->index(['status']);
            $table->index(['is_paid']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_appointments');
    }
};
