import { NextRequest, NextResponse } from 'next/server';
import { TableStorageService } from '@/lib/azure';
import { Rental, CreateRentalData } from '@/types';
import { generateId, calculateRentalDays, calculateRentalTotal } from '@/lib/utils';

export async function GET() {
  try {
    const rentals = await TableStorageService.listRentals();
    return NextResponse.json({ success: true, data: rentals });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const rentalData: CreateRentalData = {
      vehicleId: body.vehicleId,
      customerId: body.customerId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      notes: body.notes,
    };

    const vehicle = await TableStorageService.getVehicle(rentalData.vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const totalDays = calculateRentalDays(rentalData.startDate, rentalData.endDate);
    const totalAmount = calculateRentalTotal(vehicle.pricePerDay, totalDays);

    const rentalId = generateId();
    const rental: Rental = {
      id: rentalId,
      ...rentalData,
      totalDays,
      dailyRate: vehicle.pricePerDay,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await TableStorageService.createRental(rental);
    
    const updatedVehicle = {
      ...vehicle,
      isAvailable: false,
      updatedAt: new Date(),
    };
    await TableStorageService.updateVehicle(updatedVehicle);
    
    return NextResponse.json({ success: true, data: rental });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create rental' },
      { status: 500 }
    );
  }
}
