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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->dateTime('appointment_datetime');
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'])->default('scheduled');
            $table->enum('type', ['in_person', 'virtual'])->default('in_person');
            $table->text('reason_for_visit')->nullable();
            $table->text('symptoms')->nullable();
            $table->text('doctor_notes')->nullable();
            $table->text('prescription')->nullable();
            $table->string('meeting_link')->nullable(); // For virtual appointments
            $table->decimal('fee', 10, 2);
            $table->boolean('is_paid')->default(false);
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('appointment_datetime');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
