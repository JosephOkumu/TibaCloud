<?php

namespace App\Http\Controllers;

use App\Models\MedicineOrder;
use App\Models\MedicineOrderItem;
use App\Models\Medicine;
use App\Models\Pharmacy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MedicineOrderController extends Controller
{
    /**
     * Display a listing of the medicine orders.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = MedicineOrder::query();
        
        // Allow filtering by patient_id
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        
        // Allow filtering by pharmacy_id
        if ($request->has('pharmacy_id')) {
            $query->where('pharmacy_id', $request->pharmacy_id);
        }
        
        // Allow filtering by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $medicineOrders = $query->with(['patient', 'pharmacy', 'orderItems.medicine'])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $medicineOrders
        ]);
    }

    /**
     * Store a newly created medicine order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'pharmacy_id' => 'required|exists:pharmacies,id',
            'delivery_address' => 'required|string',
            'delivery_contact_number' => 'required|string',
            'delivery_instructions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
            'prescription_image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            // Calculate order totals
            $subtotal = 0;
            $requiresPrescription = false;
            
            // Verify all items are from the same pharmacy and calculate subtotal
            foreach ($request->items as $item) {
                $medicine = Medicine::findOrFail($item['medicine_id']);
                
                if ($medicine->pharmacy_id != $request->pharmacy_id) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'All medicines must be from the same pharmacy'
                    ], 422);
                }
                
                if ($medicine->requires_prescription) {
                    $requiresPrescription = true;
                }
                
                $subtotal += $medicine->price * $item['quantity'];
            }
            
            // Get pharmacy details for delivery fee
            $pharmacy = Pharmacy::findOrFail($request->pharmacy_id);
            $deliveryFee = $pharmacy->offers_delivery ? $pharmacy->delivery_fee : 0;
            $total = $subtotal + $deliveryFee;
            
            // Check if prescription is provided when required
            if ($requiresPrescription && !$request->has('prescription_image')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Prescription image is required for this order'
                ], 422);
            }
            
            // Create the order
            $order = MedicineOrder::create([
                'patient_id' => $request->patient_id,
                'pharmacy_id' => $request->pharmacy_id,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => $total,
                'delivery_address' => $request->delivery_address,
                'delivery_contact_number' => $request->delivery_contact_number,
                'delivery_instructions' => $request->delivery_instructions,
                'is_prescription_required' => $requiresPrescription,
                'prescription_image' => $request->prescription_image,
                'is_paid' => false,
            ]);
            
            // Create order items
            foreach ($request->items as $item) {
                $medicine = Medicine::findOrFail($item['medicine_id']);
                $itemSubtotal = $medicine->price * $item['quantity'];
                
                MedicineOrderItem::create([
                    'order_id' => $order->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $medicine->price,
                    'subtotal' => $itemSubtotal,
                    'special_instructions' => $item['special_instructions'] ?? null,
                ]);
            }
            
            DB::commit();
            
            // Load the order with its relationships
            $order = MedicineOrder::with(['patient', 'pharmacy', 'orderItems.medicine'])->find($order->id);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Medicine order created successfully',
                'data' => $order
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create medicine order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display the specified medicine order.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $medicineOrder = MedicineOrder::with(['patient', 'pharmacy', 'orderItems.medicine'])->find($id);

        if (!$medicineOrder) {
            return response()->json([
                'status' => 'error',
                'message' => 'Medicine order not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $medicineOrder
        ]);
    }
    
    /**
     * Update the specified medicine order in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'string|in:pending,processing,out_for_delivery,delivered,cancelled',
            'delivery_address' => 'string',
            'delivery_contact_number' => 'string',
            'delivery_instructions' => 'nullable|string',
            'prescription_image' => 'nullable|string',
            'delivery_datetime' => 'nullable|date',
            'is_paid' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $medicineOrder = MedicineOrder::find($id);

        if (!$medicineOrder) {
            return response()->json([
                'status' => 'error',
                'message' => 'Medicine order not found'
            ], 404);
        }

        // Only allow updating if the order is not delivered or cancelled
        if (in_array($medicineOrder->status, ['delivered', 'cancelled']) && $request->has('status') && $request->status != $medicineOrder->status) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot update a delivered or cancelled order'
            ], 422);
        }

        $medicineOrder->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Medicine order updated successfully',
            'data' => $medicineOrder
        ]);
    }
    
    /**
     * Remove the specified medicine order from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $medicineOrder = MedicineOrder::find($id);

        if (!$medicineOrder) {
            return response()->json([
                'status' => 'error',
                'message' => 'Medicine order not found'
            ], 404);
        }

        // Only allow deleting if the order is pending
        if ($medicineOrder->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only delete pending orders'
            ], 422);
        }

        $medicineOrder->orderItems()->delete(); // Delete related items first
        $medicineOrder->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Medicine order deleted successfully'
        ]);
    }
}
