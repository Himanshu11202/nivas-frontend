import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Furniture',
    condition: 'USED'
  });
  const [images, setImages] = useState(['']);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['Furniture', 'Electronics', 'Vehicles', 'Home Appliances', 'Books', 'Clothing', 'Sports', 'Others'];
  const conditions = [
    { value: 'NEW', label: 'New (Unused)' },
    { value: 'LIKE_NEW', label: 'Like New (Barely Used)' },
    { value: 'USED', label: 'Used (Good Condition)' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(newFiles);

    // Convert files to preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImages(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImages(newImages.length === 0 ? [''] : newImages);
    setImageFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    // Use uploaded files if available, otherwise use URLs
    let finalImages = images;
    if (imageFiles.length > 0) {
      // Convert files to base64 for upload
      const base64Images = await Promise.all(
        imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        })
      );
      finalImages = base64Images;
    } else {
      // Validate URLs
      const validImages = images.filter(img => {
        try {
          new URL(img);
          return true;
        } catch {
          return false;
        }
      });
      if (validImages.length === 0) {
        alert('Please add at least one image (file or URL)');
        return;
      }
      finalImages = validImages;
    }

    if (finalImages.length === 0) {
      alert('Please add at least one image');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        images: finalImages
      };

      await axios.post(`/api/marketplace/products?userId=${user.id}`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Product listed successfully!');
      navigate('/resident/marketplace');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error listing product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/resident/marketplace')}
          className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-2"
        >
          ← Back to Marketplace
        </button>
        <h2 className="text-3xl font-bold text-slate-900">➕ Sell Item</h2>
        <p className="text-slate-500 mt-1">List your item for sale in the society marketplace</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="modern-card p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Study Table, Sony TV, etc."
              className="form-input-modern w-full"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input-modern w-full"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Condition *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="form-input-modern w-full"
              required
            >
              {conditions.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              className="form-input-modern w-full"
              min="1"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item - condition, age, features, etc."
              className="form-input-modern w-full h-32 resize-none"
              rows="4"
            />
          </div>

          {/* Images - File Upload or URLs */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Images * (Upload from gallery or add URLs)
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Upload photos directly from your device or paste image URLs
            </p>

            {/* File Upload Button */}
            {imageFiles.length < 5 && (
              <div className="mb-4">
                <label className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-emerald-600 font-medium">📱 Upload from Gallery</span>
                  <span className="text-slate-400 text-sm">({5 - imageFiles.length} remaining)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-slate-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Image URL Inputs */}
            {imageFiles.length === 0 && (
              <div className="space-y-2">
                {images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => {
                        const newImages = [...images];
                        newImages[index] = e.target.value;
                        setImages(newImages);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="form-input-modern flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image URL Button */}
            {imageFiles.length === 0 && images.length < 5 && (
              <button
                type="button"
                onClick={() => setImages([...images, ''])}
                className="mt-3 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span className="text-slate-600">Add Image URL</span>
                <span className="text-slate-400 text-sm">({5 - images.length} remaining)</span>
              </button>
            )}

            {/* Preview */}
            {images.filter(img => img.trim()).length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
                {images.filter(img => img.trim()).map((img, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200">
                    <img 
                      src={img} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=Invalid';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="btn-modern-primary flex-1"
          >
            {loading ? '⏳ Listing...' : '✅ List Item for Sale'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/resident/marketplace')}
            className="btn-modern-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
