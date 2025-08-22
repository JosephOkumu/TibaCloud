<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PharmacyController extends Controller
{
    /**
     * Display a listing of the pharmacies.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $pharmacies = Pharmacy::all();
        
        return response()->json([
            'status' => 'success',
            'data' => $pharmacies
        ]);
    }

    /**
     * Store a newly created pharmacy in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'pharmacy_name' => 'required|string|max:255',
            'description' => 'required|string',
            'license_number' => 'required|string|unique:pharmacies,license_number',
            'logo' => 'nullable|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'phone_number' => 'required|string',
            'email' => 'nullable|email',
            'operating_hours' => 'nullable|json',
            'offers_delivery' => 'boolean',
            'delivery_fee' => 'nullable|required_if:offers_delivery,true|numeric|min:0',
            'delivery_time_minutes' => 'nullable|required_if:offers_delivery,true|integer|min:0',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $pharmacy = Pharmacy::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Pharmacy created successfully',
            'data' => $pharmacy
        ], 201);
    }

    /**
     * Display the specified pharmacy.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $pharmacy = Pharmacy::find($id);

        if (!$pharmacy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pharmacy not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pharmacy
        ]);
    }

    /**
     * Update the specified pharmacy in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'exists:users,id',
            'pharmacy_name' => 'string|max:255',
            'description' => 'string',
            'license_number' => 'string|unique:pharmacies,license_number,'.$id,
            'logo' => 'nullable|string',
            'address' => 'string',
            'city' => 'string',
            'phone_number' => 'string',
            'email' => 'nullable|email',
            'operating_hours' => 'nullable|json',
            'offers_delivery' => 'boolean',
            'delivery_fee' => 'nullable|required_if:offers_delivery,true|numeric|min:0',
            'delivery_time_minutes' => 'nullable|required_if:offers_delivery,true|integer|min:0',
            'is_available' => 'boolean',
            'average_rating' => 'integer|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $pharmacy = Pharmacy::find($id);

        if (!$pharmacy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pharmacy not found'
            ], 404);
        }

        $pharmacy->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Pharmacy updated successfully',
            'data' => $pharmacy
        ]);
    }

    /**
     * Remove the specified pharmacy from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $pharmacy = Pharmacy::find($id);

        if (!$pharmacy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pharmacy not found'
            ], 404);
        }

        $pharmacy->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pharmacy deleted successfully'
        ]);
    }
}
