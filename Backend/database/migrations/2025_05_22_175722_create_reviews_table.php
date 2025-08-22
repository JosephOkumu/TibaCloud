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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User who gave the review
            $table->morphs('reviewable'); // Polymorphic relationship for different reviewable types (doctors, labs, pharmacies, etc.)
            $table->integer('rating')->default(5); // 1-5 star rating
            $table->text('comment')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('is_verified')->default(false); // Only allow reviews from verified service users
            $table->string('service_reference')->nullable(); // Reference to the specific service (appointment ID, order ID, etc.)
            $table->boolean('is_approved')->default(true); // For moderation purposes
            $table->timestamps();
            
            // Indexes for faster queries
            $table->index('rating');
            $table->index('created_at');
            $table->index(['user_id', 'reviewable_type', 'reviewable_id']); // Ensure one review per user per entity
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
