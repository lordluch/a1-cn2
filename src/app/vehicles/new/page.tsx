'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { vehicleApi } from '@/lib/api';
import { CreateVehicleData, Vehicle } from '@/types';
import { generateId } from '@/lib/utils';
import { ArrowLeft, Upload, X } from 'lucide-react';

const vehicleSchema = z.object({
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
  plate: z.string().min(7, 'Placa deve ter pelo menos 7 caracteres').max(8, 'Placa deve ter no máximo 8 caracteres'),
  pricePerDay: z.number().min(0, 'Preço deve ser positivo'),
  description: z.string().optional(),
  color: z.string().min(1, 'Cor é obrigatória'),
  fuelType: z.enum(['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid']),
  transmission: z.enum(['manual', 'automatic']),
  seats: z.number().min(1, 'Número de assentos deve ser pelo menos 1').max(50, 'Número de assentos inválido'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function NewVehiclePage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setIsSubmitting(true);

      const vehicleData: CreateVehicleData = {
        ...data,
        image: imageFile || undefined,
      };

      await vehicleApi.create(vehicleData);
      router.push('/vehicles');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Erro ao criar veículo');
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
            <h1 className="text-3xl font-bold text-gray-900">Novo Veículo</h1>
            <p className="text-gray-600">Cadastre um novo veículo na frota</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vehicle Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Informações do Veículo</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca *
                      </label>
                      <input
                        {...register('brand')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Toyota"
                      />
                      {errors.brand && (
                        <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modelo *
                      </label>
                      <input
                        {...register('model')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Corolla"
                      />
                      {errors.model && (
                        <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ano *
                      </label>
                      <input
                        type="number"
                        {...register('year', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2023"
                      />
                      {errors.year && (
                        <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placa *
                      </label>
                      <input
                        {...register('plate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ABC-1234"
                      />
                      {errors.plate && (
                        <p className="text-red-500 text-sm mt-1">{errors.plate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor *
                      </label>
                      <input
                        {...register('color')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Branco"
                      />
                      {errors.color && (
                        <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Assentos *
                      </label>
                      <input
                        type="number"
                        {...register('seats', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                      />
                      {errors.seats && (
                        <p className="text-red-500 text-sm mt-1">{errors.seats.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Combustível *
                      </label>
                      <select
                        {...register('fuelType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        <option value="gasoline">Gasolina</option>
                        <option value="ethanol">Etanol</option>
                        <option value="diesel">Diesel</option>
                        <option value="electric">Elétrico</option>
                        <option value="hybrid">Híbrido</option>
                      </select>
                      {errors.fuelType && (
                        <p className="text-red-500 text-sm mt-1">{errors.fuelType.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Câmbio *
                      </label>
                      <select
                        {...register('transmission')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione</option>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automático</option>
                      </select>
                      {errors.transmission && (
                        <p className="text-red-500 text-sm mt-1">{errors.transmission.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descrição adicional do veículo..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Preço</h3>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço por Dia (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('pricePerDay', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="150.00"
                    />
                    {errors.pricePerDay && (
                      <p className="text-red-500 text-sm mt-1">{errors.pricePerDay.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Foto do Veículo</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG até 10MB
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      {imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
                    </label>
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
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Veículo'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
