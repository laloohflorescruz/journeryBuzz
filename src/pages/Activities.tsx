import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Activity {
  id: number;
  name_en: string;
  name_es: string;
  icon: string;
  is_active: boolean;
}

const PAGE_SIZE = 5;

const Activities: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState<Partial<Activity>>({ name_en: '', name_es: '', icon: '', is_active: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities/');
      setActivities(response.data);
      setCurrentPage(1);
      setError('');
    } catch {
      setError(t('activities.errorLoad'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/activities/${editingId}/`, form);
      } else {
        await api.post('/activities/', form);
      }
      fetchActivities();
      setForm({ name_en: '', name_es: '', icon: '', is_active: true });
      setEditingId(null);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(t('activities.errorValidation'));
      } else {
        setError(t('activities.errorSave'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    setForm(activity);
    setEditingId(activity.id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('activities.confirmDelete'))) {
      try {
        await api.delete(`/activities/${id}/`);
        fetchActivities();
        setError('');
      } catch {
        setError(t('activities.errorDelete'));
      }
    }
  };

  const toggleActive = async (id: number, is_active: boolean) => {
    try {
      await api.patch(`/activities/${id}/`, { is_active: !is_active });
      fetchActivities();
      setError('');
    } catch {
      setError(t('activities.errorToggle'));
    }
  };

  const getDisplayName = (activity: Activity) =>
    i18n.language === 'en' ? activity.name_en : activity.name_es;

  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
  const paginated = activities.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('activities.title')}</h1>

      {/* Language info */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span>{t('activities.displayLanguage')}</span>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
          {i18n.language === 'es' ? 'Español' : 'English'}
        </span>
        <span className="text-gray-400">(cambia con el selector 🌐 en el menú)</span>
      </div>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
        <h2 className="text-xl mb-2">{editingId ? t('activities.editActivity') : t('activities.addActivity')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t('activities.nameEn')}
            value={form.name_en || ''}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder={t('activities.nameEs')}
            value={form.name_es || ''}
            onChange={(e) => setForm({ ...form, name_es: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder={t('activities.icon')}
            value={form.icon || ''}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="p-2 border rounded"
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.is_active || false}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="mr-2"
            />
            {t('common.active')}
          </label>
        </div>
        <button type="submit" disabled={loading} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          {loading ? t('common.saving') : editingId ? t('common.update') : t('common.add')}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => { setForm({ name_en: '', name_es: '', icon: '', is_active: true }); setEditingId(null); }}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
          >
            {t('common.cancel')}
          </button>
        )}
      </form>

      {/* List */}
      <div className="grid gap-4">
        {paginated.map((activity) => (
          <div key={activity.id} className="p-4 border rounded flex justify-between items-center">
            <div className="flex items-center gap-2">
              {activity.icon && <span className="text-xl">{activity.icon}</span>}
              <span className={activity.is_active ? 'font-medium' : 'line-through text-gray-500'}>
                {getDisplayName(activity)}
              </span>
              {!activity.is_active && (
                <span className="text-red-500 ml-2 text-sm">{t('activities.inactive')}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(activity)} className="px-3 py-1 bg-yellow-500 text-white rounded">
                {t('common.edit')}
              </button>
              <button onClick={() => toggleActive(activity.id, activity.is_active)} className="px-3 py-1 bg-green-500 text-white rounded">
                {activity.is_active ? t('common.deactivate') : t('common.activate')}
              </button>
              <button onClick={() => handleDelete(activity.id)} className="px-3 py-1 bg-red-500 text-white rounded">
                {t('common.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            {t('common.previous')}
          </button>
          <span className="text-sm text-gray-600">
            {t('common.pageOf', { current: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-40"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Activities;
