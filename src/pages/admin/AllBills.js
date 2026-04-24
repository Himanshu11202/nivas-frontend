import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllBills = () => {
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0,
    totalCollected: 0
  });

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBills(response.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bills/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data || {
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0,
        totalCollected: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBills();
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/bills/search?flatNumber=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBills(response.data || []);
    } catch (error) {
      console.error('Error searching bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || monthNum;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">All Bills</h2>
        <p className="text-slate-500">Track and manage all maintenance bills</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="modern-card p-4">
          <p className="text-sm text-slate-500 mb-1">Total Bills</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalBills}</p>
        </div>
        <div className="modern-card p-4">
          <p className="text-sm text-slate-500 mb-1">Paid Bills</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.paidBills}</p>
        </div>
        <div className="modern-card p-4">
          <p className="text-sm text-slate-500 mb-1">Unpaid Bills</p>
          <p className="text-2xl font-bold text-amber-600">{stats.unpaidBills}</p>
        </div>
        <div className="modern-card p-4">
          <p className="text-sm text-slate-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-blue-600">₹{stats.totalCollected || 0}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="modern-card p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="form-input-modern w-full pl-12"
              placeholder="Search by flat number..."
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-modern-primary px-6"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              fetchBills();
            }}
            className="btn-modern-secondary px-6"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="modern-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner-modern"></div>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500">No bills found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Resident</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Flat Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{bill.user?.name || 'N/A'}</div>
                      <div className="text-sm text-slate-500">{bill.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {bill.flatNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {getMonthName(bill.month)} {bill.year}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">₹{bill.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'PAID' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {bill.paidAt ? formatDate(bill.paidAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBills;
