<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'pharmacy_id',
        'name',
        'generic_name',
        'description',
        'manufacturer',
        'category',
        'price',
        'dosage_form',
        'strength',
        'requires_prescription',
        'is_available',
        'stock_quantity',
        'image',
        'side_effects',
        'contraindications',
        'storage_instructions',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'requires_prescription' => 'boolean',
        'is_available' => 'boolean',
        'stock_quantity' => 'integer',
    ];

    /**
     * Get the pharmacy that owns the medicine.
     */
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the order items for the medicine.
     */
    public function orderItems()
    {
        return $this->hasMany(MedicineOrderItem::class);
    }
}
