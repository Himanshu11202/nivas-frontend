import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const MyBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBills: 0,
    paidBills: 0,
    unpaidBills: 0
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchBills();
      fetchStats();
    }
  }, [user]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/bills/user/${user.id}`, {
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
      const response = await axios.get(`/api/bills/user/${user.id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStats(response.data || {
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/bills/${billId}/pay`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.message === 'Payment successful') {
        // Refresh bills
        fetchBills();
        fetchStats();
        // Show receipt
        generateReceipt(billId);
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const generateReceipt = async (billId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/bills/${billId}/receipt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReceiptData(response.data);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error generating receipt:', error);
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
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">My Bills</h2>
        <p className="text-slate-500">View and manage your maintenance bills</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="modern-card max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
              <p className="text-slate-500">Your receipt has been generated</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Resident Name</span>
                <span className="font-medium text-slate-900">{receiptData.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flat Number</span>
                <span className="font-medium text-slate-900">{receiptData.flatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-emerald-600">₹{receiptData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Period</span>
                <span className="font-medium text-slate-900">{getMonthName(receiptData.month)} {receiptData.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date</span>
                <span className="font-medium text-slate-900">{formatDate(receiptData.paymentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  {receiptData.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="btn-modern-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bills List */}
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
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="modern-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {getMonthName(bill.month)} {bill.year}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'PAID' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-1">{bill.description}</p>
                  <p className="text-slate-400 text-xs">Flat: {bill.flatNumber}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">₹{bill.amount}</p>
                    {bill.paidAt && (
                      <p className="text-sm text-slate-500">Paid on {formatDate(bill.paidAt)}</p>
                    )}
                  </div>

                  {bill.status === 'UNPAID' ? (
                    <button
                      onClick={() => handleMarkAsPaid(bill.id)}
                      className="btn-modern-primary whitespace-nowrap"
                    >
                      Mark as Paid
                    </button>
                  ) : (
                    <button
                      onClick={() => generateReceipt(bill.id)}
                      className="btn-modern-secondary whitespace-nowrap"
                    >
                      View Receipt
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBills;
