import { useState, useRef, useEffect } from 'react';
import { FaCamera, FaVideo, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MediaCapture = ({ onCaptureMedia }) => {
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast.success('📷 Camera & Mic active for emergency capture!');
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      toast.error('Unable to access camera/mic. Check browser permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture instant photo snapshot
  const takeSnapshot = () => {
    if (!videoRef.current || !stream) {
      toast.error('Please activate camera first!');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(dataUrl);
    toast.success('📸 Photo snapshot captured!');
    if (onCaptureMedia) {
      onCaptureMedia({ photoData: dataUrl, videoData: videoUrl });
    }
  };

  // Record 4-second video clip
  const recordVideoClip = () => {
    if (!stream) {
      toast.error('Please activate camera first!');
      return;
    }
    chunksRef.current = [];
    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const localUrl = URL.createObjectURL(blob);
        setVideoUrl(localUrl);
        setIsRecording(false);
        toast.success('🎥 4-second emergency video clip recorded!');

        // Convert video blob to base64 and pass to parent
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (onCaptureMedia) {
            onCaptureMedia({ photoData: photo, videoData: reader.result });
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(4);

      let countdown = 4;
      const interval = setInterval(() => {
        countdown -= 1;
        setRecordingSeconds(countdown);
        if (countdown <= 0) {
          clearInterval(interval);
          if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        }
      }, 1000);
    } catch (err) {
      toast.error('Video recording failed: ' + err.message);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCamera style={{ color: 'var(--primary)' }} /> Live Emergency Photo & Video Capture
        </h3>
        {!stream ? (
          <button className="btn btn-sm btn-primary" onClick={startCamera}>
            Enable Camera & Mic
          </button>
        ) : (
          <button className="btn btn-sm btn-outline" onClick={stopCamera}>
            Turn Off Camera
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
        Capture live photographic evidence or record a 4-second emergency video clip.
      </p>

      {/* Video Viewport / Camera Stream */}
      {stream && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto 1rem auto', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 'auto', display: 'block' }} />
          {isRecording && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(220, 38, 38, 0.9)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔴 RECORDING ({recordingSeconds}s)
            </div>
          )}
        </div>
      )}

      {/* Capture Action Controls */}
      {stream && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={takeSnapshot} disabled={isRecording}>
            <FaCamera /> Take Photo Snapshot
          </button>
          <button className="btn btn-danger" onClick={recordVideoClip} disabled={isRecording}>
            <FaVideo /> {isRecording ? `Recording (${recordingSeconds}s)...` : 'Record 4s Video Clip'}
          </button>
        </div>
      )}

      {/* Media Previews */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {photo && (
          <div style={{ flex: 1, minWidth: '240px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>📸 Photo Snapshot Evidence</h4>
            <img src={photo} alt="Emergency snapshot" style={{ width: '100%', borderRadius: '6px', marginBottom: '10px' }} />
            <a href={photo} download="emergency_snapshot.jpg" className="btn btn-sm btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <FaDownload /> Download Snapshot
            </a>
          </div>
        )}

        {videoUrl && (
          <div style={{ flex: 1, minWidth: '240px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>🎥 Emergency Video Evidence (4s)</h4>
            <video src={videoUrl} controls style={{ width: '100%', borderRadius: '6px', marginBottom: '10px' }} />
            <a href={videoUrl} download="emergency_video.webm" className="btn btn-sm btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <FaDownload /> Download Video Clip
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCapture;
