<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LabTestController extends Controller
{
    /**
     * Display a listing of the lab tests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Allow filtering by patient_id or lab_provider_id
        $query = LabTest::query();
        
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }
        
        if ($request->has('lab_provider_id')) {
            $query->where('lab_provider_id', $request->lab_provider_id);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $labTests = $query->with(['patient', 'labProvider'])->orderBy('scheduled_datetime', 'asc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $labTests
        ]);
    }

    /**
     * Store a newly created lab test in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'lab_provider_id' => 'required|exists:lab_providers,id',
            'test_name' => 'required|string|max:255',
            'test_description' => 'nullable|string',
            'test_price' => 'required|numeric|min:0',
            'scheduled_datetime' => 'required|date|after:now',
            'sample_collection_mode' => 'required|in:lab_visit,home_collection',
            'sample_collection_address' => 'required_if:sample_collection_mode,home_collection|nullable|string',
            'doctor_referral' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Set default values for remaining fields
        $data = $request->all();
        $data['status'] = 'scheduled';
        $data['is_paid'] = false;

        $labTest = LabTest::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Lab test created successfully',
            'data' => $labTest
        ], 201);
    }

    /**
     * Display the specified lab test.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $labTest = LabTest::with(['patient', 'labProvider'])->find($id);

        if (!$labTest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab test not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $labTest
        ]);
    }

    /**
     * Update the specified lab test in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'exists:users,id',
            'lab_provider_id' => 'exists:lab_providers,id',
            'test_name' => 'string|max:255',
            'test_description' => 'nullable|string',
            'test_price' => 'numeric|min:0',
            'scheduled_datetime' => 'date',
            'sample_collection_mode' => 'in:lab_visit,home_collection',
            'sample_collection_address' => 'required_if:sample_collection_mode,home_collection|nullable|string',
            'status' => 'in:scheduled,sample_collected,processing,completed,cancelled',
            'results' => 'nullable|json',
            'results_available_at' => 'nullable|date',
            'doctor_referral' => 'nullable|string',
            'is_paid' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $labTest = LabTest::find($id);

        if (!$labTest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab test not found'
            ], 404);
        }

        // If status is being updated to 'completed', set the results_available_at to current time
        if ($request->has('status') && $request->status === 'completed' && !$request->has('results_available_at')) {
            $request->merge(['results_available_at' => now()]);
        }

        $labTest->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Lab test updated successfully',
            'data' => $labTest
        ]);
    }

    /**
     * Remove the specified lab test from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $labTest = LabTest::find($id);

        if (!$labTest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab test not found'
            ], 404);
        }

        $labTest->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lab test deleted successfully'
        ]);
    }
}
