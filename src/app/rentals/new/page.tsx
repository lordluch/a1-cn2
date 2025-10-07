'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { rentalApi, vehicleApi, customerApi } from '@/lib/api';
import { CreateRentalData, Rental, Vehicle, Customer } from '@/types';
import { generateId, calculateRentalDays, calculateRentalTotal } from '@/lib/utils';
import { ArrowLeft, Calendar } from 'lucide-react';

const rentalSchema = z.object({
  vehicleId: z.string().min(1, 'Veículo é obrigatório'),
  customerId: z.string().min(1, 'Cliente é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de fim é obrigatória'),
  notes: z.string().optional(),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endDate'],
});

type RentalFormData = z.infer<typeof rentalSchema>;

export default function NewRentalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [totalDays, setTotalDays] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
  });

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');
  const watchedVehicleId = watch('vehicleId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const start = new Date(watchedStartDate);
      const end = new Date(watchedEndDate);
      const days = calculateRentalDays(start, end);
      setTotalDays(days);
    }
  }, [watchedStartDate, watchedEndDate]);

  useEffect(() => {
    if (watchedVehicleId) {
      const vehicle = vehicles.find(v => v.id === watchedVehicleId);
      setSelectedVehicle(vehicle || null);
    }
  }, [watchedVehicleId, vehicles]);

  useEffect(() => {
    if (selectedVehicle && totalDays > 0) {
      const amount = calculateRentalTotal(selectedVehicle.pricePerDay, totalDays);
      setTotalAmount(amount);
    }
  }, [selectedVehicle, totalDays]);

  const loadData = async () => {
    try {
      const [vehiclesData, customersData] = await Promise.all([
        vehicleApi.list(),
        customerApi.list(),
      ]);
      setVehicles(vehiclesData.filter(v => v.isAvailable));
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onSubmit = async (data: RentalFormData) => {
    try {
      setIsSubmitting(true);

      const rentalData: CreateRentalData = {
        vehicleId: data.vehicleId,
        customerId: data.customerId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
      };

      await rentalApi.create(rentalData);
      router.push('/rentals');
    } catch (error) {
      console.error('Error creating rental:', error);
      alert('Erro ao criar locação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Locação</h1>
            <p className="text-gray-600">Crie uma nova locação de veículo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rental Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Informações da Locação</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veículo *
                      </label>
                      <select
                        {...register('vehicleId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione um veículo</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} - {vehicle.plate} - R$ {vehicle.pricePerDay}/dia
                          </option>
                        ))}
                      </select>
                      {errors.vehicleId && (
                        <p className="text-red-500 text-sm mt-1">{errors.vehicleId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente *
                      </label>
                      <select
                        {...register('customerId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione um cliente</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} - {customer.email}
                          </option>
                        ))}
                      </select>
                      {errors.customerId && (
                        <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Início *
                      </label>
                      <input
                        type="date"
                        {...register('startDate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.startDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Fim *
                      </label>
                      <input
                        type="date"
                        {...register('endDate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={watchedStartDate || new Date().toISOString().split('T')[0]}
                      />
                      {errors.endDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Observações adicionais sobre a locação..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rental Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Resumo da Locação</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedVehicle && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Veículo Selecionado</h4>
                        <div className="text-sm text-gray-600">
                          <p>{selectedVehicle.brand} {selectedVehicle.model}</p>
                          <p>Placa: {selectedVehicle.plate}</p>
                          <p>Ano: {selectedVehicle.year}</p>
                          <p>Cor: {selectedVehicle.color}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Período</h4>
                      <div className="text-sm text-gray-600">
                        <p>Início: {watchedStartDate ? new Date(watchedStartDate).toLocaleDateString('pt-BR') : '-'}</p>
                        <p>Fim: {watchedEndDate ? new Date(watchedEndDate).toLocaleDateString('pt-BR') : '-'}</p>
                        <p>Total de dias: {totalDays}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Valores</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Preço por dia:</span>
                          <span>{selectedVehicle ? `R$ ${selectedVehicle.pricePerDay.toFixed(2)}` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total de dias:</span>
                          <span>{totalDays}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-blue-600">R$ {totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status da Locação:</span>
                      <span className="text-yellow-600 font-medium">Pendente</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status do Pagamento:</span>
                      <span className="text-yellow-600 font-medium">Pendente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!selectedVehicle || totalDays <= 0}
            >
              {isSubmitting ? 'Criando...' : 'Criar Locação'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
