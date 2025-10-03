import { useState } from 'react';

interface Payment {
  id: number;
  customerName: string;
  amount: number;
  date: string;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
}

function Payments() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const itemsPerPage = 8;

  // Mock payments data
  const payments: Payment[] = [
    {
      id: 1,
      customerName: 'Juan Pérez',
      amount: 90,
      date: '2024-07-15',
      method: 'Credit Card',
      status: 'completed',
      reference: 'PAY123456',
    },
    {
      id: 2,
      customerName: 'Maria Lopez',
      amount: 200,
      date: '2024-07-20',
      method: 'PayPal',
      status: 'pending',
      reference: 'PAY654321',
    },
    {
      id: 3,
      customerName: 'Carlos García',
      amount: 60,
      date: '2024-08-01',
      method: 'Bank Transfer',
      status: 'failed',
      reference: 'PAY987654',
    },
    {
      id: 4,
      customerName: 'Ana Martínez',
      amount: 210,
      date: '2024-08-10',
      method: 'Credit Card',
      status: 'completed',
      reference: 'PAY321987',
    },
    {
      id: 5,
      customerName: 'Luis Fernández',
      amount: 80,
      date: '2024-08-15',
      method: 'PayPal',
      status: 'pending',
      reference: 'PAY456789',
    },
  ];

  // Pagination logic
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">💳 Payments</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Visualiza y gestiona todos los pagos realizados en la plataforma.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="py-3 px-6 text-left">Cliente</th>
                <th className="py-3 px-6 text-left">Monto (€)</th>
                <th className="py-3 px-6 text-left">Fecha</th>
                <th className="py-3 px-6 text-left">Método</th>
                <th className="py-3 px-6 text-left">Estado</th>
                <th className="py-3 px-6 text-left">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-200 hover:bg-indigo-100 transition-colors">
                  <td className="py-4 px-6">{payment.customerName}</td>
                  <td className="py-4 px-6">€{payment.amount}</td>
                  <td className="py-4 px-6">{payment.date}</td>
                  <td className="py-4 px-6">{payment.method}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        payment.status === 'completed'
                          ? 'bg-green-200 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">{payment.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {renderPagination().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  page === currentPage ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Details Modal */}
        {isModalOpen && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Detalles del Pago</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>Cliente:</strong> {selectedPayment.customerName}</p>
                <p><strong>Monto (€):</strong> €{selectedPayment.amount}</p>
                <p><strong>Fecha:</strong> {selectedPayment.date}</p>
                <p><strong>Método:</strong> {selectedPayment.method}</p>
                <p><strong>Estado:</strong> {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}</p>
                <p><strong>Referencia:</strong> {selectedPayment.reference}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Cerrar
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
