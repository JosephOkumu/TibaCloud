import api from "./api";
import { Doctor } from "./doctorService";
import { LabProvider, LabTestService } from "./labService";
import { NursingProvider, NursingServiceOffering } from "./nursingService";

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_datetime: string;
  status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "no_show";
  type: "in_person" | "virtual";
  reason_for_visit?: string;
  symptoms?: string;
  doctor_notes?: string;
  prescription?: string;
  meeting_link?: string;
  fee: number;
  is_paid: boolean;
  // Legacy fields for backward compatibility
  date?: string;
  time?: string;
  notes?: string;
  doctor?: Doctor;
  patient?: {
    id: number;
    user_id: number;
    user: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
}

export interface LabAppointment {
  id: number;
  patient_id: number;
  lab_provider_id: number;
  appointment_datetime: string;
  status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "in_progress";
  test_ids: number[];
  total_amount: number;
  is_paid: boolean;
  payment_reference?: string;
  notes?: string;
  results?: string;
  lab_notes?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
  // Laravel returns snake_case, so we need to handle both
  labProvider?: LabProvider;
  lab_provider?: LabProvider;
  labTests?: LabTestService[];
  lab_tests?: LabTestService[];
}

export interface NursingAppointment {
  id: number;
  patient_id: number;
  nursing_provider_id: number;
  service_name: string;
  service_description?: string;
  service_price: number;
  scheduled_datetime: string;
  end_datetime?: string;
  patient_address: string;
  status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "in_progress";
  care_notes?: string;
  patient_requirements?: string;
  medical_history?: string;
  doctor_referral?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  patient?: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
  // Laravel returns snake_case, so we need to handle both
  nursingProvider?: NursingProvider;
  nursing_provider?: NursingProvider;
}

export interface NursingAppointmentCreateData {
  patient_id: number;
  nursing_provider_id: number;
  service_name: string;
  service_description?: string;
  service_price: number;
  scheduled_datetime: string;
  end_datetime?: string;
  patient_address: string;
  care_notes?: string;
  patient_requirements?: string;
  medical_history?: string;
  doctor_referral?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface LabAppointmentCreateData {
  patient_id: number;
  lab_provider_id: number;
  appointment_datetime: string;
  test_ids: number[];
  total_amount: number;
  payment_reference?: string;
  notes?: string;
}

export interface AppointmentCreateData {
  doctor_id: number;
  appointment_datetime: string;
  type: "in_person" | "virtual";
  reason_for_visit?: string;
  symptoms?: string;
  fee: number;
  // Legacy fields for backward compatibility
  date?: string;
  time?: string;
  notes?: string;
}

const appointmentService = {
  // Get all appointments (different for patients and doctors)
  getAppointments: async (
    role: "patient" | "doctor" = "patient",
  ): Promise<Appointment[]> => {
    const endpoint =
      role === "patient" ? "/patient/appointments" : "/doctor/appointments";
    const response = await api.get<{ data: Appointment[] }>(endpoint);
    return response.data.data;
  },

  // Get specific appointment
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.get<{ data: Appointment }>(
      `/appointments/${id}`,
    );
    return response.data.data;
  },

  // Create a new appointment
  createAppointment: async (
    data: AppointmentCreateData,
  ): Promise<Appointment> => {
    const response = await api.post<{ data: Appointment }>(
      "/appointments",
      data,
    );
    return response.data.data;
  },

  // Update an appointment
  updateAppointment: async (
    id: number,
    data: Partial<Appointment>,
  ): Promise<Appointment> => {
    const response = await api.put<{ data: Appointment }>(
      `/appointments/${id}`,
      data,
    );
    return response.data.data;
  },

  // Cancel an appointment
  cancelAppointment: async (id: number): Promise<void> => {
    await api.put<void>(`/appointments/${id}`, { status: "cancelled" });
  },

  // Get occupied dates for a specific doctor
  getDoctorOccupiedDates: async (doctorId: number): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/doctors/${doctorId}/occupied-dates`,
    );
    return response.data.data;
  },

  // Get occupied time slots for a specific doctor on a specific date
  getDoctorOccupiedTimes: async (
    doctorId: number,
    date: string,
  ): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/doctors/${doctorId}/occupied-times?date=${date}`,
    );
    return response.data.data;
  },

  // Get occupied dates for a specific nursing provider
  getNursingProviderOccupiedDates: async (
    providerId: number,
  ): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/nursing-providers/${providerId}/occupied-dates`,
    );
    return response.data.data;
  },

  // Get occupied time slots for a specific nursing provider on a specific date
  getNursingProviderOccupiedTimes: async (
    providerId: number,
    date: string,
  ): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/nursing-providers/${providerId}/occupied-times?date=${date}`,
    );
    return response.data.data;
  },

  // Confirm an appointment (for providers)
  confirmAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.put<{ data: Appointment }>(
      `/appointments/${id}/confirm`,
      {},
    );
    return response.data.data;
  },

  // Lab Appointment Methods
  // Get all lab appointments for patient
  getLabAppointments: async (): Promise<LabAppointment[]> => {
    const response = await api.get<{ data: LabAppointment[] }>(
      "/patient/lab-appointments",
    );
    return response.data.data;
  },

  // Create a new lab appointment
  createLabAppointment: async (
    data: LabAppointmentCreateData,
  ): Promise<LabAppointment> => {
    const response = await api.post<{ data: LabAppointment }>(
      "/lab-appointments",
      data,
    );
    return response.data.data;
  },

  // Get specific lab appointment
  getLabAppointment: async (id: number): Promise<LabAppointment> => {
    const response = await api.get<{ data: LabAppointment }>(
      `/lab-appointments/${id}`,
    );
    return response.data.data;
  },

  // Update lab appointment
  updateLabAppointment: async (
    id: number,
    data: Partial<LabAppointment>,
  ): Promise<LabAppointment> => {
    const response = await api.put<{ data: LabAppointment }>(
      `/lab-appointments/${id}`,
      data,
    );
    return response.data.data;
  },

  // Cancel lab appointment
  cancelLabAppointment: async (id: number): Promise<void> => {
    await api.put<void>(`/lab-appointments/${id}`, { status: "cancelled" });
  },

  // Get occupied times for lab provider
  getLabProviderOccupiedTimes: async (
    providerId: number,
    date: string,
  ): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/lab-providers/${providerId}/occupied-times?date=${date}`,
    );
    return response.data.data;
  },

  // Get fully booked dates for lab provider
  getLabProviderFullyBookedDates: async (
    providerId: number,
  ): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/lab-providers/${providerId}/fully-booked-dates`,
    );
    return response.data.data;
  },

  // Nursing Service Appointment Methods
  // Get all nursing appointments for patient
  getNursingAppointments: async (): Promise<NursingAppointment[]> => {
    const response = await api.get<{ data: NursingAppointment[] }>(
      "/patient/nursing-services",
    );
    return response.data.data;
  },

  // Create a new nursing appointment
  createNursingAppointment: async (
    data: NursingAppointmentCreateData,
  ): Promise<NursingAppointment> => {
    const response = await api.post<{ data: NursingAppointment }>(
      "/nursing-services",
      data,
    );
    return response.data.data;
  },

  // Get specific nursing appointment
  getNursingAppointment: async (id: number): Promise<NursingAppointment> => {
    const response = await api.get<{ data: NursingAppointment }>(
      `/nursing-services/${id}`,
    );
    return response.data.data;
  },

  // Update nursing appointment
  updateNursingAppointment: async (
    id: number,
    data: Partial<NursingAppointment>,
  ): Promise<NursingAppointment> => {
    const response = await api.put<{ data: NursingAppointment }>(
      `/nursing-services/${id}`,
      data,
    );
    return response.data.data;
  },

  // Cancel nursing appointment
  cancelNursingAppointment: async (id: number): Promise<void> => {
    await api.put<void>(`/nursing-services/${id}`, { status: "cancelled" });
  },
};

export default appointmentService;
