<?php

namespace App\Http\Controllers;

use App\Models\NursingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NursingServiceController extends Controller
{
    /**
     * Display a listing of the nursing services.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Allow filtering by patient_id or nursing_provider_id
        $query = NursingService::query();

        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->has('nursing_provider_id')) {
            $query->where('nursing_provider_id', $request->nursing_provider_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $nursingServices = $query->with(['patient', 'nursingProvider'])->orderBy('scheduled_datetime', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $nursingServices
        ]);
    }

    /**
     * Store a newly created nursing service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'nursing_provider_id' => 'required|exists:nursing_providers,id',
            'service_name' => 'required|string|max:255',
            'service_description' => 'nullable|string',
            'service_price' => 'required|numeric|min:0',
            'scheduled_datetime' => 'required|date|after:now',
            'end_datetime' => 'nullable|date|after:scheduled_datetime',
            'patient_address' => 'required|string',
            'patient_requirements' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'doctor_referral' => 'nullable|string',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|nullable|string',
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

        $nursingService = NursingService::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Nursing service created successfully',
            'data' => $nursingService
        ], 201);
    }

    /**
     * Display the specified nursing service.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $nursingService = NursingService::with(['patient', 'nursingProvider'])->find($id);

        if (!$nursingService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $nursingService
        ]);
    }

    /**
     * Update the specified nursing service in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'exists:users,id',
            'nursing_provider_id' => 'exists:nursing_providers,id',
            'service_name' => 'string|max:255',
            'service_description' => 'nullable|string',
            'service_price' => 'numeric|min:0',
            'scheduled_datetime' => 'date',
            'end_datetime' => 'nullable|date|after:scheduled_datetime',
            'patient_address' => 'string',
            'status' => 'in:scheduled,in_progress,completed,cancelled',
            'care_notes' => 'nullable|string',
            'patient_requirements' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'doctor_referral' => 'nullable|string',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'required_if:is_recurring,true|nullable|string',
            'is_paid' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $nursingService = NursingService::find($id);

        if (!$nursingService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service not found'
            ], 404);
        }

        $nursingService->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Nursing service updated successfully',
            'data' => $nursingService
        ]);
    }

    /**
     * Remove the specified nursing service from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $nursingService = NursingService::find($id);

        if (!$nursingService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service not found'
            ], 404);
        }

        $nursingService->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Nursing service deleted successfully'
        ]);
    }

    /**
     * Accept a nursing service request (for nursing providers)
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function accept($id)
    {
        $nursingService = NursingService::find($id);

        if (!$nursingService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service not found'
            ], 404);
        }

        // Check if the service is in a state that can be accepted
        if ($nursingService->status !== 'scheduled') {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service cannot be accepted in its current status'
            ], 400);
        }

        try {
            // Update status to confirmed
            $nursingService->update(['status' => 'confirmed']);

            // Reload with relationships
            $nursingService = $nursingService->fresh(['patient', 'nursingProvider']);

            return response()->json([
                'status' => 'success',
                'message' => 'Nursing service accepted successfully',
                'data' => $nursingService
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to accept nursing service: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm a nursing service request (alias for accept)
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirm($id)
    {
        return $this->accept($id);
    }

    /**
     * Reject a nursing service request
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject($id, Request $request)
    {
        $nursingService = NursingService::find($id);

        if (!$nursingService) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service not found'
            ], 404);
        }

        // Check if the service is in a state that can be rejected
        if (!in_array($nursingService->status, ['scheduled', 'confirmed'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nursing service cannot be rejected in its current status'
            ], 400);
        }

        try {
            $updateData = ['status' => 'cancelled'];

            // Add rejection reason if provided
            if ($request->has('rejection_reason')) {
                $updateData['care_notes'] = $request->rejection_reason;
            }

            $nursingService->update($updateData);

            // Reload with relationships
            $nursingService = $nursingService->fresh(['patient', 'nursingProvider']);

            return response()->json([
                'status' => 'success',
                'message' => 'Nursing service rejected successfully',
                'data' => $nursingService
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reject nursing service: ' . $e->getMessage()
            ], 500);
        }
    }
}
