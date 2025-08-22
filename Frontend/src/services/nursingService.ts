import api from "./api";

export interface NursingProvider {
  id: number;
  user_id: number;
  provider_name: string;
  description: string;
  license_number: string;
  qualifications: string;
  services_offered: string;
  service_areas?: string[];
  logo?: string;
  base_rate_per_hour: number;
  is_available: boolean;
  average_rating: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
  nursingServiceOfferings?: NursingServiceOffering[];
}

export interface NursingService {
  id: number;
  patient_id: number;
  nursing_provider_id: number;
  service_type: string;
  status: string; // e.g., 'requested', 'in-progress', 'completed', 'cancelled'
  start_date: string;
  end_date?: string;
  location: string;
  notes?: string;
  nursing_provider?: NursingProvider;
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

export interface NursingServiceCreateData {
  nursing_provider_id: number;
  service_type: string;
  start_date: string;
  location: string;
  notes?: string;
}

export interface NursingProviderProfileUpdateData {
  name?: string;
  provider_name?: string;
  description?: string;
  location?: string;
  availability?: string;
  experience?: string;
  qualifications?: string;
  services_offered?: string;
  base_rate_per_hour?: number;
  phone_number?: string;
  email?: string;
}

export interface NursingServiceOffering {
  id: number;
  nursing_provider_id: number;
  name: string;
  description: string;
  location: string;
  availability: string;
  experience: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NursingServiceOfferingCreateData {
  name: string;
  description: string;
  location: string;
  availability: string;
  experience: string;
  price: number;
}

const nursingService = {
  // Nursing Provider methods
  getAllNursingProviders: async (): Promise<NursingProvider[]> => {
    const response = await api.get<{ data: NursingProvider[] }>(
      "/nursing-providers",
    );
    return response.data.data;
  },

  getNursingProvider: async (id: number): Promise<NursingProvider> => {
    const response = await api.get<{ data: NursingProvider }>(
      `/nursing-providers/${id}`,
    );
    return response.data.data;
  },

  updateNursingProviderProfile: async (
    data: Partial<NursingProvider>,
  ): Promise<NursingProvider> => {
    const providerId = data.id;
    if (providerId) {
      // Update existing profile
      const response = await api.put<{ data: NursingProvider }>(
        `/nursing-providers/${providerId}`,
        data,
      );
      return response.data.data;
    } else {
      // Create new profile
      const response = await api.post<{ data: NursingProvider }>(
        "/nursing-providers",
        data,
      );
      return response.data.data;
    }
  },

  // Nursing Service methods
  getNursingServices: async (
    role: "patient" | "nursing-provider" = "patient",
  ): Promise<NursingService[]> => {
    const endpoint =
      role === "patient"
        ? "/patient/nursing-services"
        : "/nursing-provider/nursing-services";
    const response = await api.get<{ data: NursingService[] }>(endpoint);
    return response.data.data;
  },

  getNursingService: async (id: number): Promise<NursingService> => {
    const response = await api.get<{ data: NursingService }>(
      `/nursing-services/${id}`,
    );
    return response.data.data;
  },

  requestNursingService: async (
    data: NursingServiceCreateData,
  ): Promise<NursingService> => {
    const response = await api.post<{ data: NursingService }>(
      "/nursing-services",
      data,
    );
    return response.data.data;
  },

  updateNursingService: async (
    id: number,
    data: Partial<NursingService>,
  ): Promise<NursingService> => {
    const response = await api.put<{ data: NursingService }>(
      `/nursing-services/${id}`,
      data,
    );
    return response.data.data;
  },

  completeNursingService: async (
    id: number,
    notes?: string,
  ): Promise<NursingService> => {
    const response = await api.put<{ data: NursingService }>(
      `/nursing-services/${id}`,
      {
        status: "completed",
        end_date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        notes: notes,
      },
    );
    return response.data.data;
  },

  // Profile management methods
  getProfile: async (): Promise<NursingProvider> => {
    const response = await api.get<{ data: NursingProvider }>(
      "/nursing-provider/profile",
    );
    return response.data.data;
  },

  updateProfile: async (
    data: NursingProviderProfileUpdateData,
  ): Promise<NursingProvider> => {
    const response = await api.patch<{ data: NursingProvider }>(
      "/nursing-provider/profile",
      data,
    );
    return response.data.data;
  },

  uploadProfileImage: async (file: File): Promise<string> => {
    console.log("=== NURSING SERVICE IMAGE UPLOAD ===");
    console.log("File to upload:", file.name, file.size, file.type);

    const formData = new FormData();
    formData.append("profile_image", file);

    console.log("FormData created, making API call...");

    const response = await api.post<{
      status: string;
      data: { profile_image: string };
    }>("/nursing-provider/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload response:", response.data);
    console.log("New image URL:", response.data.data.profile_image);

    return response.data.data.profile_image;
  },

  // Service Offerings management methods
  getServiceOfferings: async (): Promise<NursingServiceOffering[]> => {
    const response = await api.get<{ data: NursingServiceOffering[] }>(
      "/nursing-provider/service-offerings",
    );
    return response.data.data;
  },

  createServiceOffering: async (
    data: NursingServiceOfferingCreateData,
  ): Promise<NursingServiceOffering> => {
    const response = await api.post<{ data: NursingServiceOffering }>(
      "/nursing-provider/service-offerings",
      data,
    );
    return response.data.data;
  },

  updateServiceOffering: async (
    id: number,
    data: Partial<NursingServiceOfferingCreateData>,
  ): Promise<NursingServiceOffering> => {
    const response = await api.put<{ data: NursingServiceOffering }>(
      `/nursing-provider/service-offerings/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteServiceOffering: async (id: number): Promise<void> => {
    await api.delete(`/nursing-provider/service-offerings/${id}`);
  },

  // Public service offerings methods (for patients to view)
  getAllServiceOfferings: async (): Promise<NursingServiceOffering[]> => {
    const response = await api.get<{ data: NursingServiceOffering[] }>(
      "/service-offerings",
    );
    return response.data.data;
  },

  getProviderServiceOfferings: async (
    providerId: number,
  ): Promise<NursingServiceOffering[]> => {
    const response = await api.get<{ data: NursingServiceOffering[] }>(
      `/nursing-providers/${providerId}/service-offerings`,
    );
    return response.data.data;
  },

  // Accept/Reject nursing service requests
  acceptNursingService: async (id: number): Promise<NursingService> => {
    const response = await api.put<{ data: NursingService }>(
      `/nursing-services/${id}/accept`,
    );
    return response.data.data;
  },

  confirmNursingService: async (id: number): Promise<NursingService> => {
    const response = await api.put<{ data: NursingService }>(
      `/nursing-services/${id}/confirm`,
    );
    return response.data.data;
  },

  rejectNursingService: async (
    id: number,
    rejectionReason?: string,
  ): Promise<NursingService> => {
    const response = await api.put<{ data: NursingService }>(
      `/nursing-services/${id}/reject`,
      {
        rejection_reason: rejectionReason,
      },
    );
    return response.data.data;
  },

  // Get occupied dates for a nursing provider
  getOccupiedDates: async (providerId: number): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/nursing-providers/${providerId}/occupied-dates`,
    );
    return response.data.data;
  },

  // Get occupied time slots for a nursing provider on a specific date
  getOccupiedTimes: async (
    providerId: number,
    date: string,
  ): Promise<string[]> => {
    const response = await api.get<{ data: string[] }>(
      `/nursing-providers/${providerId}/occupied-times?date=${date}`,
    );
    return response.data.data;
  },
};

export default nursingService;
