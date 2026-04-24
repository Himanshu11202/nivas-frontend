import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './WorkerManagement.css';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    jobRole: 'CLEANER',
    status: 'ACTIVE',
    joiningDate: new Date().toISOString().split('T')[0],
    aadhaarNumber: ''
  });
  
  // Photo states
  const [workerPhoto, setWorkerPhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState('worker');
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
    }
  }, [showCamera, stream]);

  const fetchWorkers = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.get('/api/workers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWorkers(response.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      // Try alternative endpoint
      try {
        const altResponse = await axios.get('/api/admin/workers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setWorkers(altResponse.data || []);
      } catch (e) {
        setWorkers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async (mode) => {
    try {
      setCameraMode(mode);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      
      if (cameraMode === 'worker') {
        setWorkerPhoto(photoData);
      } else {
        setAadhaarPhoto(photoData);
      }
      stopCamera();
    }
  };

  const handleAadhaarFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!workerPhoto && !editingWorker) {
      alert('Worker photo is required. Please capture a photo.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const workerData = {
        ...formData,
        workerPhoto: workerPhoto || editingWorker?.workerPhoto,
        aadhaarPhoto: aadhaarPhoto || editingWorker?.aadhaarPhoto
      };

      if (editingWorker) {
        await axios.put(`/api/workers/${editingWorker.id}`, workerData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Worker updated successfully!');
      } else {
        const response = await axios.post('/api/workers', workerData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Worker created response:', response.data);
        alert('Worker created successfully!');
      }
      
      resetForm();
      fetchWorkers();
    } catch (error) {
      console.error('Error saving worker:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      alert('Error saving worker: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      jobRole: 'CLEANER',
      status: 'ACTIVE',
      joiningDate: new Date().toISOString().split('T')[0],
      aadhaarNumber: ''
    });
    setWorkerPhoto(null);
    setAadhaarPhoto(null);
    setEditingWorker(null);
    setShowForm(false);
  };

  const handleEdit = (worker) => {
    setFormData({
      name: worker.name,
      phoneNumber: worker.phoneNumber,
      jobRole: worker.jobRole,
      status: worker.status,
      joiningDate: worker.joiningDate,
      aadhaarNumber: worker.aadhaarNumber || ''
    });
    setWorkerPhoto(worker.workerPhoto);
    setAadhaarPhoto(worker.aadhaarPhoto);
    setEditingWorker(worker);
    setShowForm(true);
  };

  const handleDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await axios.delete(`/api/workers/${workerId}`);
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ACTIVE: 'bg-emerald-100 text-emerald-800',
      INACTIVE: 'bg-red-100 text-red-800',
      ON_LEAVE: 'bg-amber-100 text-amber-800'
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'W';
  };

  const CameraModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4">
          {cameraMode === 'worker' ? 'Capture Worker Photo' : 'Capture Aadhaar Photo'}
        </h3>
        <div className="relative bg-black rounded-xl overflow-hidden mb-4">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={capturePhoto} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600">
            Capture Photo
          </button>
          <button onClick={stopCamera} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Worker Management</h2>
          <p className="text-slate-500 mt-1">Manage society workers and their attendance</p>
        </div>
        <button className="btn-modern-primary" onClick={() => setShowForm(true)}>
          + Add Worker
        </button>
      </div>

      {showCamera && <CameraModal />}

      {showForm && (
        <div className="modern-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Worker Photo *</label>
                <div className="flex flex-col items-center">
                  {workerPhoto ? (
                    <div className="relative">
                      <img src={workerPhoto} alt="Worker" className="w-32 h-32 rounded-2xl object-cover" />
                      <button type="button" onClick={() => startCamera('worker')} className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-full">
                        📷
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => startCamera('worker')} className="w-32 h-32 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500">
                      <span className="text-3xl">📷</span>
                      <span className="text-xs">Take Photo</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Aadhaar Photo (Optional)</label>
                <div className="flex flex-col items-center">
                  {aadhaarPhoto ? (
                    <div className="relative">
                      <img src={aadhaarPhoto} alt="Aadhaar" className="w-32 h-32 rounded-2xl object-cover" />
                      <div className="absolute -bottom-2 -right-2 flex gap-1">
                        <button type="button" onClick={() => startCamera('aadhaar')} className="w-8 h-8 bg-blue-500 text-white rounded-full text-xs">📷</button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 bg-slate-500 text-white rounded-full text-xs">📁</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startCamera('aadhaar')} className="w-20 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
                        <span className="text-xl">📷</span>
                        <span className="text-xs">Camera</span>
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-slate-400">
                        <span className="text-xl">📁</span>
                        <span className="text-xs">Upload</span>
                      </button>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAadhaarFileUpload} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="form-input-modern w-full" required placeholder="Enter worker name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="form-input-modern w-full" required placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Role *</label>
                <select value={formData.jobRole} onChange={(e) => setFormData({...formData, jobRole: e.target.value})} className="form-input-modern w-full">
                  <option value="CLEANER">Cleaner</option>
                  <option value="ELECTRICIAN">Electrician</option>
                  <option value="PLUMBER">Plumber</option>
                  <option value="GARDENER">Gardener</option>
                  <option value="SECURITY_HELPER">Security Helper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="form-input-modern w-full">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                <input type="date" value={formData.joiningDate} onChange={(e) => setFormData({...formData, joiningDate: e.target.value})} className="form-input-modern w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
                <input type="text" value={formData.aadhaarNumber} onChange={(e) => setFormData({...formData, aadhaarNumber: e.target.value})} className="form-input-modern w-full" placeholder="Optional" maxLength={12} />
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn-modern-primary flex-1">
                {loading ? 'Saving...' : (editingWorker ? 'Update Worker' : 'Add Worker')}
              </button>
              <button type="button" onClick={resetForm} className="btn-modern-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-modern"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workers.map((worker, index) => (
            <div key={worker.id} className="modern-card p-6 hover:scale-[1.02] transition-all animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex justify-center mb-4">
                {worker.workerPhoto ? (
                  <img src={worker.workerPhoto} alt={worker.name} className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(worker.name)}
                  </div>
                )}
              </div>
              <div className="text-center mb-4">
                <h3 className="font-bold text-slate-900">{worker.name}</h3>
                <p className="text-slate-500 text-sm">{worker.jobRole}</p>
                <span className={getStatusBadge(worker.status)}>{worker.status}</span>
              </div>
              <p className="text-center text-sm text-slate-500 mb-4">{worker.phoneNumber}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(worker)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">Edit</button>
                <button onClick={() => handleDelete(worker.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && workers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">👷</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No workers found</h3>
          <button onClick={() => setShowForm(true)} className="btn-modern-primary">Add Worker</button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default WorkerManagement;
