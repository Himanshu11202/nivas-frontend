import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/marketplace/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/marketplace/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(['All', ...(response.data || [])]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['All', 'Furniture', 'Electronics', 'Vehicles', 'Home Appliances', 'Books', 'Clothing', 'Sports', 'Others']);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getFirstImage = (images) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return 'https://via.placeholder.com/300x200?text=No+Image';
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">🏪 Marketplace</h2>
          <p className="text-slate-500 mt-1">Buy and sell items within your society</p>
        </div>
        <button
          onClick={() => navigate('/resident/marketplace/add')}
          className="btn-modern-primary flex items-center gap-2"
        >
          <span>➕</span> Sell Item
        </button>
      </div>

      {/* Filters Section */}
      <div className="modern-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input-modern w-full pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input-modern w-full"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="form-input-modern w-full"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="form-input-modern w-full"
            />
          </div>

          {/* My Listings Button */}
          <button
            onClick={() => navigate('/resident/marketplace/my-listings')}
            className="btn-modern-secondary"
          >
            📦 My Listings
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-slate-600">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-modern"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              onClick={() => navigate(`/resident/marketplace/product/${product.id}`)}
              className="modern-card overflow-hidden hover:scale-[1.02] transition-all cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Product Image */}
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src={getFirstImage(product.images)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {product.category}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    product.condition === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }}`}>
                    {product.condition}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{product.title}</h3>
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-emerald-600">{formatPrice(product.price)}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
                  <p>👤 {product.sellerName}</p>
                  <p>🏠 Flat: {product.sellerFlat}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            📦
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
          <p className="text-slate-500 mb-4">Try adjusting your filters or search query</p>
          <button onClick={() => navigate('/resident/marketplace/add')} className="btn-modern-primary">
            ➕ Sell Your First Item
          </button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
