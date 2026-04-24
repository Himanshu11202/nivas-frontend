import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/marketplace/my-products?userId=${user.id}`, {
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

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/marketplace/products/${productId}?userId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Product deleted successfully');
      fetchMyProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/marketplace/products/${editingProduct.id}?userId=${user.id}`, editingProduct, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Product updated successfully');
      setEditingProduct(null);
      fetchMyProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
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
    return 'https://via.placeholder.com/100?text=No+Image';
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'NEW': { text: 'New', class: 'bg-green-100 text-green-700' },
      'LIKE_NEW': { text: 'Like New', class: 'bg-emerald-100 text-emerald-700' },
      'USED': { text: 'Used', class: 'bg-amber-100 text-amber-700' }
    };
    return badges[condition] || badges['USED'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner-modern"></div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate('/resident/marketplace')}
            className="text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-2"
          >
            ← Back to Marketplace
          </button>
          <h2 className="text-3xl font-bold text-slate-900">📦 My Listings</h2>
          <p className="text-slate-500 mt-1">Manage your items for sale</p>
        </div>
        <button
          onClick={() => navigate('/resident/marketplace/add')}
          className="btn-modern-primary flex items-center gap-2"
        >
          <span>➕</span> Add New Item
        </button>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            📦
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No listings yet</h3>
          <p className="text-slate-500 mb-4">Start selling items in your society</p>
          <button onClick={() => navigate('/resident/marketplace/add')} className="btn-modern-primary">
            ➕ Sell Your First Item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="modern-card p-4 flex gap-4 items-center">
              {/* Product Image */}
              <img
                src={getFirstImage(product.images)}
                alt={product.title}
                className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
              />

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getConditionBadge(product.condition).class}`}>
                    {getConditionBadge(product.condition).text}
                  </span>
                  <span className="text-xs text-slate-500">{product.category}</span>
                </div>
                <h3 className="font-bold text-slate-900 truncate">{product.title}</h3>
                <p className="text-lg font-semibold text-emerald-600">{formatPrice(product.price)}</p>
                <p className="text-sm text-slate-500 truncate">{product.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/resident/marketplace/product/${product.id}`)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-medium"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => setEditingProduct(product)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 text-sm font-medium"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 text-sm font-medium"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">✏️ Edit Listing</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="form-input-modern w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="form-input-modern w-full"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="form-input-modern w-full"
                >
                  {['Furniture', 'Electronics', 'Vehicles', 'Home Appliances', 'Books', 'Clothing', 'Sports', 'Others'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                <select
                  value={editingProduct.condition}
                  onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value })}
                  className="form-input-modern w-full"
                >
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="USED">Used</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="form-input-modern w-full h-24 resize-none"
                  rows="3"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-modern-primary flex-1">
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-modern-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
