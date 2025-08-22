import api from "./api";

export interface Doctor {
  id: number;
  user_id: number;
  specialty: string;
  description?: string;
  professional_summary?: string;
  years_of_experience?: string;
  hospital?: string;
  location?: string;
  license_number: string;
  experience?: string;
  default_consultation_fee: number;
  physical_consultation_fee?: number;
  online_consultation_fee?: number;
  profile_image?: string;
  bio?: string;
  languages?: string;
  accepts_insurance: boolean;
  consultation_modes?: string[];
  availability?: string;
  is_available_for_consultation: boolean;
  average_rating: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
}

export interface DoctorProfileUpdateData {
  name?: string;
  specialty?: string;
  description?: string;
  hospital?: string;
  location?: string;
  availability?: string;
  experience?: string;
  physicalPrice?: number;
  onlinePrice?: number;
  languages?: string;
  acceptsInsurance?: boolean;
  consultationModes?: string[];
}

const doctorService = {
  // Get all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get<{ data: Doctor[] }>("/doctors");
    return response.data.data;
  },

  // Get a specific doctor
  getDoctor: async (id: number): Promise<Doctor> => {
    const response = await api.get<{ data: Doctor }>(`/doctors/${id}`);
    return response.data.data;
  },

  // Create or update doctor profile (for doctor users)
  updateDoctorProfile: async (data: Partial<Doctor>): Promise<Doctor> => {
    const doctorId = data.id;
    if (doctorId) {
      // Update existing profile
      const response = await api.put<{ data: Doctor }>(
        `/doctors/${doctorId}`,
        data,
      );
      return response.data.data;
    } else {
      // Create new profile
      const response = await api.post<{ data: Doctor }>("/doctors", data);
      return response.data.data;
    }
  },

  // Get current doctor profile
  getProfile: async (): Promise<Doctor> => {
    const response = await api.get<{ data: Doctor }>("/doctor/profile");
    return response.data.data;
  },

  // Update current doctor profile
  updateProfile: async (data: DoctorProfileUpdateData): Promise<Doctor> => {
    const response = await api.patch<{ data: Doctor }>("/doctor/profile", data);
    return response.data.data;
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<string> => {
    console.log("=== DOCTOR SERVICE IMAGE UPLOAD ===");
    console.log("File to upload:", file.name, file.size, file.type);

    const formData = new FormData();
    formData.append("profile_image", file);

    console.log("FormData created, making API call...");

    const response = await api.post<{
      status: string;
      data: { profile_image: string };
    }>("/doctor/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload response:", response.data);
    console.log("New image URL:", response.data.data.profile_image);

    return response.data.data.profile_image;
  },

  // Search doctors by specialty or name
  searchDoctors: async (query: string): Promise<Doctor[]> => {
    const response = await api.get<{ data: Doctor[] }>("/doctors", {
      params: { search: query },
    });
    return response.data.data;
  },
};

export default doctorService;
