'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Rental } from '@/types';
import { rentalApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertTriangle, Calendar, Car, User } from 'lucide-react';

interface RentalDeleteModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RentalDeleteModal({ rental, isOpen, onClose, onSuccess }: RentalDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!rental) return;

    setLoading(true);
    setError('');

    try {
      await rentalApi.delete(rental.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao excluir locação');
      console.error('Error deleting rental:', err);
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
            Tem certeza que deseja excluir esta locação?
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta ação não pode ser desfeita. A locação será permanentemente removida.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Rental Info */}
        {rental && (
          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">ID da Locação:</span>
              <span className="text-sm text-gray-600">{rental.id}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Período:</span>
              <span className="text-sm text-gray-600">
                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Valor Total:</span>
              <span className="text-sm font-bold text-blue-600">{formatCurrency(rental.totalAmount)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Status:</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                rental.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                rental.status === 'active' ? 'bg-green-100 text-green-800' :
                rental.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {rental.status === 'pending' && 'Pendente'}
                {rental.status === 'confirmed' && 'Confirmada'}
                {rental.status === 'active' && 'Ativa'}
                {rental.status === 'completed' && 'Concluída'}
                {rental.status === 'cancelled' && 'Cancelada'}
              </span>
            </div>

            {/* Vehicle Info */}
            {rental.vehicle && (
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                <Car className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {rental.vehicle.brand} {rental.vehicle.model}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rental.vehicle.year} • {rental.vehicle.plate}
                  </p>
                </div>
              </div>
            )}

            {/* Customer Info */}
            {rental.customer && (
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
                <User className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {rental.customer.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {rental.customer.email}
                  </p>
                </div>
              </div>
            )}
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
