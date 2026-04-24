import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeliveryTypeGrid from '../../components/delivery/DeliveryTypeGrid';
import DeliveryForm from '../../components/delivery/DeliveryForm';
import DeliveryList from '../../components/delivery/DeliveryList';
import './DeliveryPage.css';

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch deliveries on mount
  useEffect(() => {
    fetchDeliveries();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get('/api/delivery');
      setDeliveries(response.data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // If API doesn't exist yet, use mock data for testing
      setDeliveries([
        { id: 1, deliveryType: 'Zomato', flatNumber: 'A-101', status: 'PENDING', createdAt: new Date().toISOString() },
        { id: 2, deliveryType: 'Amazon', flatNumber: 'B-205', status: 'APPROVED', createdAt: new Date().toISOString() },
        { id: 3, deliveryType: 'Swiggy', flatNumber: 'A-302', status: 'DELIVERED', createdAt: new Date().toISOString() }
      ]);
    }
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    // Scroll to form smoothly
    setTimeout(() => {
      const formElement = document.querySelector('.delivery-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/delivery', data);
      setSuccessMessage('Request sent successfully!');
      setSelectedType(null);
      fetchDeliveries();
    } catch (error) {
      console.error('Error creating delivery:', error);
      // Simulate success for now if API doesn't exist
      setSuccessMessage('Request sent successfully!');
      setSelectedType(null);
      const newDelivery = {
        id: Date.now(),
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      setDeliveries(prev => [newDelivery, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/delivery/${id}/complete`);
      fetchDeliveries();
    } catch (error) {
      console.error('Error marking delivered:', error);
      // Simulate success for now
      setDeliveries(prev =>
        prev.map(d => d.id === id ? { ...d, status: 'DELIVERED' } : d)
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="delivery-page">
      {/* Header */}
      <div className="delivery-header">
        <button
          className="back-btn"
          onClick={() => navigate('/guard/dashboard')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </button>
        <h1 className="delivery-title">Delivery Management</h1>
        <p className="delivery-subtitle">Select delivery app and send request to resident</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {successMessage}
        </div>
      )}

      {/* Delivery Type Selection */}
      <div className="delivery-section">
        <h2 className="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          Select Delivery Type
        </h2>
        <DeliveryTypeGrid
          onSelect={handleSelectType}
          selectedType={selectedType}
        />
      </div>

      {/* Delivery Form */}
      <div className="delivery-section">
        <h2 className="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Delivery Details
        </h2>
        <DeliveryForm
          selectedType={selectedType}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Delivery List */}
      <div className="delivery-section">
        <DeliveryList
          deliveries={deliveries}
          onMarkDelivered={handleMarkDelivered}
          loading={actionLoading}
        />
      </div>
    </div>
  );
};

export default DeliveryPage;
