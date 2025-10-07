import { NextRequest, NextResponse } from 'next/server';
import { TableStorageService } from '@/lib/azure';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rental = await TableStorageService.getRental(id);
    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Rental not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: rental });
  } catch (error) {
    console.error('Error fetching rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rental' },
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
    const body = await request.json();
    
    const existingRental = await TableStorageService.getRental(id);
    if (!existingRental) {
      return NextResponse.json(
        { success: false, error: 'Rental not found' },
        { status: 404 }
      );
    }

    const updatedRental = {
      ...existingRental,
      ...body,
      updatedAt: new Date(),
    };

    await TableStorageService.updateRental(updatedRental);
    
    const vehicle = await TableStorageService.getVehicle(updatedRental.vehicleId);
    if (vehicle) {
      const isAvailable = !['pending', 'confirmed', 'active'].includes(updatedRental.status);
      const updatedVehicle = {
        ...vehicle,
        isAvailable,
        updatedAt: new Date(),
      };
      await TableStorageService.updateVehicle(updatedVehicle);
    }
    
    return NextResponse.json({ success: true, data: updatedRental });
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rental' },
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
    const rental = await TableStorageService.getRental(id);
    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Rental not found' },
        { status: 404 }
      );
    }

    await TableStorageService.deleteRental(id);
    
    const vehicle = await TableStorageService.getVehicle(rental.vehicleId);
    if (vehicle) {
      const updatedVehicle = {
        ...vehicle,
        isAvailable: true,
        updatedAt: new Date(),
      };
      await TableStorageService.updateVehicle(updatedVehicle);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete rental' },
      { status: 500 }
    );
  }
}
