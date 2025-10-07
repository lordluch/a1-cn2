import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { Vehicle, Customer, Rental } from '@/types';

const getAzureConfig = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME!;
  const tableName = process.env.AZURE_TABLE_NAME!;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
  const accountKey = accountKeyMatch ? accountKeyMatch[1] : '';
  
  return {
    connectionString,
    containerName,
    tableName,
    accountName,
    accountKey
  };
};

let blobServiceClient: BlobServiceClient;
let containerClient: ContainerClient;
let tableClient: TableClient;

const initializeAzureClients = () => {
  if (typeof window !== 'undefined') {
    return { blobServiceClient: null, containerClient: null, tableClient: null };
  }

  const config = getAzureConfig();
  
  if (!config.accountName || !config.accountKey) {
    throw new Error('Azure credentials are missing. Please check your .env.local file.');
  }

  const blobClient = BlobServiceClient.fromConnectionString(config.connectionString);
  const containerClient = blobClient.getContainerClient(config.containerName);
  const tableClient = new TableClient(
    `https://${config.accountName}.table.core.windows.net`,
    config.tableName,
    new AzureNamedKeyCredential(config.accountName, config.accountKey)
  );

  return { blobServiceClient: blobClient, containerClient, tableClient };
};

const { blobServiceClient: bsClient, containerClient: ccClient, tableClient: tcClient } = initializeAzureClients();
blobServiceClient = bsClient as BlobServiceClient;
containerClient = ccClient as ContainerClient;
tableClient = tcClient as TableClient;

export { blobServiceClient, containerClient, tableClient };

export async function ensureContainerExists() {
  if (typeof window !== 'undefined') return;
  
  try {
    const { containerClient } = initializeAzureClients();
    if (containerClient) {
      await containerClient.createIfNotExists();
      console.log('Container created or already exists');
    }
  } catch (error) {
    console.error('Error creating container:', error);
  }
}

export async function ensureTableExists() {
  if (typeof window !== 'undefined') return;
  
  try {
    const { tableClient } = initializeAzureClients();
    if (tableClient) {
      await tableClient.createTable();
      console.log('Table created or already exists');
    }
  } catch (error: any) {
    console.error('Error creating table:', error);
    if (error.code === 'TableAlreadyExists') {
      console.log('Table already exists, continuing...');
    } else {
      throw error;
    }
  }
}

export class BlobStorageService {
  static async uploadImage(file: File, vehicleId: string): Promise<string> {
    if (typeof window !== 'undefined') {
      throw new Error('BlobStorageService should only be used on server side');
    }
    
    try {
      await ensureContainerExists();
      
      const blobName = `vehicles/${vehicleId}/${file.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const buffer = await file.arrayBuffer();
      await blockBlobClient.upload(buffer, buffer.byteLength);
      
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const url = new URL(imageUrl);
      const blobName = url.pathname.substring(1);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  static getImageUrl(blobName: string): string {
    return `${containerClient.url}/${blobName}`;
  }
}

export class TableStorageService {
  static async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    if (typeof window !== 'undefined') {
      throw new Error('TableStorageService should only be used on server side');
    }
    
    try {
      await ensureTableExists();
      
      const entity = {
        partitionKey: 'vehicles',
        rowKey: vehicle.id,
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        plate: vehicle.plate,
        pricePerDay: vehicle.pricePerDay,
        isAvailable: vehicle.isAvailable,
        imageUrl: vehicle.imageUrl || '',
        description: vehicle.description || '',
        color: vehicle.color,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        seats: vehicle.seats,
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
      };
      await tableClient.createEntity(entity);
      return vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw new Error('Failed to create vehicle');
    }
  }

  static async getVehicle(id: string): Promise<Vehicle | null> {
    try {
      const entity = await tableClient.getEntity('vehicles', id);
      return {
        ...entity,
        createdAt: new Date(entity.createdAt as string),
        updatedAt: new Date(entity.updatedAt as string),
      } as unknown as Vehicle;
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return null;
    }
  }

  static async updateVehicle(vehicle: Vehicle): Promise<Vehicle> {
    try {
      const entity = {
        partitionKey: 'vehicles',
        rowKey: vehicle.id,
        ...vehicle,
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString(),
      };
      
      await tableClient.updateEntity(entity, 'Replace');
      return vehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw new Error('Failed to update vehicle');
    }
  }

  static async deleteVehicle(id: string): Promise<void> {
    try {
      await tableClient.deleteEntity('vehicles', id);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw new Error('Failed to delete vehicle');
    }
  }

  static async listVehicles(): Promise<Vehicle[]> {
    try {
      await ensureTableExists();
      
      const entities = tableClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'vehicles'" }
      });
      
      const vehicles: Vehicle[] = [];
      for await (const entity of entities) {
        vehicles.push({
          id: entity.id as string,
          brand: entity.brand as string,
          model: entity.model as string,
          year: entity.year as number,
          plate: entity.plate as string,
          pricePerDay: entity.pricePerDay as number,
          isAvailable: entity.isAvailable as boolean,
          imageUrl: entity.imageUrl as string,
          description: entity.description as string,
          color: entity.color as string,
          fuelType: entity.fuelType as any,
          transmission: entity.transmission as any,
          seats: entity.seats as number,
          createdAt: new Date(entity.createdAt as string),
          updatedAt: new Date(entity.updatedAt as string),
        });
      }
      
      return vehicles;
    } catch (error) {
      console.error('Error listing vehicles:', error);
      return [];
    }
  }

  static async createCustomer(customer: Customer): Promise<Customer> {
    try {
      await ensureTableExists();
      
      const entity = {
        partitionKey: 'customers',
        rowKey: customer.id,
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf,
        address: JSON.stringify(customer.address),
        driverLicense: customer.driverLicense,
        driverLicenseExpiry: customer.driverLicenseExpiry.toISOString(),
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      };
      
      await tableClient.createEntity(entity);
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  static async getCustomer(id: string): Promise<Customer | null> {
    try {
      const entity = await tableClient.getEntity('customers', id);
      return {
        id: entity.id as string,
        name: entity.name as string,
        email: entity.email as string,
        phone: entity.phone as string,
        cpf: entity.cpf as string,
        address: JSON.parse(entity.address as string),
        driverLicense: entity.driverLicense as string,
        driverLicenseExpiry: new Date(entity.driverLicenseExpiry as string),
        createdAt: new Date(entity.createdAt as string),
        updatedAt: new Date(entity.updatedAt as string),
      };
    } catch (error) {
      console.error('Error getting customer:', error);
      return null;
    }
  }

  static async updateCustomer(customer: Customer): Promise<Customer> {
    try {
      const entity = {
        partitionKey: 'customers',
        rowKey: customer.id,
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf,
        address: JSON.stringify(customer.address),
        driverLicense: customer.driverLicense,
        driverLicenseExpiry: customer.driverLicenseExpiry.toISOString(),
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      };
      
      await tableClient.updateEntity(entity, 'Replace');
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  static async deleteCustomer(id: string): Promise<void> {
    try {
      await tableClient.deleteEntity('customers', id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error('Failed to delete customer');
    }
  }

  static async listCustomers(): Promise<Customer[]> {
    try {
      await ensureTableExists();
      
      const entities = tableClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'customers'" }
      });
      
      const customers: Customer[] = [];
      for await (const entity of entities) {
        customers.push({
          id: entity.id as string,
          name: entity.name as string,
          email: entity.email as string,
          phone: entity.phone as string,
          cpf: entity.cpf as string,
          address: JSON.parse(entity.address as string),
          driverLicense: entity.driverLicense as string,
          driverLicenseExpiry: new Date(entity.driverLicenseExpiry as string),
          createdAt: new Date(entity.createdAt as string),
          updatedAt: new Date(entity.updatedAt as string),
        });
      }
      
      return customers;
    } catch (error) {
      console.error('Error listing customers:', error);
      return [];
    }
  }

  static async createRental(rental: Rental): Promise<Rental> {
    try {
      await ensureTableExists();
      
      const entity = {
        partitionKey: 'rentals',
        rowKey: rental.id,
        id: rental.id,
        vehicleId: rental.vehicleId,
        customerId: rental.customerId,
        startDate: rental.startDate.toISOString(),
        endDate: rental.endDate.toISOString(),
        totalDays: rental.totalDays,
        dailyRate: rental.dailyRate,
        totalAmount: rental.totalAmount,
        status: rental.status,
        paymentStatus: rental.paymentStatus,
        notes: rental.notes || '',
        createdAt: rental.createdAt.toISOString(),
        updatedAt: rental.updatedAt.toISOString(),
      };
      
      await tableClient.createEntity(entity);
      return rental;
    } catch (error) {
      console.error('Error creating rental:', error);
      throw new Error('Failed to create rental');
    }
  }

  static async getRental(id: string): Promise<Rental | null> {
    try {
      const entity = await tableClient.getEntity('rentals', id);
      return {
        ...entity,
        createdAt: new Date(entity.createdAt as string),
        updatedAt: new Date(entity.updatedAt as string),
        startDate: new Date(entity.startDate as string),
        endDate: new Date(entity.endDate as string),
      } as unknown as Rental;
    } catch (error) {
      console.error('Error getting rental:', error);
      return null;
    }
  }

  static async updateRental(rental: Rental): Promise<Rental> {
    try {
      const entity = {
        partitionKey: 'rentals',
        rowKey: rental.id,
        ...rental,
        createdAt: (rental.createdAt instanceof Date ? rental.createdAt : new Date(rental.createdAt)).toISOString(),
        updatedAt: (rental.updatedAt instanceof Date ? rental.updatedAt : new Date(rental.updatedAt)).toISOString(),
        startDate: (rental.startDate instanceof Date ? rental.startDate : new Date(rental.startDate)).toISOString(),
        endDate: (rental.endDate instanceof Date ? rental.endDate : new Date(rental.endDate)).toISOString(),
      };
      
      await tableClient.updateEntity(entity, 'Replace');
      return rental;
    } catch (error) {
      console.error('Error updating rental:', error);
      throw new Error('Failed to update rental');
    }
  }

  static async deleteRental(id: string): Promise<void> {
    try {
      await tableClient.deleteEntity('rentals', id);
    } catch (error) {
      console.error('Error deleting rental:', error);
      throw new Error('Failed to delete rental');
    }
  }

  static async listRentals(): Promise<Rental[]> {
    try {
      await ensureTableExists();
      
      const entities = tableClient.listEntities({
        queryOptions: { filter: "PartitionKey eq 'rentals'" }
      });
      
      const rentals: Rental[] = [];
      for await (const entity of entities) {
        rentals.push({
          id: entity.id as string,
          vehicleId: entity.vehicleId as string,
          customerId: entity.customerId as string,
          startDate: new Date(entity.startDate as string),
          endDate: new Date(entity.endDate as string),
          totalDays: entity.totalDays as number,
          dailyRate: entity.dailyRate as number,
          totalAmount: entity.totalAmount as number,
          status: entity.status as any,
          paymentStatus: entity.paymentStatus as any,
          notes: entity.notes as string,
          createdAt: new Date(entity.createdAt as string),
          updatedAt: new Date(entity.updatedAt as string),
        });
      }
      
      return rentals;
    } catch (error) {
      console.error('Error listing rentals:', error);
      return [];
    }
  }

  static async getRentalsByCustomer(customerId: string): Promise<Rental[]> {
    try {
      const entities = tableClient.listEntities({
        queryOptions: { filter: `PartitionKey eq 'rentals' and customerId eq '${customerId}'` }
      });
      
      const rentals: Rental[] = [];
      for await (const entity of entities) {
        rentals.push({
          ...entity,
          createdAt: new Date(entity.createdAt as string),
          updatedAt: new Date(entity.updatedAt as string),
          startDate: new Date(entity.startDate as string),
          endDate: new Date(entity.endDate as string),
        } as unknown as Rental);
      }
      
      return rentals;
    } catch (error) {
      console.error('Error getting rentals by customer:', error);
      return [];
    }
  }
}
