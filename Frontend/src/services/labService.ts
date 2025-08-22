import api from "./api";

export interface LabProvider {
  id: number;
  user_id: number;
  lab_name: string;
  license_number: string;
  website?: string;
  address: string;
  operating_hours?: string;
  description?: string;
  contact_person_name?: string;
  contact_person_role?: string;
  profile_image?: string;
  certifications?: string[];
  is_available: boolean;
  average_rating: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
  };
}

export interface LabProfileUpdateData {
  lab_name?: string;
  license_number?: string;
  website?: string;
  address?: string;
  operating_hours?: string;
  description?: string;
  contact_person_name?: string;
  contact_person_role?: string;
  profile_image?: string;
  certifications?: string[];
  is_available?: boolean;
}

export interface LabTestService {
  id?: number;
  lab_provider_id?: number;
  test_name: string;
  description?: string;
  price: number;
  turnaround_time?: string;
  sample_type?: string;
  preparation_instructions?: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LabTestServiceCreateData {
  test_name: string;
  description?: string;
  price: number;
  turnaround_time?: string;
  sample_type?: string;
  preparation_instructions?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface LabTest {
  id: number;
  patient_id: number;
  lab_provider_id: number;
  test_name: string;
  test_type: string;
  status: string; // e.g., 'pending', 'processing', 'completed'
  results?: string;
  requested_date: string;
  completion_date?: string;
  notes?: string;
  lab_provider?: LabProvider;
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

export interface LabTestCreateData {
  lab_provider_id: number;
  test_name: string;
  test_type: string;
  notes?: string;
}

const labService = {
  // Lab Provider methods
  getAllLabProviders: async (): Promise<LabProvider[]> => {
    const response = await api.get<{ data: LabProvider[] }>("/lab-providers");
    return response.data.data;
  },

  getLabProvider: async (id: number): Promise<LabProvider> => {
    const response = await api.get<{ data: LabProvider }>(
      `/lab-providers/${id}`,
    );
    return response.data.data;
  },

  updateLabProviderProfile: async (
    data: Partial<LabProvider>,
  ): Promise<LabProvider> => {
    const providerId = data.id;
    if (providerId) {
      // Update existing profile
      const response = await api.put<{ data: LabProvider }>(
        `/lab-providers/${providerId}`,
        data,
      );
      return response.data.data;
    } else {
      // Create new profile
      const response = await api.post<{ data: LabProvider }>(
        "/lab-providers",
        data,
      );
      return response.data.data;
    }
  },

  // Get current lab provider profile
  getProfile: async (): Promise<LabProvider> => {
    const response = await api.get<{ data: LabProvider }>(
      "/lab-provider/profile",
    );
    return response.data.data;
  },

  // Update current lab provider profile
  updateProfile: async (data: LabProfileUpdateData): Promise<LabProvider> => {
    const response = await api.put<{ data: LabProvider }>(
      "/lab-provider/profile",
      data,
    );
    return response.data.data;
  },

  // Lab Test methods
  getLabTests: async (
    role: "patient" | "lab-provider" = "patient",
  ): Promise<LabTest[]> => {
    const endpoint =
      role === "patient" ? "/patient/lab-tests" : "/lab-provider/lab-tests";
    const response = await api.get<{ data: LabTest[] }>(endpoint);
    return response.data.data;
  },

  getLabTest: async (id: number): Promise<LabTest> => {
    const response = await api.get<{ data: LabTest }>(`/lab-tests/${id}`);
    return response.data.data;
  },

  requestLabTest: async (data: LabTestCreateData): Promise<LabTest> => {
    const response = await api.post<{ data: LabTest }>("/lab-tests", data);
    return response.data.data;
  },

  updateLabTest: async (
    id: number,
    data: Partial<LabTest>,
  ): Promise<LabTest> => {
    const response = await api.put<{ data: LabTest }>(`/lab-tests/${id}`, data);
    return response.data.data;
  },

  // For lab providers to update test results
  updateTestResults: async (
    id: number,
    results: string,
    status: string = "completed",
  ): Promise<LabTest> => {
    const response = await api.put<{ data: LabTest }>(`/lab-tests/${id}`, {
      results,
      status,
      completion_date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
    });
    return response.data.data;
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<string> => {
    console.log("=== LAB SERVICE IMAGE UPLOAD ===");
    console.log("File to upload:", file.name, file.size, file.type);

    const formData = new FormData();
    formData.append("profile_image", file);

    console.log("FormData created, making API call...");

    const response = await api.post<{
      status: string;
      data: { profile_image: string };
    }>("/lab-provider/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Upload response:", response.data);
    console.log("New image URL:", response.data.data.profile_image);

    return response.data.data.profile_image;
  },

  // Test Service Management
  // Get all test services for the authenticated lab provider
  getTestServices: async (): Promise<LabTestService[]> => {
    const response = await api.get<{ status: string; data: LabTestService[] }>(
      "/lab-provider/test-services",
    );
    return response.data.data;
  },

  // Create a new test service
  createTestService: async (
    data: LabTestServiceCreateData,
  ): Promise<LabTestService> => {
    const response = await api.post<{
      status: string;
      data: LabTestService;
    }>("/lab-provider/test-services", data);
    return response.data.data;
  },

  // Get a specific test service
  getTestService: async (id: number): Promise<LabTestService> => {
    const response = await api.get<{
      status: string;
      data: LabTestService;
    }>(`/lab-provider/test-services/${id}`);
    return response.data.data;
  },

  // Update a test service
  updateTestService: async (
    id: number,
    data: Partial<LabTestServiceCreateData>,
  ): Promise<LabTestService> => {
    const response = await api.put<{
      status: string;
      data: LabTestService;
    }>(`/lab-provider/test-services/${id}`, data);
    return response.data.data;
  },

  // Delete a test service
  deleteTestService: async (id: number): Promise<void> => {
    await api.delete(`/lab-provider/test-services/${id}`);
  },

  // Toggle test service status (active/inactive)
  toggleTestServiceStatus: async (id: number): Promise<LabTestService> => {
    const response = await api.patch<{
      status: string;
      data: LabTestService;
    }>(`/lab-provider/test-services/${id}/toggle-status`);
    return response.data.data;
  },

  // Get test services for a specific lab provider (public)
  getTestServicesByProvider: async (
    labProviderId: number,
  ): Promise<{
    testServices: LabTestService[];
    labProvider: { id: number; lab_name: string; address: string };
  }> => {
    const response = await api.get<{
      status: string;
      data: LabTestService[];
      lab_provider: { id: number; lab_name: string; address: string };
    }>(`/lab-providers/${labProviderId}/test-services`);
    return {
      testServices: response.data.data,
      labProvider: response.data.lab_provider,
    };
  },
};

export default labService;
