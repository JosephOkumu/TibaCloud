<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_id',
        'pharmacy_id',
        'order_number',
        'status',
        'subtotal',
        'delivery_fee',
        'total',
        'delivery_address',
        'delivery_contact_number',
        'delivery_instructions',
        'is_prescription_required',
        'prescription_image',
        'delivery_datetime',
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'is_prescription_required' => 'boolean',
        'delivery_datetime' => 'datetime',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the patient that owns the medicine order.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the pharmacy that owns the medicine order.
     */
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the order items for the medicine order.
     */
    public function orderItems()
    {
        return $this->hasMany(MedicineOrderItem::class, 'order_id');
    }
}
