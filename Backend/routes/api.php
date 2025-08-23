<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\LabProviderController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\LabTestServiceController;
use App\Http\Controllers\NursingProviderController;
use App\Http\Controllers\NursingServiceController;
use App\Http\Controllers\NursingServiceOfferingController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\MedicineOrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\LabAppointmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Doctor routes
    Route::apiResource('doctors', DoctorController::class);
    Route::get('/doctor/debug', [DoctorController::class, 'debug']);
    Route::get('/doctor/test-auth', function() {
        return response()->json([
            'authenticated' => true,
            'user' => Auth::user(),
            'timestamp' => now()
        ]);
    });
    Route::get('/doctor/profile', [DoctorController::class, 'profile']);
    Route::get('/doctor/profile', [DoctorController::class, 'profile']);
    Route::patch('/doctor/profile', [DoctorController::class, 'updateProfile']);
    Route::post('/doctor/upload-image', [DoctorController::class, 'uploadProfileImage']);

    // Doctor booking routes
    Route::get('/doctors/{id}/occupied-dates', [DoctorController::class, 'getOccupiedDates']);
    Route::get('/doctors/{id}/occupied-times', [DoctorController::class, 'getOccupiedTimes']);

    // Appointment routes
    Route::apiResource('appointments', AppointmentController::class);
    Route::get('/patient/appointments', [AppointmentController::class, 'index'])->name('patient.appointments');
    Route::get('/doctor/appointments', [AppointmentController::class, 'index'])->name('doctor.appointments');

    // Lab Provider routes
    Route::apiResource('lab-providers', LabProviderController::class);
    Route::get('/lab-provider/debug', [LabProviderController::class, 'debug']);
    Route::get('/lab-provider/profile', [LabProviderController::class, 'profile']);
    Route::put('/lab-provider/profile', [LabProviderController::class, 'updateProfile']);
    Route::post('/lab-provider/upload-image', [LabProviderController::class, 'uploadProfileImage']);

    // Lab provider booking routes
    Route::get('/lab-providers/{id}/occupied-dates', [LabProviderController::class, 'getOccupiedDates']);
    Route::get('/lab-providers/{id}/occupied-times', [LabProviderController::class, 'getOccupiedTimes']);
    Route::get('/lab-providers/{id}/fully-booked-dates', [LabAppointmentController::class, 'getFullyBookedDates']);

    // Lab Appointment routes
    Route::apiResource('lab-appointments', LabAppointmentController::class);
    Route::get('/patient/lab-appointments', [LabAppointmentController::class, 'index'])->name('patient.lab-appointments');
    Route::get('/lab-providers/{id}/occupied-times', [LabAppointmentController::class, 'getOccupiedTimes']);

    // Lab Test Service routes (for lab providers)
    Route::get('/lab-provider/test-services', [LabTestServiceController::class, 'index']);
    Route::post('/lab-provider/test-services', [LabTestServiceController::class, 'store']);
    Route::get('/lab-provider/test-services/{id}', [LabTestServiceController::class, 'show']);
    Route::put('/lab-provider/test-services/{id}', [LabTestServiceController::class, 'update']);
    Route::delete('/lab-provider/test-services/{id}', [LabTestServiceController::class, 'destroy']);
    Route::patch('/lab-provider/test-services/{id}/toggle-status', [LabTestServiceController::class, 'toggleStatus']);

    // Lab Test routes
    Route::apiResource('lab-tests', LabTestController::class);
    Route::get('/patient/lab-tests', [LabTestController::class, 'index'])->name('patient.lab-tests');
    Route::get('/lab-provider/lab-tests', [LabTestController::class, 'index'])->name('lab-provider.lab-tests');

    // Nursing Provider routes
    Route::apiResource('nursing-providers', NursingProviderController::class);
    Route::get('/nursing-provider/profile', [NursingProviderController::class, 'profile']);
    Route::put('/nursing-provider/profile', [NursingProviderController::class, 'updateProfile']);
    Route::patch('/nursing-provider/profile', [NursingProviderController::class, 'updateProfile']);
    Route::post('/nursing-provider/upload-image', [NursingProviderController::class, 'uploadProfileImage']);

    // Nursing provider booking routes
    Route::get('/nursing-providers/{id}/occupied-dates', [NursingProviderController::class, 'getOccupiedDates']);
    Route::get('/nursing-providers/{id}/occupied-times', [NursingProviderController::class, 'getOccupiedTimes']);

    // Nursing Service Offerings routes (for providers to manage their services)
    Route::get('/nursing-provider/service-offerings', [NursingServiceOfferingController::class, 'index']);
    Route::post('/nursing-provider/service-offerings', [NursingServiceOfferingController::class, 'store']);
    Route::get('/nursing-provider/service-offerings/{id}', [NursingServiceOfferingController::class, 'show']);
    Route::put('/nursing-provider/service-offerings/{id}', [NursingServiceOfferingController::class, 'update']);
    Route::delete('/nursing-provider/service-offerings/{id}', [NursingServiceOfferingController::class, 'destroy']);

    // Public routes for service offerings (for patients to view)
    Route::get('/service-offerings', [NursingServiceOfferingController::class, 'publicIndex']);
    Route::get('/nursing-providers/{providerId}/service-offerings', [NursingServiceOfferingController::class, 'getByProvider']);

    // Nursing Service routes
    Route::apiResource('nursing-services', NursingServiceController::class);
    Route::get('/patient/nursing-services', [NursingServiceController::class, 'index'])->name('patient.nursing-services');
    Route::get('/nursing-provider/nursing-services', [NursingServiceController::class, 'index'])->name('nursing-provider.nursing-services');
    Route::put('/nursing-services/{id}/accept', [NursingServiceController::class, 'accept']);
    Route::put('/nursing-services/{id}/confirm', [NursingServiceController::class, 'confirm']);
    Route::put('/nursing-services/{id}/reject', [NursingServiceController::class, 'reject']);

    // Pharmacy routes
    Route::apiResource('pharmacies', PharmacyController::class);

    // Medicine routes
    Route::apiResource('medicines', MedicineController::class);
    Route::get('/pharmacy/medicines', [MedicineController::class, 'index'])->name('pharmacy.medicines');

    // Medicine Order routes
    Route::apiResource('medicine-orders', MedicineOrderController::class);
    Route::get('/patient/medicine-orders', [MedicineOrderController::class, 'index'])->name('patient.medicine-orders');
    Route::get('/pharmacy/medicine-orders', [MedicineOrderController::class, 'index'])->name('pharmacy.medicine-orders');
});

// Public medicine search route
Route::get('/medicines/search', [MedicineController::class, 'index']);

// Public route to get test services by lab provider
Route::get('/lab-providers/{labProviderId}/test-services', [LabTestServiceController::class, 'getByLabProvider']);

// Public route to get all doctors
Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);



// M-Pesa Payment routes
Route::prefix('payments/mpesa')->group(function () {
    // Public routes for M-Pesa authentication and callbacks
    Route::post('/auth', [PaymentController::class, 'generateAccessToken']);
    Route::post('/callback', [PaymentController::class, 'handleCallback']);
    Route::get('/test', [PaymentController::class, 'testConnection']);

    // Protected routes for payment processing
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/stk-push', [PaymentController::class, 'initiateSTKPush']);
        Route::get('/status/{checkoutRequestId}', [PaymentController::class, 'getPaymentResult']);
    });
});

// Stellar/Soroban Payment routes
Route::prefix('payments/stellar')->group(function () {
    // Public test route for Stellar integration
    Route::post('/test-integration', [PaymentController::class, 'testStellarIntegration']);

    // Protected routes for Stellar payment operations
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/status/{checkoutRequestId}', [PaymentController::class, 'getStellarPaymentStatus']);
    });
});

// Pesapal Payment routes
Route::prefix('payments/pesapal')->group(function () {
    // Public routes for Pesapal IPN callback
    Route::post('/ipn', [PaymentController::class, 'handlePesapalIPN']);
    Route::get('/test', [PaymentController::class, 'testPesapalConnection']);
    Route::get('/auth-token', [PaymentController::class, 'getPesapalAuthToken']);
    Route::post('/register-ipn', [PaymentController::class, 'registerPesapalIPN']);

    // Protected routes for payment processing
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/initiate', [PaymentController::class, 'initiatePesapalPayment']);
        Route::get('/status/{merchantReference}', [PaymentController::class, 'getPesapalPaymentStatus']);
    });
});
