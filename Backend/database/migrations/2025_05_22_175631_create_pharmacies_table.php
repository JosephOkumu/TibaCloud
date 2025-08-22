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
        Schema::create('pharmacies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('pharmacy_name');
            $table->text('description');
            $table->string('license_number')->unique();
            $table->string('logo')->nullable();
            $table->text('operating_hours')->nullable(); // JSON encoded operating hours
            $table->text('address');
            $table->string('city');
            $table->boolean('offers_delivery')->default(false);
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->boolean('is_available')->default(true);
            $table->integer('average_rating')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacies');
    }
};
