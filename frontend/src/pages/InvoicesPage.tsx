import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  invoiceNo: string; // Backend uses 'invoiceNo' not 'invoiceNumber'
  customerId: string;
  customer: {
    id: string;
    name: string;
    email?: string;
  };
  date: string; // Backend uses 'date' not 'issueDate'
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    barcode?: string;
  };
  quantity: number;
  price: number; // Backend uses 'price' not 'unitPrice'
  total: number;
}

const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // API functions
  const fetchInvoices = async (): Promise<Invoice[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/invoices', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Faturalar yüklenirken hata oluştu');
    }
    
    const data = await response.json();
    return data.data;
  };



  const updateInvoiceStatus = async ({ id, status }: { id: string; status: string }): Promise<Invoice> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3001/api/invoices/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Fatura durumu güncellenirken hata oluştu');
    }
    
    const data = await response.json();
    return data.data;
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3001/api/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Fatura silinirken hata oluştu');
    }
  };

  // React Query hooks
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateInvoiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura durumu güncellendi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura başarıyla silindi');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleStatusChange = (invoice: Invoice, newStatus: string) => {
    updateStatusMutation.mutate({ id: invoice.id, status: newStatus });
  };

  const handleDelete = (invoice: Invoice) => {
    if (window.confirm(`"${invoice.invoiceNo}" faturasını silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(invoice.id);
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Taslak';
      case 'SENT': return 'Gönderildi';
      case 'PAID': return 'Ödendi';
      case 'OVERDUE': return 'Vadesi Geçti';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  // Stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter(inv => ['SENT', 'OVERDUE'].includes(inv.status)).reduce((sum, inv) => sum + inv.total, 0);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Hata: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faturalar</h1>
        <p className="text-gray-600">Fatura bilgilerini yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Toplam Fatura</div>
          <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Toplam Tutar</div>
          <div className="text-2xl font-bold text-blue-600">₺{totalAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Ödenen</div>
          <div className="text-2xl font-bold text-green-600">₺{paidAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Bekleyen</div>
          <div className="text-2xl font-bold text-orange-600">₺{pendingAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Fatura ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tüm Durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="SENT">Gönderildi</option>
            <option value="PAID">Ödendi</option>
            <option value="OVERDUE">Vadesi Geçti</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
        </div>

        <button
          onClick={() => toast('Yeni fatura oluşturma özelliği yakında eklenecek')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Fatura
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm || statusFilter 
                ? 'Arama kriterlerine uygun fatura bulunamadı.' 
                : 'Henüz fatura eklenmemiş.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.customer.name}</div>
                        {invoice.customer.email && (
                          <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₺{invoice.total.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">KDV: ₺{invoice.taxAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(invoice.status)}`}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="DRAFT">Taslak</option>
                        <option value="SENT">Gönderildi</option>
                        <option value="PAID">Ödendi</option>
                        <option value="OVERDUE">Vadesi Geçti</option>
                        <option value="CANCELLED">İptal Edildi</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Görüntüle"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast('PDF indirme özelliği yakında eklenecek')}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="PDF İndir"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast('Düzenleme özelliği yakında eklenecek')}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Düzenle"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Sil"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Fatura Detayı</h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fatura No</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.invoiceNo}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durum</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusText(selectedInvoice.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Müşteri</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.customer.name}</p>
                    {selectedInvoice.customer.email && (
                      <p className="text-sm text-gray-500">{selectedInvoice.customer.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tarihler</label>
                    <p className="text-sm text-gray-900">
                      Düzenleme: {new Date(selectedInvoice.date).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-sm text-gray-900">
                      Vade: {new Date(selectedInvoice.dueDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notlar</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fatura Kalemleri</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ürün</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Miktar</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Birim Fiyat</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.product.name}
                              {item.product.barcode && (
                                <div className="text-xs text-gray-500">{item.product.barcode}</div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">₺{item.price.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">₺{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam:</span>
                    <span>₺{selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>KDV:</span>
                    <span>₺{selectedInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Toplam:</span>
                    <span>₺{selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                                     onClick={() => toast('PDF indirme özelliği yakında eklenecek')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  PDF İndir
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage; 