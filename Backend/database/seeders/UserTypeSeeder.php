<?php

namespace Database\Seeders;

use App\Models\UserType;
use Illuminate\Database\Seeder;

class UserTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create the user types needed for the application
        $userTypes = [
            [
                'name' => 'patient',
                'display_name' => 'Patient',
                'description' => 'Regular patient users who can book appointments, order medicines, etc.'
            ],
            [
                'name' => 'doctor',
                'display_name' => 'Doctor',
                'description' => 'Medical doctors who can provide consultations'
            ],
            [
                'name' => 'laboratory',
                'display_name' => 'Laboratory',
                'description' => 'Lab providers who can offer lab testing services'
            ],
            [
                'name' => 'nursing',
                'display_name' => 'Home Nursing',
                'description' => 'Home nursing service providers'
            ],
            [
                'name' => 'pharmacy',
                'display_name' => 'Pharmacy',
                'description' => 'Pharmacy providers who can sell medicines'
            ],
        ];

        foreach ($userTypes as $type) {
            UserType::updateOrCreate(
                ['name' => $type['name']],
                [
                    'display_name' => $type['display_name'],
                    'description' => $type['description']
                ]
            );
        }
    }
}
