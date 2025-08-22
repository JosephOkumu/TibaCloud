<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabAppointment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_id',
        'lab_provider_id',
        'appointment_datetime',
        'status',
        'test_ids',
        'total_amount',
        'is_paid',
        'payment_reference',
        'notes',
        'results',
        'lab_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'appointment_datetime' => 'datetime',
        'test_ids' => 'array',
        'total_amount' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the patient that owns the lab appointment.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the lab provider that owns the appointment.
     */
    public function labProvider()
    {
        return $this->belongsTo(LabProvider::class, 'lab_provider_id');
    }

    /**
     * Get the lab tests for this appointment.
     */
    public function labTests()
    {
        return $this->belongsToMany(LabTestService::class, 'lab_appointment_tests', 'lab_appointment_id', 'lab_test_service_id');
    }
}
