<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NursingService extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_id',
        'nursing_provider_id',
        'service_name',
        'service_description',
        'service_price',
        'scheduled_datetime',
        'end_datetime',
        'patient_address',
        'status',
        'care_notes',
        'patient_requirements',
        'medical_history',
        'doctor_referral',
        'is_recurring',
        'recurrence_pattern',
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'service_price' => 'decimal:2',
        'is_recurring' => 'boolean',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the patient that owns the nursing service.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the nursing provider that owns the nursing service.
     */
    public function nursingProvider()
    {
        return $this->belongsTo(NursingProvider::class);
    }
}
