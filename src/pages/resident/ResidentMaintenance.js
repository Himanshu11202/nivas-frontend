import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ResidentMaintenance = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchUnpaidBills();
    }
  }, [user]);

  const fetchUnpaidBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/bills/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Filter only unpaid bills
      const unpaidBills = (response.data || []).filter(bill => bill.status === 'UNPAID');
      setBills(unpaidBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    } finally {
      setLoading(false);
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
        fetchUnpaidBills();
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

  // Generate dummy QR code for payment
  const generateQRCode = (amount, billId) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=society@upi&pn=Society&am=${amount}&cu=INR&tn=Maintenance_${billId}`;
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Maintenance Payment</h2>
        <p className="text-slate-500">Pay your monthly maintenance bills</p>
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

      {/* Unpaid Bills */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-modern"></div>
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
          <p className="text-slate-500">No pending maintenance bills. You're all paid up!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bills.map((bill) => (
            <div key={bill.id} className="modern-card p-6">
              {/* Bill Info */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    {getMonthName(bill.month)} {bill.year}
                  </h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    UNPAID
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{bill.description}</p>
                <div className="text-3xl font-bold text-slate-900">₹{bill.amount}</div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                  <img 
                    src={generateQRCode(bill.amount, bill.id)} 
                    alt="Payment QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-slate-500 text-center">
                  Scan QR code with any UPI app to pay
                </p>
              </div>

              {/* Mark as Paid Button */}
              <button
                onClick={() => handleMarkAsPaid(bill.id)}
                className="btn-modern-primary w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Paid
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {bills.length > 0 && (
        <div className="modern-card p-6 mt-8">
          <h4 className="font-semibold text-slate-900 mb-4">How to pay:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="font-medium text-slate-900">Scan QR Code</p>
                <p className="text-sm text-slate-500">Use any UPI app to scan</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <p className="font-medium text-slate-900">Pay Online</p>
                <p className="text-sm text-slate-500">Complete payment in app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium text-slate-900">Mark as Paid</p>
                <p className="text-sm text-slate-500">Click button after payment</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentMaintenance;
