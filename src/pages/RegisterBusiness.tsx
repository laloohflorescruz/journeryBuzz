import React, { useState } from 'react';

interface UploadedImage {
  file: File;
  url: string;
  id: number;
}

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface SocialMedia {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
}

interface FormData {
  businessName: string;
  businessType: string;
  description: string;
  address: string;
  city: string;
  country: string;
  services: string;
  products: string;
  priceRange: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  socialMedia: SocialMedia;
  businessHours: BusinessHours;
  photos: File[];
  logo: File | null;
}

interface Errors {
  [key: string]: string;
}

function RegisterBusiness() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    description: '',
    address: '',
    city: '',
    country: '',
    services: '',
    products: '',
    priceRange: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      youtube: '',
      linkedin: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    },
    photos: [],
    logo: null
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: FileList) => {
    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 8)); // Max 8 images for businesses
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeImage = (id: number) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleHoursChange = (day: string, field: string, value: string) => {
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day as keyof typeof formData.businessHours],
          [field]: value
        }
      }
    });
  };

  const toggleDayClosed = (day: string) => {
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day as keyof typeof formData.businessHours],
          closed: !formData.businessHours[day as keyof typeof formData.businessHours].closed
        }
      }
    });
  };

  const validateStep = (step: number) => {
    const newErrors: Errors = {};

    if (step === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = 'El nombre del negocio es requerido';
      if (!formData.businessType) newErrors.businessType = 'Selecciona un tipo de negocio';
      if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
      if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
      if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
      if (!formData.country.trim()) newErrors.country = 'El país es requerido';
    }

    if (step === 3) {
      if (!formData.contactName.trim()) newErrors.contactName = 'El nombre de contacto es requerido';
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'El email es requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Business registered:', formData);
    alert('¡Negocio registrado exitosamente! Será revisado por nuestro equipo en las próximas 24-48 horas.');

    // Reset form
    setFormData({
      businessName: '',
      businessType: '',
      description: '',
      address: '',
      city: '',
      country: '',
      services: '',
      products: '',
      priceRange: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: '',
        youtube: '',
        linkedin: ''
      },
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: true }
      },
      photos: [],
      logo: null
    });
    setCurrentStep(1);
    setIsSubmitting(false);
  };

  const steps = [
    { id: 1, title: 'Información del Negocio', icon: '🏢' },
    { id: 2, title: 'Servicios y Horarios', icon: '🕒' },
    { id: 3, title: 'Contacto y Fotos', icon: '📞' }
  ];

  const businessTypes = [
    { value: 'restaurant', label: '🍽️ Restaurante', desc: 'AyB' },
    { value: 'hotel', label: '🏨 Hotel', desc: 'Alojamiento' },
    { value: 'tour-agency', label: '🎯 Agencia de Tours', desc: 'Excursiones y tours' },
    { value: 'transport', label: '🚗 Transporte', desc: 'Alquiler de vehículos, taxis' },
    { value: 'shopping', label: '🛍️ Tiendas', desc: 'Compras y souvenirs' },
    { value: 'services', label: '💼 Servicios', desc: 'Guías, traductores, etc.' },
    { value: 'entertainment', label: '🎭 Entretenimiento', desc: 'Bares, discotecas, espectáculos' },
    { value: 'health-beauty', label: '💅 Salud y Belleza', desc: 'Spas, salones, clínicas' }
  ];

  const priceRanges = [
    { value: 'budget', label: '💰 Económico', desc: 'Hasta $25 por persona/servicio' },
    { value: 'moderate', label: '💵 Moderado', desc: '$25 - $75 por persona/servicio' },
    { value: 'expensive', label: '💎 Premium', desc: '$75+ por persona/servicio' }
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">🏢 Registra tu Negocio</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Conecta con mochileros y viajeros. Haz crecer tu negocio
            alcanzando a miles de turistas internacionales.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold transition-all duration-300 ${
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.id < currentStep ? '✓' : step.icon}
                </div>
                <div className="ml-4 hidden md:block">
                  <div className={`text-sm font-medium ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                    Paso {step.id}
                  </div>
                  <div className={`text-lg font-semibold ${step.id <= currentStep ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">🏢 Información del Negocio</h2>
                    <p className="text-gray-600">Cuéntanos sobre tu empresa</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🏷️ Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.businessName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Ej: Hotel Paradiso"
                        required
                      />
                      {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        📂 Tipo de Negocio *
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.businessType ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        required
                      >
                        <option value="">Seleccionar tipo de negocio</option>
                        {businessTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label} - {type.desc}
                          </option>
                        ))}
                      </select>
                      {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      📖 Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full p-4 border-2 rounded-xl transition-colors ${
                        errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Describe tu negocio: qué ofreces, qué te hace especial, experiencia para mochileros..."
                      required
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🏠 Dirección *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Calle y número"
                        required
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🏙️ Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Ej: Santo Domingo"
                        required
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🌍 País *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.country ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Ej: República Dominicana"
                        required
                      />
                      {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Services and Hours */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">🕒 Servicios y Horarios</h2>
                    <p className="text-gray-600">Detalles operativos de tu negocio</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🔧 Servicios Ofrecidos
                      </label>
                      <textarea
                        name="services"
                        value={formData.services}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                        placeholder="Ej: Desayuno incluido, WiFi gratis, Tours guiados..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🛍️ Productos/Servicios
                      </label>
                      <textarea
                        name="products"
                        value={formData.products}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                        placeholder="Lista tus productos principales o servicios destacados..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      💰 Rango de Precios
                    </label>
                    <select
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                    >
                      <option value="">Seleccionar rango de precios</option>
                      {priceRanges.map(range => (
                        <option key={range.value} value={range.value}>
                          {range.label} - {range.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Business Hours */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">🕒 Horarios de Atención</h3>
                    <div className="space-y-3">
                      {daysOfWeek.map(day => (
                        <div key={day.key} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-24 font-medium text-gray-700">{day.label}</div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.businessHours[day.key as keyof typeof formData.businessHours].closed}
                              onChange={() => toggleDayClosed(day.key)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">Cerrado</span>
                          </label>
                          {!formData.businessHours[day.key as keyof typeof formData.businessHours].closed && (
                            <>
                              <input
                                type="time"
                                value={formData.businessHours[day.key as keyof typeof formData.businessHours].open}
                                onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                                className="p-2 border border-gray-300 rounded"
                              />
                              <span className="text-gray-500">a</span>
                              <input
                                type="time"
                                value={formData.businessHours[day.key as keyof typeof formData.businessHours].close}
                                onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                                className="p-2 border border-gray-300 rounded"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Contact and Photos */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">📞 Contacto y Fotos</h2>
                    <p className="text-gray-600">Información de contacto y fotos de tu negocio</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        👤 Nombre de Contacto *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.contactName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="Tu nombre o el de tu negocio"
                        required
                      />
                      {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        📧 Email *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className={`w-full p-4 border-2 rounded-xl transition-colors ${
                          errors.contactEmail ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        placeholder="contacto@tunegocio.com"
                        required
                      />
                      {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        📱 Teléfono
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                        placeholder="+1 809 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        🌐 Sitio Web
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                        placeholder="https://tunegocio.com"
                      />
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      📸 Fotos de tu Negocio
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-4xl mb-4">📷</div>
                      <p className="text-gray-600 mb-4">
                        Arrastra y suelta fotos de tu negocio aquí, o haz clic para seleccionar
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files!)}
                        className="hidden"
                        id="business-photo-upload"
                      />
                      <label
                        htmlFor="business-photo-upload"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Seleccionar Fotos
                      </label>
                      <p className="text-sm text-gray-500 mt-2">Máximo 8 fotos • Formatos: JPG, PNG, WebP</p>
                    </div>

                    {/* Uploaded Images Preview */}
                    {uploadedImages.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Fotos seleccionadas ({uploadedImages.length}/8):</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedImages.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt="Business Preview"
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-amber-800 mb-2">💡 Consejos para mejores fotos:</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Muestra el exterior e interior de tu negocio</li>
                        <li>• Incluye fotos de productos/servicios destacados</li>
                        <li>• Fotografía con buena iluminación natural</li>
                        <li>• Evita fotos borrosas o con personas</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-blue-800 mb-3">✅ ¿Qué sucede después?</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• Revisaremos tu registro en 24-48 horas</li>
                      <li>• Te contactaremos si necesitamos más información</li>
                      <li>• Una vez aprobado, tu negocio aparecerá en la plataforma</li>
                      <li>• Podrás gestionar reseñas y conectar con mochileros</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    ← Anterior
                  </button>
                )}

                <div className="flex-1" />

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '⏳ Registrando...' : '✅ Registrar Negocio'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterBusiness;
