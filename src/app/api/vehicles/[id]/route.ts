import { NextRequest, NextResponse } from 'next/server';
import { TableStorageService, BlobStorageService } from '@/lib/azure';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await TableStorageService.getVehicle(id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    const vehicleData = {
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
      isAvailable: formData.get('isAvailable') === 'true',
      image: formData.get('image') as File || undefined,
    };

    const existingVehicle = await TableStorageService.getVehicle(id);
    if (!existingVehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    let imageUrl = existingVehicle.imageUrl;

    if (vehicleData.image && vehicleData.image.size > 0) {
      if (imageUrl) {
        await BlobStorageService.deleteImage(imageUrl);
      }
      imageUrl = await BlobStorageService.uploadImage(vehicleData.image, id);
    }

    const updatedVehicle = {
      ...existingVehicle,
      ...vehicleData,
      imageUrl,
      updatedAt: new Date(),
    };

    await TableStorageService.updateVehicle(updatedVehicle);
    
    return NextResponse.json({ success: true, data: updatedVehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await TableStorageService.getVehicle(id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    if (vehicle.imageUrl) {
      await BlobStorageService.deleteImage(vehicle.imageUrl);
    }

    await TableStorageService.deleteVehicle(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
