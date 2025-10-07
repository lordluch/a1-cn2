'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { customerApi, rentalApi } from '@/lib/api';
import { Customer, CustomerFilters, Rental } from '@/types';
import { formatDate, formatCPF, formatPhone } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Trash2, Eye, User } from 'lucide-react';
import { CustomerViewModal } from '@/components/customers/CustomerViewModal';
import { CustomerEditModal } from '@/components/customers/CustomerEditModal';
import { CustomerDeleteModal } from '@/components/customers/CustomerDeleteModal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const [customersData, rentalsData] = await Promise.all([
        customerApi.list(),
        rentalApi.list()
      ]);
      setCustomers(customersData);
      setRentals(rentalsData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerRentalCount = (customerId: string) => {
    return rentals.filter(rental => rental.customerId === customerId).length;
  };

  const handleView = (customer: Customer) => {
    setViewModal({ isOpen: true, customer });
  };

  const handleEdit = (customer: Customer) => {
    setEditModal({ isOpen: true, customer });
  };

  const handleDelete = (customer: Customer) => {
    setDeleteModal({ isOpen: true, customer });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cpf.includes(searchTerm) ||
      customer.phone.includes(searchTerm);

    const matchesFilters = 
      (!filters.name || customer.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.email || customer.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.cpf || customer.cpf.includes(filters.cpf));

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
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerencie o cadastro de clientes</p>
          </div>
          <Link href="/customers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
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
                    placeholder="Buscar por nome, email, CPF ou telefone..."
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
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={filters.name || ''}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={filters.email || ''}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={filters.cpf || ''}
                    onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {customer.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>CPF:</span>
                      <span className="font-medium">{formatCPF(customer.cpf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telefone:</span>
                      <span className="font-medium">{formatPhone(customer.phone)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cidade:</span>
                      <span className="font-medium">{customer.address.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CNH:</span>
                      <span className="font-medium">{customer.driverLicense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vencimento CNH:</span>
                      <span className="font-medium">{formatDate(customer.driverLicenseExpiry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Locações:</span>
                      <span className="font-medium text-blue-600">
                        {getCustomerRentalCount(customer.id)} locações
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleView(customer)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(customer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <p className="text-lg font-medium">Nenhum cliente encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou adicione um novo cliente</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <CustomerViewModal
          customer={viewModal.customer}
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, customer: null })}
        />

        <CustomerEditModal
          customer={editModal.customer}
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, customer: null })}
          onSuccess={() => {
            setEditModal({ isOpen: false, customer: null });
            loadCustomers();
          }}
        />

        <CustomerDeleteModal
          customer={deleteModal.customer}
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, customer: null })}
          onSuccess={() => {
            setDeleteModal({ isOpen: false, customer: null });
            loadCustomers();
          }}
        />
      </div>
    </Layout>
  );
}
