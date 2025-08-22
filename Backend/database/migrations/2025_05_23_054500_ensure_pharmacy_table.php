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
        if (!Schema::hasTable('pharmacies')) {
            Schema::create('pharmacies', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('pharmacy_name');
                $table->text('description');
                $table->string('license_number')->unique();
                $table->string('logo')->nullable();
                $table->text('address');
                $table->string('city');
                $table->string('phone_number');
                $table->string('email')->nullable();
                $table->text('operating_hours')->nullable(); // JSON encoded operating hours
                $table->boolean('offers_delivery')->default(false);
                $table->decimal('delivery_fee', 10, 2)->nullable();
                $table->integer('delivery_time_minutes')->nullable();
                $table->boolean('is_available')->default(true);
                $table->integer('average_rating')->default(0);
                $table->timestamps();
                
                // Indexes for faster queries
                $table->index('pharmacy_name');
                $table->index('city');
                $table->index('is_available');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We don't want to drop the table if it already existed
    }
};
