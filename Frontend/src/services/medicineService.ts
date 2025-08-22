import api from './api';

export interface Pharmacy {
  id: number;
  user_id: number;
  location: string;
  operating_hours: string;
  services: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    license_number: string;
  };
}

export interface Medicine {
  id: number;
  pharmacy_id: number;
  name: string;
  description: string;
  price: number;
  quantity_available: number;
  dosage_form: string; // e.g., 'tablet', 'capsule', 'syrup'
  active_ingredients: string;
  pharmacy?: Pharmacy;
}

export interface MedicineOrder {
  id: number;
  patient_id: number;
  pharmacy_id: number;
  status: string; // e.g., 'pending', 'processing', 'completed', 'cancelled'
  total_amount: number;
  order_date: string;
  delivery_date?: string;
  delivery_address: string;
  notes?: string;
  pharmacy?: Pharmacy;
  patient?: {
    id: number;
    user_id: number;
    user: {
      name: string;
      email: string;
      phone_number: string;
    }
  };
  items: MedicineOrderItem[];
}

export interface MedicineOrderItem {
  id: number;
  medicine_order_id: number;
  medicine_id: number;
  quantity: number;
  price: number;
  medicine?: Medicine;
}

export interface MedicineOrderCreateData {
  pharmacy_id: number;
  delivery_address: string;
  notes?: string;
  items: {
    medicine_id: number;
    quantity: number;
  }[];
}

const medicineService = {
  // Pharmacy methods
  getAllPharmacies: async (): Promise<Pharmacy[]> => {
    const response = await api.get<{ data: Pharmacy[] }>('/pharmacies');
    return response.data.data;
  },

  getPharmacy: async (id: number): Promise<Pharmacy> => {
    const response = await api.get<{ data: Pharmacy }>(`/pharmacies/${id}`);
    return response.data.data;
  },

  updatePharmacyProfile: async (data: Partial<Pharmacy>): Promise<Pharmacy> => {
    const pharmacyId = data.id;
    if (pharmacyId) {
      // Update existing profile
      const response = await api.put<{ data: Pharmacy }>(`/pharmacies/${pharmacyId}`, data);
      return response.data.data;
    } else {
      // Create new profile
      const response = await api.post<{ data: Pharmacy }>('/pharmacies', data);
      return response.data.data;
    }
  },

  // Medicine methods
  getAllMedicines: async (pharmacyId?: number): Promise<Medicine[]> => {
    const endpoint = pharmacyId ? `/pharmacy/medicines` : '/medicines';
    const params = pharmacyId ? { pharmacy_id: pharmacyId } : {};
    
    const response = await api.get<{ data: Medicine[] }>(endpoint, { params });
    return response.data.data;
  },

  getMedicine: async (id: number): Promise<Medicine> => {
    const response = await api.get<{ data: Medicine }>(`/medicines/${id}`);
    return response.data.data;
  },

  searchMedicines: async (query: string): Promise<Medicine[]> => {
    const response = await api.get<{ data: Medicine[] }>('/medicines/search', {
      params: { search: query }
    });
    return response.data.data;
  },

  // For pharmacy users to manage their medicines
  createMedicine: async (data: Partial<Medicine>): Promise<Medicine> => {
    const response = await api.post<{ data: Medicine }>('/medicines', data);
    return response.data.data;
  },

  updateMedicine: async (id: number, data: Partial<Medicine>): Promise<Medicine> => {
    const response = await api.put<{ data: Medicine }>(`/medicines/${id}`, data);
    return response.data.data;
  },

  deleteMedicine: async (id: number): Promise<void> => {
    await api.delete(`/medicines/${id}`);
  },

  // Medicine Order methods
  getMedicineOrders: async (role: 'patient' | 'pharmacy' = 'patient'): Promise<MedicineOrder[]> => {
    const endpoint = role === 'patient' ? '/patient/medicine-orders' : '/pharmacy/medicine-orders';
    const response = await api.get<{ data: MedicineOrder[] }>(endpoint);
    return response.data.data;
  },

  getMedicineOrder: async (id: number): Promise<MedicineOrder> => {
    const response = await api.get<{ data: MedicineOrder }>(`/medicine-orders/${id}`);
    return response.data.data;
  },

  createMedicineOrder: async (data: MedicineOrderCreateData): Promise<MedicineOrder> => {
    const response = await api.post<{ data: MedicineOrder }>('/medicine-orders', data);
    return response.data.data;
  },

  updateMedicineOrderStatus: async (id: number, status: string): Promise<MedicineOrder> => {
    const response = await api.put<{ data: MedicineOrder }>(`/medicine-orders/${id}`, { status });
    return response.data.data;
  }
};

export default medicineService;
