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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_id')->unique(); // External payment ID
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('payable'); // Polymorphic relationship for different payment types (appointments, lab tests, etc.)
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->enum('payment_method', ['card', 'mobile_money', 'bank_transfer', 'cash'])->default('mobile_money');
            $table->string('transaction_reference')->nullable();
            $table->text('payment_details')->nullable(); // JSON encoded payment details
            $table->dateTime('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('payment_id');
            $table->index('status');
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
