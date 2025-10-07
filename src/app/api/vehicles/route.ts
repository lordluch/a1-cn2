import { NextRequest, NextResponse } from 'next/server';
import { TableStorageService, BlobStorageService } from '@/lib/azure';
import { Vehicle, CreateVehicleData } from '@/types';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const vehicles = await TableStorageService.listVehicles();
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const vehicleData: CreateVehicleData = {
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      plate: formData.get('plate') as string,
      pricePerDay: parseFloat(formData.get('pricePerDay') as string),
      description: formData.get('description') as string || undefined,
      color: formData.get('color') as string,
      fuelType: formData.get('fuelType') as any,
      transmission: formData.get('transmission') as any,
      seats: parseInt(formData.get('seats') as string),
      image: formData.get('image') as File || undefined,
    };
    
    const vehicleId = generateId();
    let imageUrl: string | undefined;
    
    if (vehicleData.image && vehicleData.image.size > 0) {
      imageUrl = await BlobStorageService.uploadImage(vehicleData.image, vehicleId);
    }

    const vehicle: Vehicle = {
      id: vehicleId,
      ...vehicleData,
      isAvailable: true,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await TableStorageService.createVehicle(vehicle);
    
    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
