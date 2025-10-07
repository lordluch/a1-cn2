export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle extends BaseEntity {
  brand: string;
  model: string;
  year: number;
  plate: string;
  pricePerDay: number;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
  color: string;
  fuelType: 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
}

export interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  plate: string;
  pricePerDay: number;
  description?: string;
  color: string;
  fuelType: 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  seats: number;
  image?: File;
}

export interface Customer extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  driverLicense: string;
  driverLicenseExpiry: Date;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  driverLicense: string;
  driverLicenseExpiry: Date;
}

export interface Rental extends BaseEntity {
  vehicleId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  vehicle?: Vehicle;
  customer?: Customer;
}

export interface CreateRentalData {
  vehicleId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  fuelType?: string;
  transmission?: string;
  minYear?: number;
  maxYear?: number;
}

export interface CustomerFilters {
  name?: string;
  email?: string;
  cpf?: string;
}

export interface RentalFilters {
  status?: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  vehicleId?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: 'create' | 'edit' | 'delete' | 'view';
  data?: any;
}
