'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Customer } from '@/types';
import { customerApi } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';

interface CustomerDeleteModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerDeleteModal({ customer, isOpen, onClose, onSuccess }: CustomerDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!customer) return;

    setLoading(true);
    setError('');

    try {
      await customerApi.delete(customer.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao excluir cliente');
      console.error('Error deleting customer:', err);
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
            Tem certeza que deseja excluir este cliente?
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta ação não pode ser desfeita. O cliente <strong>{customer?.name}</strong> será permanentemente removido.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Customer Info */}
        {customer && (
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium text-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {customer.name}
                </p>
                <p className="text-sm text-gray-500">
                  {customer.email}
                </p>
                <p className="text-sm text-gray-500">
                  {customer.phone}
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
