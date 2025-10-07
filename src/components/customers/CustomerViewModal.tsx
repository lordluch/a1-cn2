'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Customer, Rental, Vehicle } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Car, Clock, CheckCircle, XCircle } from 'lucide-react';
import { rentalApi, vehicleApi } from '@/lib/api';

interface CustomerViewModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerViewModal({ customer, isOpen, onClose }: CustomerViewModalProps) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      loadRentalHistory();
    }
  }, [customer, isOpen]);

  const loadRentalHistory = async () => {
    if (!customer) return;
    
    try {
      setLoading(true);
      const [rentalsData, vehiclesData] = await Promise.all([
        rentalApi.list(),
        vehicleApi.list()
      ]);
      
      const customerRentals = rentalsData
        .filter(rental => rental.customerId === customer.id)
        .map(rental => ({
          ...rental,
          vehicle: vehiclesData.find(v => v.id === rental.vehicleId)
        }));
      
      setRentals(customerRentals);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading rental history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmada';
      case 'active':
        return 'Ativa';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Cliente" size="lg">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {customer.name}
              </h4>
              <p className="text-sm text-gray-600">Cliente desde {formatDate(customer.createdAt)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Telefone</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">CPF</p>
                  <p className="text-sm text-gray-600">{customer.cpf}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Endereço</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">
                      {customer.address.street}, {customer.address.number}
                    </p>
                    {customer.address.complement && (
                      <p className="text-sm text-gray-600">{customer.address.complement}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {customer.address.neighborhood}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customer.address.city} - {customer.address.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rental History */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Histórico de Locações ({rentals.length})
          </h4>
          <div className="rounded-lg bg-gray-50 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Carregando histórico...</span>
              </div>
            ) : rentals.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">
                Nenhuma locação encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {rentals.map((rental) => (
                  <div key={rental.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {rental.vehicle?.brand} {rental.vehicle?.model}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({rental.vehicle?.year})
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {formatCurrency(rental.totalAmount)}
                            </span>
                            <span className="text-gray-500">
                              ({rental.totalDays} dias)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                          {getStatusIcon(rental.status)}
                          <span className="ml-1">{getStatusText(rental.status)}</span>
                        </span>
                        
                        <span className={`text-xs px-2 py-1 rounded ${
                          rental.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : rental.paymentStatus === 'refunded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rental.paymentStatus === 'paid' ? 'Pago' : 
                           rental.paymentStatus === 'refunded' ? 'Reembolsado' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    
                    {rental.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Observações:</span> {rental.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Cadastrado em</p>
              <p className="text-sm text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Última atualização</p>
              <p className="text-sm text-gray-900">{formatDate(customer.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
