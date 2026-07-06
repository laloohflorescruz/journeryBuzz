import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listPayments, type Payment as ApiPayment } from '../services/resources';

interface Payment {
  id: number;
  customerName: string;
  amount: number;
  currency: string;
  date: string;
  method: string;
  status: 'paid' | 'processing' | 'pending' | 'failed' | 'refunded';
  reference: string;
}

function toPayment(p: ApiPayment): Payment {
  return {
    id: p.id,
    customerName: `#${p.booking}`,
    amount: Number(p.amount),
    currency: p.currency,
    date: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
    method: p.provider,
    status: p.status,
    reference: p.gateway_reference || p.gateway_session_id || '—',
  };
}

const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString()}`;

function Payments() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    let active = true;
    setLoading(true);
    listPayments()
      .then((data) => { if (active) { setPayments(data.map(toPayment)); setError(null); } })
      .catch(() => { if (active) setError(t('common.loadError', 'No se pudieron cargar los datos.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const getStatusLabel = (status: string) => {
    if (status === 'paid') return t('common.completed');
    if (status === 'processing') return t('common.pending');
    if (status === 'pending') return t('common.pending');
    if (status === 'failed') return t('common.failed');
    if (status === 'refunded') return t('payments.refunded', 'Reembolsado');
    return status;
  };

  const statusClass = (status: string) =>
    status === 'paid' ? 'bg-green-200 text-green-800' :
    status === 'failed' ? 'bg-red-200 text-red-800' :
    status === 'refunded' ? 'bg-gray-200 text-gray-700' :
    'bg-yellow-200 text-yellow-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">💳 {t('payments.title')}</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">{t('payments.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {loading && <p className="text-center text-gray-500 py-10">{t('common.loading', 'Cargando...')}</p>}
        {error && <p className="text-center text-red-600 py-10">{error}</p>}
        {!loading && !error && payments.length === 0 && (
          <p className="text-center text-gray-500 py-10">{t('common.noData', 'No hay datos para mostrar.')}</p>
        )}

        {!loading && !error && payments.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-6 text-left">{t('payments.customer')}</th>
                <th className="py-3 px-6 text-left">{t('payments.amount')}</th>
                <th className="py-3 px-6 text-left">{t('common.date')}</th>
                <th className="py-3 px-6 text-left">{t('payments.method')}</th>
                <th className="py-3 px-6 text-left">{t('common.status')}</th>
                <th className="py-3 px-6 text-left">{t('payments.reference')}</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment) => (
                <tr key={payment.id} onClick={() => handleViewDetails(payment)} className="border-b border-gray-200 hover:bg-indigo-100 transition-colors cursor-pointer">
                  <td className="py-4 px-6">{payment.customerName}</td>
                  <td className="py-4 px-6">{money(payment.amount, payment.currency)}</td>
                  <td className="py-4 px-6">{payment.date}</td>
                  <td className="py-4 px-6">{payment.method}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">{payment.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.previous')}
            </button>
            {renderPagination().map((page, index) => (
              <button key={index} onClick={() => typeof page === 'number' && handlePageChange(page)} disabled={page === '...'}
                className={`px-4 py-2 rounded-lg border transition-colors ${page === currentPage ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('common.next')}
            </button>
          </div>
        )}

        {isModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">{t('payments.details')}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>{t('payments.customer')}:</strong> {selectedPayment.customerName}</p>
                <p><strong>{t('payments.amount')}:</strong> {money(selectedPayment.amount, selectedPayment.currency)}</p>
                <p><strong>{t('common.date')}:</strong> {selectedPayment.date}</p>
                <p><strong>{t('payments.method')}:</strong> {selectedPayment.method}</p>
                <p><strong>{t('common.status')}:</strong> {getStatusLabel(selectedPayment.status)}</p>
                <p><strong>{t('payments.reference')}:</strong> {selectedPayment.reference}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
