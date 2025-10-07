import { NextRequest, NextResponse } from 'next/server';
import { TableStorageService } from '@/lib/azure';
import { Customer, CreateCustomerData } from '@/types';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const customers = await TableStorageService.listCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const customerData: CreateCustomerData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      cpf: body.cpf,
      address: body.address,
      driverLicense: body.driverLicense,
      driverLicenseExpiry: new Date(body.driverLicenseExpiry),
    };

    const customerId = generateId();
    const customer: Customer = {
      id: customerId,
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await TableStorageService.createCustomer(customer);
    
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
