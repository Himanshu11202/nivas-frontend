import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ResidentMaintenance = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

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

  const handleViewInvoice = (bill) => {
    setSelectedBill(bill);
    setShowInvoice(true);
  };

  const handleDownloadPDF = () => {
    if (!selectedBill) return;
    
    // Create invoice content
    const invoiceContent = `
      <html>
        <head>
          <title>Invoice - ${selectedBill.invoiceNumber || 'INV-' + selectedBill.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .society-name { font-size: 24px; font-weight: bold; color: #333; }
            .invoice-number { font-size: 14px; color: #666; margin-top: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
            .info-label { font-size: 12px; color: #666; margin-bottom: 5px; }
            .info-value { font-size: 16px; font-weight: bold; color: #333; }
            .amount { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; margin: 40px 0; }
            .status { text-align: center; padding: 10px; border-radius: 5px; font-weight: bold; margin-bottom: 40px; }
            .status.paid { background: #D1FAE5; color: #065F46; }
            .status.unpaid { background: #FEF3C7; color: #92400E; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="society-name">${selectedBill.societyName || 'Society'}</div>
            <div class="invoice-number">Invoice: ${selectedBill.invoiceNumber || 'INV-' + selectedBill.id}</div>
          </div>
          <div class="info-grid">
            <div>
              <div class="info-label">Resident Name</div>
              <div class="info-value">${selectedBill.residentName || user?.name || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">Flat Number</div>
              <div class="info-value">${selectedBill.flatNumber || user?.flatNumber || 'N/A'}</div>
            </div>
            <div>
              <div class="info-label">Month</div>
              <div class="info-value">${getMonthName(selectedBill.month)} ${selectedBill.year}</div>
            </div>
            <div>
              <div class="info-label">Due Date</div>
              <div class="info-value">${formatDate(selectedBill.dueDate)}</div>
            </div>
          </div>
          <div class="amount">₹${selectedBill.amount}</div>
          <div class="status ${selectedBill.status?.toLowerCase()}">${selectedBill.status}</div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([invoiceContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${selectedBill.invoiceNumber || selectedBill.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      {/* Invoice Modal */}
      {showInvoice && selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="modern-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Invoice</h3>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-8">
              {/* Invoice Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedBill.societyName || 'Society'}
                </h2>
                <p className="text-gray-600">Invoice: {selectedBill.invoiceNumber || 'INV-' + selectedBill.id}</p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Resident Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedBill.residentName || user?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Flat Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedBill.flatNumber || user?.flatNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Month</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getMonthName(selectedBill.month)} {selectedBill.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedBill.dueDate)}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center py-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl mb-8">
                <p className="text-sm text-gray-500 mb-2">Total Amount</p>
                <p className="text-5xl font-bold text-indigo-600">₹{selectedBill.amount}</p>
              </div>

              {/* Status */}
              <div className="text-center mb-8">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  selectedBill.status === 'PAID' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedBill.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 btn-modern-primary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="flex-1 btn-modern-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Invoice Details */}
              <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Invoice No</span>
                  <span className="font-medium text-slate-900">{bill.invoiceNumber || 'INV-' + bill.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Due Date</span>
                  <span className="font-medium text-slate-900">{formatDate(bill.dueDate)}</span>
                </div>
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

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewInvoice(bill)}
                  className="flex-1 btn-modern-secondary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Invoice
                </button>
                <button
                  onClick={() => handleMarkAsPaid(bill.id)}
                  className="flex-1 btn-modern-primary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Paid
                </button>
              </div>
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
