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
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('specialty');
            $table->string('license_number')->unique();
            $table->text('qualifications');
            $table->text('education')->nullable();
            $table->text('experience')->nullable();
            $table->decimal('consultation_fee', 10, 2);
            $table->text('availability')->nullable(); // JSON encoded availability schedule
            $table->boolean('is_available_for_consultation')->default(true);
            $table->integer('average_rating')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
