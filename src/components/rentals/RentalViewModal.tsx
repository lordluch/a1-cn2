'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Rental } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Calendar, Car, User, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface RentalViewModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RentalViewModal({ rental, isOpen, onClose }: RentalViewModalProps) {
  if (!rental) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'active':
        return <Car className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'refunded':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Locação" size="lg">
      <div className="space-y-6">
        {/* Status and Payment */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-3">
            {getStatusIcon(rental.status)}
            <div>
              <p className="text-sm font-medium text-gray-900">Status da Locação</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(rental.status)}`}>
                {rental.status === 'pending' && 'Pendente'}
                {rental.status === 'confirmed' && 'Confirmada'}
                {rental.status === 'active' && 'Ativa'}
                {rental.status === 'completed' && 'Concluída'}
                {rental.status === 'cancelled' && 'Cancelada'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getPaymentStatusIcon(rental.paymentStatus)}
            <div>
              <p className="text-sm font-medium text-gray-900">Status do Pagamento</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(rental.paymentStatus)}`}>
                {rental.paymentStatus === 'pending' && 'Pendente'}
                {rental.paymentStatus === 'paid' && 'Pago'}
                {rental.paymentStatus === 'refunded' && 'Reembolsado'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle and Customer Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Vehicle Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Veículo
            </h4>
            {rental.vehicle ? (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center space-x-3">
                  {rental.vehicle.imageUrl && (
                    <img
                      src={rental.vehicle.imageUrl}
                      alt={`${rental.vehicle.brand} ${rental.vehicle.model}`}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {rental.vehicle.brand} {rental.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rental.vehicle.year} • {rental.vehicle.plate}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(rental.vehicle.pricePerDay)}/dia
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Veículo não encontrado</p>
            )}
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Cliente
            </h4>
            {rental.customer ? (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">
                      {rental.customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {rental.customer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rental.customer.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rental.customer.phone}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Cliente não encontrado</p>
            )}
          </div>
        </div>

        {/* Rental Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Detalhes da Locação
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data de Início:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(rental.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data de Fim:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(rental.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de Dias:</span>
                <span className="text-sm font-medium text-gray-900">{rental.totalDays} dias</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Taxa Diária:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(rental.dailyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Valor Total:</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(rental.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {rental.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Observações</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{rental.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-500">Criado em</p>
              <p className="text-sm text-gray-900">{formatDateTime(rental.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Atualizado em</p>
              <p className="text-sm text-gray-900">{formatDateTime(rental.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
