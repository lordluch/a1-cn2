'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Vehicle } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Car, Calendar, DollarSign, Users, Fuel, Settings, Palette } from 'lucide-react';

interface VehicleViewModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleViewModal({ vehicle, isOpen, onClose }: VehicleViewModalProps) {
  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Veículo" size="lg">
      <div className="space-y-6">
        {/* Image */}
        <div className="aspect-video overflow-hidden rounded-lg bg-gray-200">
          {vehicle.imageUrl ? (
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`h-full w-full flex items-center justify-center text-gray-500 ${vehicle.imageUrl ? 'hidden' : ''}`}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🚗</span>
              </div>
              <p className="text-sm">Sem imagem disponível</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {vehicle.brand} {vehicle.model}
              </h4>
              <p className="text-sm text-gray-600">Ano {vehicle.year}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Placa</p>
                  <p className="text-sm text-gray-600">{vehicle.plate}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Preço por dia</p>
                  <p className="text-sm text-gray-600">{formatCurrency(vehicle.pricePerDay)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Palette className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cor</p>
                  <p className="text-sm text-gray-600">{vehicle.color}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Fuel className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Combustível</p>
                  <p className="text-sm text-gray-600 capitalize">{vehicle.fuelType}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Transmissão</p>
                  <p className="text-sm text-gray-600 capitalize">{vehicle.transmission}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Assentos</p>
                  <p className="text-sm text-gray-600">{vehicle.seats}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    vehicle.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {vehicle.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Descrição</h4>
            <p className="text-sm text-gray-600">{vehicle.description}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Criado em</p>
              <p className="text-sm text-gray-900">{formatDate(vehicle.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Atualizado em</p>
              <p className="text-sm text-gray-900">{formatDate(vehicle.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
