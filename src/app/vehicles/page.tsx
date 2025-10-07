'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { vehicleApi } from '@/lib/api';
import { Vehicle, VehicleFilters } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { VehicleViewModal } from '@/components/vehicles/VehicleViewModal';
import { VehicleEditModal } from '@/components/vehicles/VehicleEditModal';
import { VehicleDeleteModal } from '@/components/vehicles/VehicleDeleteModal';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.list();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (vehicle: Vehicle) => {
    setViewModal({ isOpen: true, vehicle });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditModal({ isOpen: true, vehicle });
  };

  const handleDelete = (vehicle: Vehicle) => {
    setDeleteModal({ isOpen: true, vehicle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.vehicle) return;

    try {
      await vehicleApi.delete(deleteModal.vehicle.id);
      await loadVehicles();
      setDeleteModal({ isOpen: false, vehicle: null });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Erro ao excluir veículo');
    }
  };


  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = !searchTerm || 
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.brand || vehicle.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (!filters.model || vehicle.model.toLowerCase().includes(filters.model.toLowerCase())) &&
      (!filters.minPrice || vehicle.pricePerDay >= filters.minPrice) &&
      (!filters.maxPrice || vehicle.pricePerDay <= filters.maxPrice) &&
      (filters.isAvailable === undefined || vehicle.isAvailable === filters.isAvailable) &&
      (!filters.fuelType || vehicle.fuelType === filters.fuelType) &&
      (!filters.transmission || vehicle.transmission === filters.transmission);

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
            <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
            <p className="text-gray-600">Gerencie a frota de veículos</p>
          </div>
          <Link href="/vehicles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
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
                    placeholder="Buscar por marca, modelo ou placa..."
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
                    Marca
                  </label>
                  <input
                    type="text"
                    value={filters.brand || ''}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Máximo
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disponibilidade
                  </label>
                  <select
                    value={filters.isAvailable === undefined ? '' : filters.isAvailable.toString()}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      isAvailable: e.target.value === '' ? undefined : e.target.value === 'true' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="true">Disponível</option>
                    <option value="false">Indisponível</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200">
                {vehicle.imageUrl ? (
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center text-gray-500 ${vehicle.imageUrl ? 'hidden' : ''}`}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🚗</span>
                    </div>
                    <p className="text-sm">Sem imagem</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vehicle.year} • {vehicle.plate}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(vehicle.pricePerDay)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.isAvailable
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.isAvailable ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Combustível: {vehicle.fuelType}</p>
                    <p>Câmbio: {vehicle.transmission}</p>
                    <p>Assentos: {vehicle.seats}</p>
                    <p>Cor: {vehicle.color}</p>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleView(vehicle)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(vehicle)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium">Nenhum veículo encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou adicione um novo veículo</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <VehicleViewModal
          vehicle={viewModal.vehicle}
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, vehicle: null })}
        />

        <VehicleEditModal
          vehicle={editModal.vehicle}
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, vehicle: null })}
          onSuccess={() => {
            setEditModal({ isOpen: false, vehicle: null });
            loadVehicles();
          }}
        />

        <VehicleDeleteModal
          vehicle={deleteModal.vehicle}
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, vehicle: null })}
          onSuccess={() => {
            setDeleteModal({ isOpen: false, vehicle: null });
            loadVehicles();
          }}
        />
      </div>
    </Layout>
  );
}
