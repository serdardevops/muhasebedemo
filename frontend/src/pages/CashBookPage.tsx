import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  BanknotesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface CashBookEntry {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  description: string;
  date: string;
  category?: string;
  reference?: string;
  notes?: string;
  balance: number;
  customer?: { id: string; name: string };
  supplier?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface CashBookFormData {
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  description: string;
  date: string;
  category: string;
  reference: string;
  notes: string;
  customerId: string;
  supplierId: string;
}

interface CashBalance {
  currentBalance: number;
  todayIncome: number;
  todayExpense: number;
  todayNet: number;
  todayEntries: number;
}

const CashBookPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashBookEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState<CashBookFormData>({
    type: 'CASH_IN',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    customerId: '',
    supplierId: '',
  });

  const queryClient = useQueryClient();

  // Check URL parameters and open modal if needed
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam === 'cash-in' || typeParam === 'cash-out') {
      const entryType = typeParam === 'cash-in' ? 'CASH_IN' : 'CASH_OUT';
      setFormData(prev => ({ ...prev, type: entryType }));
      setIsModalOpen(true);
      // Clear URL parameters
      navigate('/cashbook', { replace: true });
    }
  }, [location.search, navigate]);

  // API functions
  const fetchCashBookEntries = async (): Promise<CashBookEntry[]> => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/cashbook', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Kasa defteri kayıtları yüklenirken hata oluştu');
    }
    
    const data = await response.json();
    return data.data;
  };

  const fetchCashBalance = async (): Promise<CashBalance> => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3001/api/cashbook/balance', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Kasa bakiyesi yüklenirken hata oluştu');
    }
    
    const data = await response.json();
    return data.data;
  };

  const createCashBookEntry = async (entryData: CashBookFormData): Promise<CashBookEntry> => {
    const token = localStorage.getItem('token');
    
    const processedData = {
      ...entryData,
      date: new Date(entryData.date).toISOString(),
      amount: Number(entryData.amount),
      customerId: entryData.customerId || null,
      supplierId: entryData.supplierId || null,
    };
    
    const response = await fetch('http://localhost:3001/api/cashbook', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kasa defteri kaydı oluşturulurken hata oluştu');
    }
    
    const data = await response.json();
    return data.data;
  };

  const updateCashBookEntry = async ({ id, ...entryData }: CashBookFormData & { id: string }): Promise<CashBookEntry> => {
    const token = localStorage.getItem('token');
    
    const processedData = {
      ...entryData,
      date: new Date(entryData.date).toISOString(),
      amount: Number(entryData.amount),
      customerId: entryData.customerId || null,
      supplierId: entryData.supplierId || null,
    };
    
    const response = await fetch(`http://localhost:3001/api/cashbook/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kasa defteri kaydı güncellenirken hata oluştu');
    }
    
    const data = await response.json();
    return data.data;
  };

  const deleteCashBookEntry = async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3001/api/cashbook/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kasa defteri kaydı silinirken hata oluştu');
    }
  };

  // React Query hooks
  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['cashbook'],
    queryFn: fetchCashBookEntries,
  });

  const { data: balance } = useQuery({
    queryKey: ['cashbook-balance'],
    queryFn: fetchCashBalance,
  });

  const createMutation = useMutation({
    mutationFn: createCashBookEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook-balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Kasa defteri kaydı başarıyla oluşturuldu');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCashBookEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook-balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Kasa defteri kaydı başarıyla güncellendi');
      setIsModalOpen(false);
      setEditingEntry(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCashBookEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashbook'] });
      queryClient.invalidateQueries({ queryKey: ['cashbook-balance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Kasa defteri kaydı başarıyla silindi');
    },
    onError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  // Form handlers
  const resetForm = () => {
    setFormData({
      type: 'CASH_IN',
      amount: 0,
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
      customerId: '',
      supplierId: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Açıklama zorunludur');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Tutar 0\'dan büyük olmalıdır');
      return;
    }

    if (editingEntry) {
      updateMutation.mutate({ ...formData, id: editingEntry.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (entry: CashBookEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      category: entry.category || '',
      date: entry.date.split('T')[0],
      reference: entry.reference || '',
      notes: entry.notes || '',
      customerId: entry.customer?.id || '',
      supplierId: entry.supplier?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (entry: CashBookEntry) => {
    if (window.confirm(`"${entry.description}" kaydını silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(entry.id);
    }
  };

  const openCreateModal = () => {
    setEditingEntry(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || entry.type === typeFilter;
    const matchesCategory = !categoryFilter || entry.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(entries.map(e => e.category).filter(Boolean)));

  // Common categories
  const cashInCategories = ['Satış Tahsilatı', 'Müşteri Ödemesi', 'Nakit Satış', 'Diğer Gelir'];
  const cashOutCategories = ['Tedarikçi Ödemesi', 'Gider Ödemesi', 'Maaş Ödemesi', 'Kira', 'Diğer Gider'];

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
        <h1 className="text-2xl font-bold text-gray-900">Kasa Defteri</h1>
        <p className="text-gray-600">Nakit giriş ve çıkışlarını takip edin</p>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center">
              <BanknotesIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500">Kasa Bakiyesi</div>
                <div className="text-2xl font-bold text-blue-600">₺{balance.currentBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center">
              <ArrowUpIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500">Bugün Giren</div>
                <div className="text-2xl font-bold text-green-600">₺{balance.todayIncome.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center">
              <ArrowDownIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500">Bugün Çıkan</div>
                <div className="text-2xl font-bold text-red-600">₺{balance.todayExpense.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-500">Bugün Net</div>
                <div className={`text-2xl font-bold ${balance.todayNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₺{balance.todayNet.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kayıt ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tüm Türler</option>
            <option value="CASH_IN">Kasa Girişi</option>
            <option value="CASH_OUT">Kasa Çıkışı</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Yeni Kayıt
        </button>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm || typeFilter || categoryFilter 
                ? 'Arama kriterlerine uygun kayıt bulunamadı.' 
                : 'Henüz kasa defteri kaydı eklenmemiş.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bakiye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referans
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {entry.type === 'CASH_IN' ? (
                          <ArrowUpIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <ArrowDownIcon className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          entry.type === 'CASH_IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'CASH_IN' ? 'Giriş' : 'Çıkış'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{entry.description}</div>
                        {entry.notes && (
                          <div className="text-sm text-gray-500">{entry.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        entry.type === 'CASH_IN' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry.type === 'CASH_IN' ? '+' : '-'}₺{entry.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₺{entry.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Düzenle"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingEntry ? 'Kasa Defteri Kaydı Düzenle' : 'Yeni Kasa Defteri Kaydı'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İşlem Türü *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'CASH_IN' | 'CASH_OUT' })}
                  >
                    <option value="CASH_IN">Kasa Girişi</option>
                    <option value="CASH_OUT">Kasa Çıkışı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Kategori seçin</option>
                    {(formData.type === 'CASH_IN' ? cashInCategories : cashOutCategories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tutar (₺) *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarih *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referans
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Fiş no, makbuz no, vb."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingEntry(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBookPage; 