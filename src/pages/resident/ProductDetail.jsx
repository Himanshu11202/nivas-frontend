import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const chatEndRef = useRef(null);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/marketplace/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Product not found');
      navigate('/resident/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Chat functions
  const openChat = async () => {
    setShowChat(true);
    await fetchMessages();
  };

  const fetchMessages = async () => {
    if (!product?.seller?.id || !user?.id) return;
    
    try {
      setChatLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/messages/${id}?userId1=${user.id}&userId2=${product.seller.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', {
        senderId: user.id,
        receiverId: product.seller.id,
        productId: parseInt(id),
        message: newMessage.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNewMessage('');
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
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

  if (!product) return null;

  const isOwnProduct = product.seller?.id === user?.id;
  const images = product.images || [];

  return (
    <div className="p-6 animate-fade-in max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/resident/marketplace')}
        className="text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-2"
      >
        ← Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div>
          {/* Main Image */}
          <div className="modern-card p-4 mb-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <span className="text-6xl">📦</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-emerald-500' : 'border-slate-200'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`View ${index + 1}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div>
          {/* Category & Condition */}
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {product.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionBadge(product.condition).class}`}>
              {getConditionBadge(product.condition).text}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.title}</h1>

          {/* Price */}
          <div className="text-4xl font-bold text-emerald-600 mb-6">
            {formatPrice(product.price)}
          </div>

          {/* Description */}
          <div className="modern-card p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
            <p className="text-slate-600 leading-relaxed">
              {product.description || 'No description provided'}
            </p>
          </div>

          {/* Seller Info */}
          <div className="modern-card p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Seller Information</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {product.seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{product.seller?.name}</p>
                <p className="text-slate-500">🏠 Flat {product.seller?.flatNumber}</p>
              </div>
            </div>

            {/* Contact Button */}
            {!isOwnProduct && (
              <div className="mt-4 space-y-3">
                {!showContact ? (
                  <button
                    onClick={() => setShowContact(true)}
                    className="btn-modern-primary w-full"
                  >
                    📞 Contact Seller (Phone Number)
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-emerald-800 font-semibold mb-1">📞 Phone Number</p>
                    <p className="text-2xl font-bold text-emerald-700">{product.seller?.phoneNumber || 'Not available'}</p>
                    <p className="text-sm text-emerald-600 mt-2">Mention you found this on Society Marketplace</p>
                  </div>
                )}

                {/* Chat Button */}
                <button
                  onClick={openChat}
                  className="btn-modern-secondary w-full flex items-center justify-center gap-2"
                >
                  💬 Chat with Seller
                </button>
              </div>
            )}

            {/* Own Product Badge */}
            {isOwnProduct && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-700 font-semibold">📦 This is your listing</p>
                <button
                  onClick={() => navigate('/resident/marketplace/my-listings')}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-1 underline"
                >
                  Manage in My Listings
                </button>
              </div>
            )}
          </div>

          {/* Posted Date */}
          <p className="text-slate-400 text-sm">
            📅 Posted on {formatDate(product.createdAt)}
          </p>
        </div>
      </div>

      {/* Chat Section */}
      {showChat && (
        <div className="mt-8 modern-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              💬 Chat with {product.seller?.name}
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕ Close
            </button>
          </div>

          {/* Messages List */}
          <div className="bg-slate-50 rounded-xl p-4 h-64 overflow-y-auto mb-4">
            {chatLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="spinner-modern"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMyMessage = msg.sender?.id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMyMessage
                            ? 'bg-emerald-500 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">
                          {isMyMessage ? 'You' : msg.sender?.name}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMyMessage ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="form-input-modern flex-1"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-modern-primary px-6"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
