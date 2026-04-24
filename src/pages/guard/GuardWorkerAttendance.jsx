import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GuardWorkerAttendance.css';

const GuardWorkerAttendance = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [action, setAction] = useState(''); // 'checkin' or 'checkout'
  
  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchWorkersAndAttendance();
  }, []);

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const fetchWorkersAndAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [staffRes, attendanceRes] = await Promise.allSettled([
        axios.get('/api/guard/worker-management', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        axios.get('/api/guard/worker-management/attendance/today', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }).catch(() => ({ data: [] }))
      ]);
      
      if (staffRes.status === 'fulfilled') {
        const responseData = staffRes.value.data || {};
        const workersList = responseData.workers || [];
        const guardsList = responseData.guards || [];
        
        // Combine workers and guards with type indicator
        const allStaff = [
          ...workersList.map(w => ({ ...w, staffType: 'WORKER' })),
          ...guardsList.map(g => ({ ...g, staffType: 'GUARD', jobRole: 'Security Guard' }))
        ];
        
        setWorkers(allStaff);
      } else {
        console.error('Error fetching staff:', staffRes.reason);
        setWorkers([]);
      }
      
      if (attendanceRes.status === 'fulfilled') {
        setAttendance(attendanceRes.value.data || []);
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading staff. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getWorkerAttendance = (workerId) => {
    return attendance.find(a => a.worker?.id === workerId);
  };

  const startCamera = async (worker, actionType) => {
    setSelectedWorker(worker);
    setAction(actionType);
    setCapturedPhoto(null);
    
    try {
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
      setCapturedPhoto(photoData);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedWorker || !capturedPhoto) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/guard/worker-management/${selectedWorker.id}/checkin`, {
        workerPhoto: capturedPhoto
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert('Check-in successful!');
      stopCamera();
      setSelectedWorker(null);
      setCapturedPhoto(null);
      fetchWorkersAndAttendance();
    } catch (error) {
      console.error('Error marking check-in:', error);
      alert('Error marking check-in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    if (!selectedWorker) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`/api/guard/worker-management/${selectedWorker.id}/checkout`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert('Check-out successful!');
      stopCamera();
      setSelectedWorker(null);
      fetchWorkersAndAttendance();
    } catch (error) {
      console.error('Error marking check-out:', error);
      alert('Error marking check-out. Please try again.');
    }
  };

  const getStatusDisplay = (workerId) => {
    const att = getWorkerAttendance(workerId);
    if (!att) return { text: 'Not Marked', class: 'bg-slate-100 text-slate-600' };
    if (att.checkOutTime) return { text: 'Checked Out', class: 'bg-blue-100 text-blue-600' };
    if (att.checkInTime) return { text: 'Present', class: 'bg-emerald-100 text-emerald-600' };
    return { text: 'Not Marked', class: 'bg-slate-100 text-slate-600' };
  };

  const CameraModal = () => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
        <h3 className="text-xl font-bold mb-2">
          {action === 'checkin' ? 'Check In' : 'Check Out'}: {selectedWorker?.name}
        </h3>
        
        {!capturedPhoto ? (
          <>
            <div className="relative bg-black rounded-xl overflow-hidden mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={capturePhoto} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold">
                📸 Capture Photo
              </button>
              <button onClick={stopCamera} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <img src={capturedPhoto} alt="Captured" className="w-full h-64 object-cover rounded-xl" />
            </div>
            <div className="flex gap-4 justify-center">
              {action === 'checkin' ? (
                <button onClick={handleCheckIn} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold">
                  ✅ Confirm Check In
                </button>
              ) : (
                <button onClick={handleCheckOut} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold">
                  ✅ Confirm Check Out
                </button>
              )}
              <button onClick={() => setCapturedPhoto(null)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold">
                Retake
              </button>
              <button onClick={stopCamera} className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button className="text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-2" onClick={() => navigate('/guard/dashboard')}>
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900">Worker Attendance</h2>
        <p className="text-slate-500 mt-1">Mark daily attendance with check-in and check-out</p>
      </div>

      {/* Date Banner */}
      <div className="modern-card p-4 mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <p className="text-emerald-800 font-medium flex items-center gap-2">
          <span>📅</span>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Camera Modal */}
      {showCamera && <CameraModal />}

      {/* Workers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner-modern"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workers.map((worker, index) => {
            const status = getStatusDisplay(worker.id);
            const attendanceRecord = getWorkerAttendance(worker.id);
            
            return (
              <div key={worker.id} className="modern-card p-6 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                {/* Worker Photo */}
                <div className="flex justify-center mb-4">
                  {worker.workerPhoto ? (
                    <img src={worker.workerPhoto} alt={worker.name} className="w-24 h-24 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                      {worker.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-slate-900 text-lg">{worker.name}</h3>
                  <p className="text-slate-500">{worker.jobRole}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${worker.staffType === 'GUARD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {worker.staffType === 'GUARD' ? '👮 GUARD' : '👷 WORKER'}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                      {status.text}
                    </span>
                  </div>
                </div>

                {/* Time Display */}
                {attendanceRecord && (
                  <div className="text-center text-sm mb-4 space-y-1">
                    {attendanceRecord.checkInTime && (
                      <p className="text-emerald-600 font-medium">
                        🕐 In: {new Date(attendanceRecord.checkInTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    )}
                    {attendanceRecord.checkOutTime && (
                      <p className="text-blue-600 font-medium">
                        🕐 Out: {new Date(attendanceRecord.checkOutTime).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {!attendanceRecord?.checkInTime ? (
                    <button 
                      onClick={() => startCamera(worker, 'checkin')}
                      className="w-full py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                    >
                      📸 Check In
                    </button>
                  ) : !attendanceRecord?.checkOutTime ? (
                    <button 
                      onClick={() => startCamera(worker, 'checkout')}
                      className="w-full py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                      Check Out
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl text-center font-medium">
                      ✅ Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && workers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">👷</div>
          <h3 className="text-xl font-semibold text-slate-700">No workers found</h3>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default GuardWorkerAttendance;
