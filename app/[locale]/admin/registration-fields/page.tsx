'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from 'next-intl';
import AdminNav from '@/components/AdminNav';
import Link from 'next/link';

interface IFieldSettings {
  id: string;
  name: string;
  isActive: boolean;
  isRequired: boolean;
  isCustom: boolean;
}

interface RegistrationSettings {
  fields: IFieldSettings[];
}

export default function AdminRegistrationFieldsPage() {
  const locale = useLocale();
  const [settings, setSettings] = useState<RegistrationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/registration-fields');
      const data = await response.json();

      if (response.ok) {
        setSettings(data.data);
      } else {
        toast.error('Failed to fetch field settings');
      }
    } catch (error) {
      toast.error('Error fetching field settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (index: number, property: keyof IFieldSettings) => {
    if (!settings) return;

    const updatedFields = [...settings.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [property]: !updatedFields[index][property]
    };

    setSettings({
      ...settings,
      fields: updatedFields
    });
  };

  const handleAddField = () => {
    if (!settings || !newFieldName.trim()) return;
    
    const id = `custom_${Date.now()}`;
    const newField: IFieldSettings = {
      id,
      name: newFieldName.trim(),
      isActive: true,
      isRequired: false,
      isCustom: true
    };
    
    setSettings({
      ...settings,
      fields: [...settings.fields, newField]
    });
    
    setNewFieldName('');
    setShowModal(false);
    toast.success('Field added locally. Remember to save changes.');
  };

  const handleDeleteField = (index: number) => {
    if (!settings) return;
    
    const field = settings.fields[index];
    if (!field.isCustom) {
      toast.error('Cannot delete system fields. You can only deactivate them.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the field "${field.name}"?`)) return;
    
    const updatedFields = settings.fields.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      fields: updatedFields
    });
    toast.success('Field removed locally. Remember to save changes.');
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/registration-fields', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: settings.fields }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <AdminNav />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold premium-shadow">
              Form Configuration
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Registration Fields
              </h1>
              <p className="text-xl text-slate-600">
                Configure which fields are visible and required, and add custom fields.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/${locale}/admin/registrations`}
                className="px-6 py-3 glass text-slate-700 font-semibold rounded-xl premium-shadow hover:scale-105 transition-all duration-300 border border-white/30"
              >
                Back
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300"
              >
                + Add Custom Field
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !settings}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl premium-shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl premium-shadow-lg overflow-hidden border border-white/30 animate-slide-up p-8">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-xl font-semibold text-slate-700">Loading settings...</p>
            </div>
          ) : !settings ? (
             <div className="p-12 text-center text-red-500">Failed to load settings.</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-200/50 font-bold text-gray-700 uppercase text-sm">
                <div className="col-span-4">Field Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2 text-center">Visible (Active)</div>
                <div className="col-span-2 text-center">Required</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>

              {settings.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100/50 hover:bg-white/40 transition-colors rounded-lg px-2">
                  <div className="col-span-4 font-semibold text-gray-800 text-lg">
                    {field.name}
                    <div className="text-sm font-normal text-gray-500 mt-1">Key: {field.id}</div>
                  </div>
                  <div className="col-span-2">
                    {field.isCustom ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Custom</span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">System</span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={field.isActive}
                        onChange={() => handleToggle(index, 'isActive')}
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={field.isRequired}
                        onChange={() => handleToggle(index, 'isRequired')}
                        disabled={!field.isActive}
                      />
                      <div className={`w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${!field.isActive ? 'opacity-50' : 'peer-checked:bg-indigo-600'}`}></div>
                    </label>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {field.isCustom ? (
                      <button
                        onClick={() => handleDeleteField(index)}
                        className="text-red-500 hover:text-red-700 font-semibold p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Cannot Delete</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Field Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Add Custom Field</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Field Display Name</label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Emergency Contact"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-3">This field will appear on the registration form as a text input.</p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewFieldName('');
                }}
                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddField}
                disabled={!newFieldName.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
