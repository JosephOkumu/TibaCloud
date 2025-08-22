<?php

namespace App\Http\Controllers;

use App\Models\LabAppointment;
use App\Models\LabTestService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class LabAppointmentController extends Controller
{
    /**
     * Display a listing of lab appointments.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = LabAppointment::query();

        // Filter by patient_id if provided or current user if patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        } else if (Auth::check()) {
            $query->where('patient_id', Auth::id());
        }

        // Filter by lab_provider_id if provided
        if ($request->has('lab_provider_id')) {
            $query->where('lab_provider_id', $request->lab_provider_id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->with(['patient', 'labProvider.user', 'labTests'])
            ->orderBy('appointment_datetime', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $appointments
        ]);
    }

    /**
     * Store a newly created lab appointment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:users,id',
            'lab_provider_id' => 'required|exists:lab_providers,id',
            'appointment_datetime' => 'required|date|after:now',
            'test_ids' => 'required|array',
            'test_ids.*' => 'exists:lab_test_services,id',
            'total_amount' => 'required|numeric|min:0',
            'payment_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Calculate total amount from selected tests
        $testIds = $request->test_ids;
        $tests = LabTestService::whereIn('id', $testIds)->get();
        $calculatedTotal = $tests->sum('price');

        // Verify the provided total matches calculated total
        if (abs($calculatedTotal - $request->total_amount) > 0.01) {
            return response()->json([
                'status' => 'error',
                'message' => 'Total amount does not match selected tests'
            ], 422);
        }

        // Set default values
        $data = $request->all();
        $data['status'] = 'scheduled';
        $data['is_paid'] = !empty($request->payment_reference);

        $appointment = LabAppointment::create($data);

        // Attach the tests to the appointment
        $appointment->labTests()->attach($testIds);

        // Load relationships for response
        $appointment->load(['patient', 'labProvider.user', 'labTests']);

        return response()->json([
            'status' => 'success',
            'message' => 'Lab appointment created successfully',
            'data' => $appointment
        ], 201);
    }

    /**
     * Display the specified lab appointment.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $appointment = LabAppointment::with(['patient', 'labProvider.user', 'labTests'])->find($id);

        if (!$appointment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab appointment not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $appointment
        ]);
    }

    /**
     * Update the specified lab appointment in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'appointment_datetime' => 'date|after:now',
            'status' => 'in:scheduled,confirmed,completed,cancelled,rescheduled,in_progress',
            'test_ids' => 'array',
            'test_ids.*' => 'exists:lab_test_services,id',
            'total_amount' => 'numeric|min:0',
            'is_paid' => 'boolean',
            'payment_reference' => 'nullable|string',
            'notes' => 'nullable|string',
            'results' => 'nullable|string',
            'lab_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = LabAppointment::find($id);

        if (!$appointment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab appointment not found'
            ], 404);
        }

        // Update the appointment
        $appointment->update($request->all());

        // Update test associations if test_ids provided
        if ($request->has('test_ids')) {
            $appointment->labTests()->sync($request->test_ids);
        }

        // Load relationships for response
        $appointment->load(['patient', 'labProvider.user', 'labTests']);

        return response()->json([
            'status' => 'success',
            'message' => 'Lab appointment updated successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Remove the specified lab appointment from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $appointment = LabAppointment::find($id);

        if (!$appointment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lab appointment not found'
            ], 404);
        }

        // Detach tests before deleting
        $appointment->labTests()->detach();
        $appointment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Lab appointment deleted successfully'
        ]);
    }

    /**
     * Get occupied time slots for a lab provider on a specific date.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $providerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOccupiedTimes(Request $request, $providerId)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = $request->date;
        $startOfDay = $date . ' 00:00:00';
        $endOfDay = $date . ' 23:59:59';

        $occupiedTimes = LabAppointment::where('lab_provider_id', $providerId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('appointment_datetime', [$startOfDay, $endOfDay])
            ->pluck('appointment_datetime')
            ->map(function ($datetime) {
                return date('g:i A', strtotime($datetime));
            })
            ->toArray();

        return response()->json([
            'status' => 'success',
            'data' => $occupiedTimes
        ]);
    }

    /**
     * Get fully booked dates for a lab provider.
     *
     * @param  int  $providerId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFullyBookedDates($providerId)
    {
        // Available time slots (7:00 AM to 4:30 PM, 30-minute intervals)
        $totalSlotsPerDay = 20;

        $fullyBookedDates = [];

        // Check next 60 days
        for ($i = 0; $i < 60; $i++) {
            $date = date('Y-m-d', strtotime("+$i days"));
            $startOfDay = $date . ' 00:00:00';
            $endOfDay = $date . ' 23:59:59';

            $bookedCount = LabAppointment::where('lab_provider_id', $providerId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('appointment_datetime', [$startOfDay, $endOfDay])
                ->count();

            if ($bookedCount >= $totalSlotsPerDay) {
                $fullyBookedDates[] = $date;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $fullyBookedDates
        ]);
    }


}
