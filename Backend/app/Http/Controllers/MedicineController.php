<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicineController extends Controller
{
    /**
     * Display a listing of the medicines.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Medicine::query();
        
        // Allow filtering by pharmacy_id
        if ($request->has('pharmacy_id')) {
            $query->where('pharmacy_id', $request->pharmacy_id);
        }
        
        // Allow filtering by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Allow filtering by availability
        if ($request->has('is_available')) {
            $query->where('is_available', $request->is_available);
        }
        
        // Allow filtering by requires_prescription
        if ($request->has('requires_prescription')) {
            $query->where('requires_prescription', $request->requires_prescription);
        }
        
        // Allow search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('generic_name', 'like', '%' . $request->search . '%');
        }
        
        $medicines = $query->with('pharmacy')->orderBy('name', 'asc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $medicines
        ]);
    }

    /**
     * Store a newly created medicine in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pharmacy_id' => 'required|exists:pharmacies,id',
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'dosage_form' => 'required|string|max:255',
            'strength' => 'nullable|string|max:255',
            'requires_prescription' => 'boolean',
            'is_available' => 'boolean',
            'stock_quantity' => 'integer|min:0',
            'image' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'storage_instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine = Medicine::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Medicine created successfully',
            'data' => $medicine
        ], 201);
    }

    /**
     * Display the specified medicine.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $medicine = Medicine::with('pharmacy')->find($id);

        if (!$medicine) {
            return response()->json([
                'status' => 'error',
                'message' => 'Medicine not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $medicine
        ]);
    }

    /**
     * Update the specified medicine in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'pharmacy_id' => 'exists:pharmacies,id',
            'name' => 'string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'category' => 'string|max:255',
            'price' => 'numeric|min:0',
            'dosage_form' => 'string|max:255',
            'strength' => 'nullable|string|max:255',
            'requires_prescription' => 'boolean',
            'is_available' => 'boolean',
            'stock_quantity' => 'integer|min:0',
            'image' => 'nullable|string',
            'side_effects' => 'nullable|string',
            'contraindications' => 'nullable|string',
            'storage_instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json([
                'status' => 'error',
                'message' => 'Medicine not found'
            ], 404);
        }

        $medicine->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Medicine updated successfully',
            'data' => $medicine
        ]);
    }

    /**
     * Remove the specified medicine from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $medicine = Medicine::find($id);

        if (!$medicine) {
            return response()->json([
                'status' => 'error',
                'message' => 'Medicine not found'
            ], 404);
        }

        $medicine->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Medicine deleted successfully'
        ]);
    }
}
