'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Vehicle } from '@/types';
import { vehicleApi } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';

interface VehicleDeleteModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function VehicleDeleteModal({ vehicle, isOpen, onClose, onSuccess }: VehicleDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!vehicle) return;

    setLoading(true);
    setError('');

    try {
      await vehicleApi.delete(vehicle.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao excluir veículo');
      console.error('Error deleting vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Exclusão" size="sm">
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Tem certeza que deseja excluir este veículo?
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta ação não pode ser desfeita. O veículo <strong>{vehicle?.brand} {vehicle?.model}</strong> será permanentemente removido.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Vehicle Info */}
        {vehicle && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center space-x-3">
              {vehicle.imageUrl && (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-12 w-12 rounded object-cover"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-gray-500">
                  {vehicle.year} • {vehicle.plate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Excluindo...' : 'Sim, Excluir'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
