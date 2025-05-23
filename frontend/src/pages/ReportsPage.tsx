import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Year start
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  // Fetch transactions for reports
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await fetch(`http://localhost:3001/api/transactions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Raporlar yüklenirken hata oluştu');
      }
      
      const data = await response.json();
      return data.data || [];
    },
  });

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const totalIncome = transactions.filter((t: any) => t.type === 'INCOME').reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const transactionCount = transactions.length;

    return { totalIncome, totalExpense, netProfit, transactionCount };
  }, [transactions]);

  // Calculate monthly stats
  const monthlyStats = React.useMemo(() => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'INCOME') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Calculate category stats
  const categoryStats = React.useMemo(() => {
    const incomeCategories: { [key: string]: { amount: number; count: number } } = {};
    const expenseCategories: { [key: string]: { amount: number; count: number } } = {};
    
    transactions.forEach((transaction: any) => {
      const categories = transaction.type === 'INCOME' ? incomeCategories : expenseCategories;
      
      if (!categories[transaction.category]) {
        categories[transaction.category] = { amount: 0, count: 0 };
      }
      
      categories[transaction.category].amount += transaction.amount;
      categories[transaction.category].count += 1;
    });

    const incomeStats = Object.entries(incomeCategories).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    const expenseStats = Object.entries(expenseCategories).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);

    return { incomeStats, expenseStats };
  }, [transactions]);

  const formatCurrency = (amount: number) => `₺${amount.toLocaleString()}`;
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mali Raporlar</h1>
        <p className="text-gray-600">Gelir, gider ve karlılık raporlarını görüntüleyin</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Gider</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalExpense)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Kar/Zarar</p>
              <p className={`text-2xl font-bold ${summaryStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summaryStats.netProfit)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DocumentChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.transactionCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Performans</h3>
          <div className="space-y-4">
            {monthlyStats.length > 0 ? monthlyStats.map((month) => (
              <div key={month.month} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{formatMonth(month.month)}</h4>
                  <span className={`text-sm font-medium ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.net)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Gelir: </span>
                    <span className="text-green-600 font-medium">{formatCurrency(month.income)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gider: </span>
                    <span className="text-red-600 font-medium">{formatCurrency(month.expense)}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Seçilen tarih aralığında veri bulunamadı</p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Analizi</h3>
          
          <div className="space-y-6">
            {/* Income Categories */}
            <div>
              <h4 className="font-medium text-green-600 mb-3">Gelir Kategorileri</h4>
              <div className="space-y-2">
                {categoryStats.incomeStats.length > 0 ? categoryStats.incomeStats.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category.category}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-gray-500">{category.count} işlem</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">Gelir kategorisi bulunamadı</p>
                )}
              </div>
            </div>

            {/* Expense Categories */}
            <div>
              <h4 className="font-medium text-red-600 mb-3">Gider Kategorileri</h4>
              <div className="space-y-2">
                {categoryStats.expenseStats.length > 0 ? categoryStats.expenseStats.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category.category}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-gray-500">{category.count} işlem</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm">Gider kategorisi bulunamadı</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 