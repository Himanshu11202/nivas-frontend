import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatingMaintenance, setGeneratingMaintenance] = useState(false);

  const [formData, setFormData] = useState({
    type: 'LIGHT',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const expenseTypes = [
    { value: 'LIGHT', label: '💡 Light', color: '#fbbf24' },
    { value: 'WATER', label: '💧 Water', color: '#3b82f6' },
    { value: 'CLEANING', label: '🧹 Cleaning', color: '#10b981' },
    { value: 'SECURITY', label: '🔒 Security', color: '#8b5cf6' },
    { value: 'OTHER', label: '📦 Other', color: '#6b7280' }
  ];

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

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [expensesRes, statsRes, trendRes] = await Promise.all([
        axios.get(`/api/expenses/month/${selectedMonth}/${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`/api/expenses/stats/${selectedMonth}/${selectedYear}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/expenses/trend', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setExpenses(expensesRes.data);
      setStats(statsRes.data);
      setMonthlyTrend(trendRes.data);
    } catch (error) {
      console.error('Error fetching expense data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/expenses', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setFormData({
        type: 'LIGHT',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      setShowForm(false);
      fetchData();
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/expenses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
      alert('Expense deleted successfully!');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense.');
    }
  };

  const generateMaintenance = async () => {
    try {
      setGeneratingMaintenance(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/expenses/generate-maintenance', {
        month: selectedMonth,
        year: selectedYear,
        description: `Maintenance for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = response.data;
      alert(
        `Maintenance Generated Successfully!\n\n` +
        `Total Expense: ₹${result.totalExpense}\n` +
        `Per Flat: ₹${result.perFlatAmount}\n` +
        `Total Flats: ${result.totalFlats}\n` +
        `Bills Created: ${result.billsCreated}`
      );
    } catch (error) {
      console.error('Error generating maintenance:', error);
      alert(error.response?.data?.error || 'Failed to generate maintenance.');
    } finally {
      setGeneratingMaintenance(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    return expenseTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type) => {
    return expenseTypes.find(t => t.value === type)?.color || '#6b7280';
  };

  // Prepare chart data
  const pieChartData = stats?.breakdown ? Object.entries(stats.breakdown).map(([type, amount]) => ({
    name: getTypeLabel(type),
    value: parseFloat(amount),
    color: getTypeColor(type)
  })) : [];

  const lineChartData = monthlyTrend.map(item => ({
    month: `${item.year}-${String(item.month).padStart(2, '0')}`,
    amount: parseFloat(item.total)
  })).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner-modern"></div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">💰 Expense Management</h2>
        <p className="text-slate-500 mt-1">Track and manage society expenses with analytics</p>
      </div>

      {/* Month/Year Selector */}
      <div className="modern-card p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Month:</label>
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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="form-input-modern"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-modern-primary ml-auto"
        >
          ➕ Add Expense
        </button>
      </div>

      {/* Total Card */}
      <div className="modern-card p-6 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total Monthly Expense</p>
            <p className="text-4xl font-bold mt-1">
              {formatCurrency(stats?.totalExpense || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
            <p className="text-sm mt-1">{expenses.length} expenses recorded</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart - Monthly Trend */}
        <div className="modern-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">📈 Monthly Expense Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Category Breakdown */}
        <div className="modern-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">🥧 Expense Breakdown</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Generate Maintenance Button */}
      <div className="modern-card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">⚡ Generate Maintenance Bills</h3>
            <p className="text-slate-500 text-sm">Divide total expense by all flats and create bills automatically</p>
          </div>
          <button
            onClick={generateMaintenance}
            disabled={generatingMaintenance || !stats?.totalExpense}
            className="btn-modern-primary"
          >
            {generatingMaintenance ? '⏳ Generating...' : '⚡ Generate Maintenance'}
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="modern-card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">📋 Expense List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Note</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No expenses found for this month
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span 
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${getTypeColor(expense.type)}20`,
                          color: getTypeColor(expense.type)
                        }}
                      >
                        {getTypeLabel(expense.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {expense.note || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="modern-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">➕ Add New Expense</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expense Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-input-modern w-full"
                  required
                >
                  {expenseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="form-input-modern w-full"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="form-input-modern w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Note (Optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="form-input-modern w-full h-20 resize-none"
                  placeholder="Add any additional details..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-modern-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modern-primary flex-1"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;
