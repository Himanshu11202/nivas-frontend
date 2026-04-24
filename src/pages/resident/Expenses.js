import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const expenseTypes = {
    LIGHT: { label: '💡 Light', color: '#fbbf24' },
    WATER: { label: '💧 Water', color: '#3b82f6' },
    CLEANING: { label: '🧹 Cleaning', color: '#10b981' },
    SECURITY: { label: '🔒 Security', color: '#8b5cf6' },
    OTHER: { label: '📦 Other', color: '#6b7280' }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [expensesRes, statsRes] = await Promise.all([
        axios.get(`/api/expenses/resident/month/${selectedMonth}/${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/expenses/resident/stats/${selectedMonth}/${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setExpenses(expensesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Society Expenses</h2>
        <p className="text-slate-500 mt-1">View monthly society expenses for transparency</p>
      </div>

      {/* Month Selector */}
      <div className="modern-card p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="form-input-modern"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="form-input-modern"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="modern-card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <p className="text-blue-600 text-sm font-medium">Total Expenses</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">₹{stats.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className="modern-card p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
            <p className="text-emerald-600 text-sm font-medium">Total Transactions</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalCount || 0}</p>
          </div>
          <div className="modern-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <p className="text-purple-600 text-sm font-medium">Average Per Transaction</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">₹{stats.averageAmount?.toLocaleString() || 0}</p>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="modern-card p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Expense Details</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner-modern"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-slate-500">No expenses found for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Note</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const typeInfo = expenseTypes[expense.type] || expenseTypes.OTHER;
                  return (
                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">{expense.note || '-'}</td>
                      <td className="py-4 px-4 text-sm font-medium text-right text-slate-900">
                        ₹{expense.amount?.toLocaleString() || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
