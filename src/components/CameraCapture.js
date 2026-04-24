import React, { useState, useRef, useCallback } from 'react';
import './CameraCapture.css';

const CameraCapture = ({ onCapture, onClose, title }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(result.state);
      return result.state;
    } catch (error) {
      console.log('Permission API not supported');
      return 'prompt';
    }
  };

  const startCamera = useCallback(async () => {
    try {
      // Check permission first
      const permission = await checkCameraPermission();
      if (permission === 'denied') {
        setCameraError('Camera permission denied. Please enable camera in browser settings.');
        setCameraStarted(false);
        return;
      }

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        setStream(null);
      }

      setIsCapturing(true);
      setCameraError('');

      // Request camera access with safe configuration
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: "user",
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setCameraError('');
      setCameraStarted(true);
      setCameraPermission('granted');
      setIsCapturing(false);
      
      // Set video source after a small delay to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera access error:', error);
      setIsCapturing(false);
      setCameraStarted(false);
      
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
        setCameraPermission('denied');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.');
      } else {
        setCameraError('Failed to access camera. Please check camera permissions and try again.');
      }
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
      setCameraStarted(false);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isCapturing) {
      setIsCapturing(true);
      
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            setCapturedImage(URL.createObjectURL(file));
            stopCamera();
          }
          setIsCapturing(false);
        }, 'image/jpeg', 0.8);
      } catch (error) {
        console.error('Error capturing photo:', error);
        setIsCapturing(false);
        setCameraError('Failed to capture photo. Please try again.');
      }
    }
  }, [isCapturing, stopCamera]);

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        })
        .catch(error => {
          console.error('Error processing captured image:', error);
          setCameraError('Failed to process photo. Please try again.');
        });
    }
  };

  // Auto-start camera when component mounts - only once
  React.useEffect(() => {
    const autoStart = async () => {
      try {
        await startCamera();
      } catch (error) {
        console.error('Auto-start failed:', error);
      }
    };
    autoStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [stopCamera, capturedImage]);

  return (
    <div className="camera-capture-overlay">
      <div className="camera-modal">
        <div className="camera-header">
          <h3>{title || 'Capture Photo'}</h3>
          <button onClick={onClose} className="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="camera-body">
          {cameraError ? (
            <div className="camera-error">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <p>{cameraError}</p>
              <div className="error-actions">
                <button onClick={startCamera} className="retry-btn">
                  Retry Camera Access
                </button>
                {cameraPermission === 'denied' && (
                  <button 
                    onClick={() => window.open('chrome://settings/content/camera', '_blank')}
                    className="settings-btn"
                  >
                    Open Camera Settings
                  </button>
                )}
              </div>
            </div>
          ) : capturedImage ? (
            <div className="captured-preview">
              <img src={capturedImage} alt="Captured" />
              <div className="capture-actions">
                <button onClick={retakePhoto} className="btn-secondary">
                  Retake
                </button>
                <button onClick={confirmCapture} className="btn-primary">
                  Use Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="camera-preview">
              {!cameraStarted ? (
                <div className="camera-start-screen">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <h4>Camera Ready</h4>
                  <p>Click start to begin camera preview</p>
                  <button 
                    onClick={startCamera} 
                    disabled={isCapturing}
                    className="start-camera-btn"
                  >
                    {isCapturing ? 'Starting Camera...' : 'Start Camera'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="video-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-video"
                    />
                    <canvas ref={canvasRef} className="hidden-canvas" />
                  </div>
                  <div className="camera-controls">
                    <button 
                      onClick={capturePhoto}
                      disabled={isCapturing}
                      className="capture-btn"
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    <button 
                      onClick={stopCamera}
                      className="stop-camera-btn"
                    >
                      Stop Camera
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
