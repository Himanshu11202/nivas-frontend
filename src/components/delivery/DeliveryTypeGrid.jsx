import React, { useState } from 'react';
import './DeliveryTypeGrid.css';

const deliveryApps = [
  // Popular - Top Row
  { id: 'zomato', name: 'Zomato', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Zomato_logo.png/600px-Zomato_logo.png', popular: true },
  { id: 'swiggy', name: 'Swiggy', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Swiggy_logo.svg', popular: true },
  { id: 'amazon', name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', popular: true },
  { id: 'flipkart', name: 'Flipkart', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Flipkart_logo.svg', popular: true },
  // Other Apps
  { id: 'meesho', name: 'Meesho', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Meesho_Logo_Full.png', popular: false },
  { id: 'blinkit', name: 'Blinkit', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Blinkit_logo.svg', popular: false },
  { id: 'zepto', name: 'Zepto', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Zepto_logo.svg', popular: false },
  { id: 'bigbasket', name: 'BigBasket', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/BigBasket_logo.png', popular: false },
  { id: 'dunzo', name: 'Dunzo', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Dunzo_Logo.svg', popular: false },
  { id: 'dominos', name: "Domino's", logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Domino%27s_pizza_logo.svg', popular: false },
  { id: 'pizzahut', name: 'Pizza Hut', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Pizza_Hut_logo.svg', popular: false },
  { id: 'mcdonalds', name: "McDonald's", logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg', popular: false },
  { id: 'uber', name: 'Uber Eats', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png', popular: false },
  { id: 'other', name: 'Other', logo: null, popular: false }
];

const DeliveryTypeGrid = ({ onSelect, selectedType }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Separate popular and other apps
  const popularApps = deliveryApps.filter(app => app.popular);
  const otherApps = deliveryApps.filter(app => !app.popular);

  // Filter based on search
  const filterApps = (apps) => {
    if (!searchTerm) return apps;
    return apps.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPopular = filterApps(popularApps);
  const filteredOther = filterApps(otherApps);
  const hasResults = filteredPopular.length > 0 || filteredOther.length > 0;

  const renderAppCard = (app) => (
    <div
      key={app.id}
      className={`delivery-app-card ${selectedType === app.name ? 'selected' : ''}`}
      onClick={() => onSelect(app.name)}
    >
      <div className="app-logo-container">
        {app.logo ? (
          <img
            src={app.logo}
            alt={app.name}
            className="app-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="app-logo-fallback" style={{ display: app.logo ? 'none' : 'flex' }}>
          {app.name.charAt(0)}
        </div>
      </div>
      <span className="app-name">{app.name}</span>
      {app.popular && <span className="popular-badge">Popular</span>}
    </div>
  );

  return (
    <div className="delivery-type-grid">
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search delivery apps..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Popular Apps Section */}
      {!searchTerm && filteredPopular.length > 0 && (
        <div className="apps-section">
          <h3 className="section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Popular Apps
          </h3>
          <div className="apps-grid popular-apps">
            {filteredPopular.map(renderAppCard)}
          </div>
        </div>
      )}

      {/* Other Apps Section */}
      {filteredOther.length > 0 && (
        <div className="apps-section">
          {searchTerm ? (
            <h3 className="section-label">Search Results</h3>
          ) : (
            <h3 className="section-label">Other Apps</h3>
          )}
          <div className="apps-grid other-apps">
            {filteredOther.map(renderAppCard)}
          </div>
        </div>
      )}

      {/* No Results */}
      {!hasResults && searchTerm && (
        <div className="no-results">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
            <line x1="8" y1="8" x2="14" y2="14"></line>
            <line x1="14" y1="8" x2="8" y2="14"></line>
          </svg>
          <p>No delivery apps found</p>
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryTypeGrid;
