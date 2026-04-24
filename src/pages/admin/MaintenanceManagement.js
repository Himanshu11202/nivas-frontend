import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaintenanceManagement = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Monthly Maintenance');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [billStats, setBillStats] = useState({
    paidBills: 0,
    unpaidBills: 0,
    totalBills: 0,
    collectionRate: 0
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch bill stats on mount and every 10 seconds (real-time)
  useEffect(() => {
    fetchBillStats();
    const interval = setInterval(fetchBillStats, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBillStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bills/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBillStats(response.data || {
        paidBills: 0,
        unpaidBills: 0,
        totalBills: 0,
        collectionRate: 0
      });
    } catch (error) {
      console.error('Error fetching bill stats:', error);
    }
  };

  // Dummy QR Code URL (placeholder - replace with real bank QR later)
  const dummyQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=society@upi&pn=Society&am=${amount || '0'}&cu=INR`;

  const handleSendMaintenance = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/maintenance/send', {
        amount: parseFloat(amount),
        description: description || 'Monthly Maintenance',
        month: parseInt(month),
        year: parseInt(year)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const { billsCreated, notificationsSent } = response.data;
      setMessage(`Maintenance sent successfully! ${billsCreated} bills created, ${notificationsSent} notifications sent.`);
      setMessageType('success');
      
      // Reset form
      setAmount('');
      setDescription('Monthly Maintenance');
    } catch (error) {
      console.error('Error sending maintenance:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      setMessage(`Error sending maintenance: ${errorMsg}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Maintenance Management</h2>
        <p className="text-slate-500">Send maintenance bills to all residents</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          messageType === 'success' 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {messageType === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {message}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Maintenance Form */}
        <div className="modern-card p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Send New Maintenance</h3>
          
          <form onSubmit={handleSendMaintenance} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maintenance Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input-modern w-full pl-10"
                  placeholder="Enter amount"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input-modern w-full"
                placeholder="Enter description"
              />
            </div>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="form-input-modern w-full"
                >
                  {months.map((m, index) => (
                    <option key={index + 1} value={index + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="form-input-modern w-full"
                  min="2024"
                  max="2030"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-modern-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner-modern w-5 h-5"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send to All Residents
                </>
              )}
            </button>
          </form>
        </div>

        {/* QR Code Preview */}
        <div className="modern-card p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Payment QR Code</h3>
          
          <div className="flex flex-col items-center">
            {amount ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                  <img 
                    src={dummyQRCode} 
                    alt="Payment QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-slate-600 text-center mb-2">
                  Scan to pay <span className="font-bold text-slate-900">₹{amount}</span>
                </p>
                <p className="text-sm text-slate-500 text-center">
                  {description} - {months[month - 1]} {year}
                </p>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM8 14v1m0-6V4m6 0v6M5 6h14M5 10h14M5 14h14M5 18h14" />
                  </svg>
                </div>
                <p>Enter amount to generate QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status Graph */}
      <div className="modern-card p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">Payment Status Overview</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-slate-600">Unpaid</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-slate-900">{billStats.totalBills}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Paid Bills</p>
              <p className="text-2xl font-bold text-emerald-600">{billStats.paidBills}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Unpaid Bills</p>
              <p className="text-2xl font-bold text-amber-600">{billStats.unpaidBills}</p>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="md:col-span-2">
            <div className="h-64 bg-slate-50 rounded-xl p-6">
              {billStats.totalBills > 0 ? (
                <div className="h-full flex flex-col justify-end">
                  <div className="flex items-end justify-center gap-8 h-full">
                    {/* Paid Bar */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-emerald-600 mb-2">
                        {Math.round((billStats.paidBills / billStats.totalBills) * 100)}%
                      </span>
                      <div 
                        className="w-20 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500"
                        style={{ 
                          height: `${(billStats.paidBills / billStats.totalBills) * 100}%`,
                          minHeight: billStats.paidBills > 0 ? '20px' : '0'
                        }}
                      ></div>
                      <span className="text-sm font-medium text-slate-700 mt-2">Paid</span>
                      <span className="text-xs text-slate-500">{billStats.paidBills} users</span>
                    </div>
                    
                    {/* Unpaid Bar */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-amber-600 mb-2">
                        {Math.round((billStats.unpaidBills / billStats.totalBills) * 100)}%
                      </span>
                      <div 
                        className="w-20 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500"
                        style={{ 
                          height: `${(billStats.unpaidBills / billStats.totalBills) * 100}%`,
                          minHeight: billStats.unpaidBills > 0 ? '20px' : '0'
                        }}
                      ></div>
                      <span className="text-sm font-medium text-slate-700 mt-2">Unpaid</span>
                      <span className="text-xs text-slate-500">{billStats.unpaidBills} users</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <p>No bills data available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="modern-card p-6 mt-8">
        <h4 className="font-semibold text-slate-900 mb-4">How it works:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <p className="font-medium text-slate-900">Enter Amount</p>
              <p className="text-sm text-slate-500">Set maintenance amount for the month</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <p className="font-medium text-slate-900">Send to All</p>
              <p className="text-sm text-slate-500">Bill and notification sent to all residents</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
            <div>
              <p className="font-medium text-slate-900">Track Payments</p>
              <p className="text-sm text-slate-500">View all bills and payment status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceManagement;
