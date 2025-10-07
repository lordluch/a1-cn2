'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { rentalApi, vehicleApi, customerApi } from '@/lib/api';
import { Rental, RentalFilters, Vehicle, Customer } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { RentalViewModal } from '@/components/rentals/RentalViewModal';
import { RentalEditModal } from '@/components/rentals/RentalEditModal';
import { RentalDeleteModal } from '@/components/rentals/RentalDeleteModal';

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<RentalFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; rental: Rental | null }>({
    isOpen: false,
    rental: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; rental: Rental | null }>({
    isOpen: false,
    rental: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; rental: Rental | null }>({
    isOpen: false,
    rental: null,
  });

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const [rentalsData, vehiclesData, customersData] = await Promise.all([
        rentalApi.list(),
        vehicleApi.list(),
        customerApi.list()
      ]);
      
      const populatedRentals = rentalsData.map(rental => ({
        ...rental,
        vehicle: vehiclesData.find(v => v.id === rental.vehicleId),
        customer: customersData.find(c => c.id === rental.customerId),
      }));
      
      setRentals(populatedRentals);
      setVehicles(vehiclesData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (rental: Rental) => {
    setViewModal({ isOpen: true, rental });
  };

  const handleEdit = (rental: Rental) => {
    setEditModal({ isOpen: true, rental });
  };

  const handleDelete = (rental: Rental) => {
    setDeleteModal({ isOpen: true, rental });
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'paid':
        return 'Pago';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = !searchTerm || 
      rental.vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customer?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.status || rental.status === filters.status) &&
      (!filters.paymentStatus || rental.paymentStatus === filters.paymentStatus) &&
      (!filters.customerId || rental.customerId === filters.customerId) &&
      (!filters.vehicleId || rental.vehicleId === filters.vehicleId);

    return matchesSearch && matchesFilters;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Locações</h1>
            <p className="text-gray-600">Gerencie as locações de veículos</p>
          </div>
          <Link href="/rentals/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Locação
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por veículo, cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="active">Ativa</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pagamento
                  </label>
                  <select
                    value={filters.paymentStatus || ''}
                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      startDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      endDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rentals List */}
        <div className="space-y-4">
          {filteredRentals.map((rental) => (
            <Card key={rental.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rental.vehicle?.brand} {rental.vehicle?.model} - {rental.vehicle?.plate}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cliente: {rental.customer?.name} ({rental.customer?.email})
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>Início: {formatDate(rental.startDate)}</span>
                          <span>Fim: {formatDate(rental.endDate)}</span>
                          <span>{rental.totalDays} dias</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(rental.totalAmount)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                          {getStatusText(rental.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(rental.paymentStatus)}`}>
                          {getPaymentStatusText(rental.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleView(rental)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleEdit(rental)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(rental)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRentals.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium">Nenhuma locação encontrada</p>
                <p className="text-sm">Tente ajustar os filtros ou adicione uma nova locação</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <RentalViewModal
          rental={viewModal.rental}
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, rental: null })}
        />

        <RentalEditModal
          rental={editModal.rental}
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, rental: null })}
          onSuccess={() => {
            setEditModal({ isOpen: false, rental: null });
            loadRentals();
          }}
        />

        <RentalDeleteModal
          rental={deleteModal.rental}
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, rental: null })}
          onSuccess={() => {
            setDeleteModal({ isOpen: false, rental: null });
            loadRentals();
          }}
        />
      </div>
    </Layout>
  );
}
