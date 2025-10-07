'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Rental, Vehicle, Customer } from '@/types';
import { rentalApi, vehicleApi, customerApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface RentalEditModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RentalEditModal({ rental, isOpen, onClose, onSuccess }: RentalEditModalProps) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    status: 'pending' as Rental['status'],
    paymentStatus: 'pending' as Rental['paymentStatus'],
    notes: '',
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rental) {
      setFormData({
        vehicleId: rental.vehicleId,
        customerId: rental.customerId,
        startDate: formatDate(rental.startDate).split('/').reverse().join('-'),
        endDate: formatDate(rental.endDate).split('/').reverse().join('-'),
        status: rental.status,
        paymentStatus: rental.paymentStatus,
        notes: rental.notes || '',
      });
    }
  }, [rental]);

  useEffect(() => {
    if (isOpen) {
      loadVehicles();
      loadCustomers();
    }
  }, [isOpen]);

  const loadVehicles = async () => {
    try {
      const data = await vehicleApi.list();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customerApi.list();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rental) return;

    setLoading(true);
    setError('');

    try {
      const updatedRental = {
        vehicleId: formData.vehicleId,
        customerId: formData.customerId,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
      };

      await rentalApi.update(rental.id, updatedRental);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao atualizar locação');
      console.error('Error updating rental:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Locação" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Vehicle Selection */}
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
              Veículo *
            </label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plate} ({formatDate(vehicle.year.toString())})
                </option>
              ))}
            </select>
            {selectedVehicle && (
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(selectedVehicle.pricePerDay.toString())}/dia
              </p>
            )}
          </div>

          {/* Customer Selection */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
              Cliente *
            </label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <p className="mt-1 text-sm text-gray-500">
                {selectedCustomer.phone}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Data de Início *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Data de Fim *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status da Locação *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmada</option>
              <option value="active">Ativa</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">
              Status do Pagamento *
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

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
            type="submit"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
