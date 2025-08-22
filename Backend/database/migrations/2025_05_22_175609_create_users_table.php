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
        // This migration will only run if the users table exists and is missing the user_type_id column
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'user_type_id')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'phone_number')) {
                    $table->string('phone_number')->nullable()->after('password');
                }
                if (!Schema::hasColumn('users', 'user_type_id')) {
                    $table->foreignId('user_type_id')->constrained('user_types')->onDelete('cascade')->nullable()->after('phone_number');
                }
                if (!Schema::hasColumn('users', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('user_type_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop columns if they exist
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'phone_number')) {
                    $table->dropColumn('phone_number');
                }
                if (Schema::hasColumn('users', 'user_type_id')) {
                    $table->dropColumn('user_type_id');
                }
                if (Schema::hasColumn('users', 'is_active')) {
                    $table->dropColumn('is_active');
                }
            });
        }
    }
};
