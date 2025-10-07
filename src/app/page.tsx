'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Car, Users, Calendar, DollarSign } from 'lucide-react';
import { vehicleApi, customerApi, rentalApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { initializeAzureResources } from '@/lib/init-azure';

export default function Home() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalCustomers: 0,
    totalRentals: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        await initializeAzureResources();
        
        const [vehicles, customers, rentals] = await Promise.all([
          vehicleApi.list(),
          customerApi.list(),
          rentalApi.list(),
        ]);

        const totalRevenue = rentals.reduce((sum, rental) => sum + rental.totalAmount, 0);

        setStats({
          totalVehicles: vehicles.length,
          totalCustomers: customers.length,
          totalRentals: rentals.length,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Veículos',
      value: stats.totalVehicles,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total de Clientes',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total de Locações',
      value: stats.totalRentals,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de locação de automóveis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Ações Rápidas</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="/vehicles/new"
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  + Cadastrar Novo Veículo
                </a>
                <a
                  href="/customers/new"
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  + Cadastrar Novo Cliente
                </a>
                <a
                  href="/rentals/new"
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  + Nova Locação
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Sistema</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status do Sistema:</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Azure Storage:</span>
                  <span className="text-green-600 font-medium">Conectado</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Última Atualização:</span>
                  <span className="text-gray-900">{new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
