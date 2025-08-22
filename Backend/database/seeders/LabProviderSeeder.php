<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserType;
use App\Models\LabProvider;
use Illuminate\Support\Facades\Hash;

class LabProviderSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get lab provider user type
        $labUserType = UserType::where('name', 'laboratory')->first();

        if (!$labUserType) {
            throw new \Exception('Laboratory user type not found. Please run UserTypeSeeder first.');
        }

        // Create test lab provider user
        $labUser = User::firstOrCreate(
            ['email' => 'lab@test.com'],
            [
                'name' => 'Test Lab Provider',
                'password' => Hash::make('password123'),
                'phone_number' => '+254 712 345 678',
                'user_type_id' => $labUserType->id,
                'is_active' => true,
                'license_number' => 'LAB-TEST-001',
                'national_id' => '12345678',
                'email_verified_at' => now(),
            ]
        );

        // Create lab provider profile
        LabProvider::firstOrCreate(
            ['user_id' => $labUser->id],
            [
                'lab_name' => 'Central Diagnostic Laboratory',
                'license_number' => 'LAB-2023-001',
                'website' => 'www.centraldl.com',
                'address' => '123 Health Avenue, Nairobi, Kenya',
                'operating_hours' => json_encode([
                    'monday' => '8:00 AM - 6:00 PM',
                    'tuesday' => '8:00 AM - 6:00 PM',
                    'wednesday' => '8:00 AM - 6:00 PM',
                    'thursday' => '8:00 AM - 6:00 PM',
                    'friday' => '8:00 AM - 6:00 PM',
                    'saturday' => '9:00 AM - 4:00 PM',
                    'sunday' => 'Closed'
                ]),
                'description' => 'Central Diagnostic Laboratory is a state-of-the-art facility offering comprehensive diagnostic services with modern equipment and highly trained professionals. We specialize in clinical chemistry, hematology, microbiology, and molecular diagnostics.',
                'contact_person_name' => 'Dr. Sarah Kimani',
                'contact_person_role' => 'Laboratory Director',
                'profile_image' => 'https://randomuser.me/api/portraits/women/65.jpg',
                'certifications' => json_encode([
                    'ISO 15189:2012 Certification',
                    'Kenya Laboratory Accreditation Service (KENAS)',
                    'College of American Pathologists (CAP)',
                    'WHO Prequalification'
                ]),
                'is_available' => true,
                'average_rating' => 4.85,
            ]
        );

        // Create another test lab provider
        $labUser2 = User::firstOrCreate(
            ['email' => 'medlab@test.com'],
            [
                'name' => 'MedLab Services',
                'password' => Hash::make('password123'),
                'phone_number' => '+254 701 234 567',
                'user_type_id' => $labUserType->id,
                'is_active' => true,
                'license_number' => 'LAB-TEST-002',
                'national_id' => '87654321',
                'email_verified_at' => now(),
            ]
        );

        LabProvider::firstOrCreate(
            ['user_id' => $labUser2->id],
            [
                'lab_name' => 'MedLab Diagnostic Services',
                'license_number' => 'LAB-2023-002',
                'website' => 'www.medlab.co.ke',
                'address' => '456 Medical Plaza, Mombasa, Kenya',
                'operating_hours' => json_encode([
                    'monday' => '7:00 AM - 7:00 PM',
                    'tuesday' => '7:00 AM - 7:00 PM',
                    'wednesday' => '7:00 AM - 7:00 PM',
                    'thursday' => '7:00 AM - 7:00 PM',
                    'friday' => '7:00 AM - 7:00 PM',
                    'saturday' => '8:00 AM - 5:00 PM',
                    'sunday' => '9:00 AM - 3:00 PM'
                ]),
                'description' => 'MedLab Diagnostic Services provides reliable and accurate laboratory testing with quick turnaround times. Our experienced team ensures quality results for better patient care.',
                'contact_person_name' => 'Dr. Michael Ochieng',
                'contact_person_role' => 'Chief Laboratory Scientist',
                'profile_image' => 'https://randomuser.me/api/portraits/men/42.jpg',
                'certifications' => json_encode([
                    'ISO 15189 Accreditation',
                    'Kenya Medical Laboratory Technicians Board',
                    'East African Laboratory Quality Assurance'
                ]),
                'is_available' => true,
                'average_rating' => 4.72,
            ]
        );

        $this->command->info('Lab Provider test data created successfully!');
        $this->command->info('Test Login Credentials:');
        $this->command->info('Email: lab@test.com | Password: password123');
        $this->command->info('Email: medlab@test.com | Password: password123');
    }
}
