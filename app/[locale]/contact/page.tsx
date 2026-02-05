'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

export default function ContactPage() {
  const t = useTranslations('contact');
  const tServices = useTranslations('services');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    alien_number: '',
    passport_number: '',
    nationality: '',
    phone: '',
    visa_type: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.alien_number.trim()) {
      newErrors.alien_number = 'Alien registration number is required';
    } else if (formData.alien_number.trim().length < 3) {
      newErrors.alien_number = 'Alien registration number must be at least 3 characters';
    }
    
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    } else if (formData.nationality.trim().length < 2) {
      newErrors.nationality = 'Nationality must be at least 2 characters';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 5) {
      newErrors.phone = 'Phone number must be at least 5 characters';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number contains invalid characters';
    }
    
    if (!formData.visa_type) {
      newErrors.visa_type = 'Service type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('success'));
        setFormData({
          name: '',
          alien_number: '',
          passport_number: '',
          nationality: '',
          phone: '',
          visa_type: '',
          message: '',
        });
        setErrors({});
      } else {
        // Handle validation errors from server
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            if (err.path) {
              serverErrors[err.path] = err.message;
            }
          });
          setErrors(serverErrors);
          toast.error('Please correct the errors in the form');
        } else {
          // Show detailed error message
          const errorMessage = data.error 
            ? `${data.message}: ${data.error}`
            : data.message || t('error');
          toast.error(errorMessage);
          console.error('Registration failed:', data);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error 
        ? `Network error: ${error.message}`
        : t('error');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <Navigation />
      <div className="py-20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold premium-shadow">
                Get Started Today
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('title')}
            </h2>
            <p className="text-xl text-slate-600">{t('subtitle')}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="glass rounded-2xl premium-shadow-lg p-8 md:p-12 border border-white/30 animate-slide-up"
          >
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                {t('formTitle')}
              </h3>
              <p className="text-slate-600">{t('formSubtitle')}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-3">
                  {t('name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                    errors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-blue-300'
                  }`}
                  placeholder="Name (As per registration card)*"
                />
                {errors.name && (
                  <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="alien_number" className="block text-sm font-bold text-slate-700 mb-3">
                    {t('alienNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="alien_number"
                    name="alien_number"
                    required
                    value={formData.alien_number}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      errors.alien_number ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-blue-300'
                    }`}
                    placeholder="Alien Registration Number*"
                  />
                  {errors.alien_number && (
                    <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.alien_number}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="passport_number" className="block text-sm font-bold text-slate-700 mb-3">
                    {t('passportNumber')}
                  </label>
                  <input
                    type="text"
                    id="passport_number"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300"
                    placeholder="Passport Number"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nationality" className="block text-sm font-bold text-slate-700 mb-3">
                    {t('nationality')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    required
                    value={formData.nationality}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      errors.nationality ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-blue-300'
                    }`}
                    placeholder="Nationality*"
                  />
                  {errors.nationality && (
                    <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.nationality}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-3">
                    {t('phone')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      errors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-blue-300'
                    }`}
                    placeholder="Phone Number*"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="visa_type" className="block text-sm font-bold text-slate-700 mb-3">
                  {t('serviceType')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="visa_type"
                  name="visa_type"
                  required
                  value={formData.visa_type}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                    errors.visa_type ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <option value="">Select Service Type*</option>
                  <option value="income_tax">{tServices('incomeTax')}</option>
                  <option value="house_rent">{tServices('houseRent')}</option>
                  <option value="family_tax">{tServices('familyTax')}</option>
                  <option value="other">{tServices('other')}</option>
                </select>
                {errors.visa_type && (
                  <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.visa_type}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-3">
                  {t('message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-blue-300 resize-none"
                  placeholder="Any additional details"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg premium-shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {t('submit')}
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

