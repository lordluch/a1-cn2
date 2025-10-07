import { Vehicle, Customer, Rental, CreateVehicleData, CreateCustomerData, CreateRentalData } from '@/types';

const API_BASE = '/api';

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  const data = await response.json();
  return data.data || data;
}

export const vehicleApi = {
  async list(): Promise<Vehicle[]> {
    return apiCall<Vehicle[]>('/vehicles');
  },

  async get(id: string): Promise<Vehicle> {
    return apiCall<Vehicle>(`/vehicles/${id}`);
  },

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const formData = new FormData();
    formData.append('brand', data.brand);
    formData.append('model', data.model);
    formData.append('year', data.year.toString());
    formData.append('plate', data.plate);
    formData.append('pricePerDay', data.pricePerDay.toString());
    formData.append('description', data.description || '');
    formData.append('color', data.color);
    formData.append('fuelType', data.fuelType);
    formData.append('transmission', data.transmission);
    formData.append('seats', data.seats.toString());
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create vehicle');
    }

    const result = await response.json();
    return result.data;
  },

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update vehicle');
    }

    const result = await response.json();
    return result.data;
  },

  async delete(id: string): Promise<void> {
    await apiCall(`/vehicles/${id}`, { method: 'DELETE' });
  },
};

export const customerApi = {
  async list(): Promise<Customer[]> {
    return apiCall<Customer[]>('/customers');
  },

  async get(id: string): Promise<Customer> {
    return apiCall<Customer>(`/customers/${id}`);
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    return apiCall<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiCall<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiCall(`/customers/${id}`, { method: 'DELETE' });
  },
};

export const rentalApi = {
  async list(): Promise<Rental[]> {
    return apiCall<Rental[]>('/rentals');
  },

  async get(id: string): Promise<Rental> {
    return apiCall<Rental>(`/rentals/${id}`);
  },

  async create(data: CreateRentalData): Promise<Rental> {
    return apiCall<Rental>('/rentals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Rental>): Promise<Rental> {
    return apiCall<Rental>(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiCall(`/rentals/${id}`, { method: 'DELETE' });
  },
};
