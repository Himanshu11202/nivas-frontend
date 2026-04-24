import React, { useState, useEffect, useRef } from 'react';
import './DeliveryForm.css';

const DeliveryForm = ({ selectedType, onSubmit, loading }) => {
  const [flatNumber, setFlatNumber] = useState('');
  const [notes, setNotes] = useState('');
  const flatInputRef = useRef(null);

  // Auto-focus on flat input when component mounts or selectedType changes
  useEffect(() => {
    if (flatInputRef.current && selectedType) {
      flatInputRef.current.focus();
    }
  }, [selectedType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!flatNumber.trim()) {
      return;
    }
    onSubmit({
      deliveryType: selectedType,
      flatNumber: flatNumber.trim().toUpperCase(),
      notes: notes.trim()
    });
  };

  if (!selectedType) {
    return (
      <div className="delivery-form-placeholder">
        <div className="placeholder-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <p className="placeholder-text">Select a delivery app above to continue</p>
      </div>
    );
  }

  return (
    <div className="delivery-form-container">
      <div className="form-header">
        <div className="selected-type-badge">
          <span className="type-label">{selectedType}</span>
          <button
            type="button"
            className="change-type-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Change
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="delivery-form">
        <div className="form-group">
          <label htmlFor="flatNumber" className="form-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Flat Number *
          </label>
          <input
            ref={flatInputRef}
            type="text"
            id="flatNumber"
            className="form-input"
            placeholder="e.g., A-101, B-205"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          <span className="input-hint">Enter the flat number for delivery</span>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="form-textarea"
            placeholder="Any special instructions for the resident..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>

        <button
          type="submit"
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !flatNumber.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span>Send Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DeliveryForm;
