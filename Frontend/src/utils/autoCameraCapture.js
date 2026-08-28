/**
 * Automatic Hands-Free Emergency Media Capture Utility
 * Captures 2 photo snapshots and a 4-second emergency video clip without requiring manual user button clicks.
 */

export const performAutoEmergencyCapture = async (onStatusUpdate) => {
  return new Promise(async (resolve) => {
    let mediaStream = null;
    let photoData1 = null;
    let photoData2 = null;
    let videoData = null;

    try {
      if (onStatusUpdate) onStatusUpdate('📷 Accessing camera for automatic emergency capture...');
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
    } catch (err) {
      console.warn('Auto camera capture unavailable:', err);
      if (onStatusUpdate) onStatusUpdate('⚠️ Camera access unavailable — proceeding with location SOS.');
      return resolve({ photoData1: null, photoData2: null, videoData: null });
    }

    // Create offscreen video element
    const videoEl = document.createElement('video');
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.srcObject = mediaStream;
    await videoEl.play().catch(() => {});

    // Helper to capture a canvas photo snapshot
    const captureFrame = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth || 640;
        canvas.height = videoEl.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      } catch {
        return null;
      }
    };

    // 1. Take Snapshot 1 (Immediate)
    photoData1 = captureFrame();

    // 2. Take Snapshot 2 after 1.5s
    setTimeout(() => {
      photoData2 = captureFrame();
    }, 1500);

    // 3. Record 4-second video clip using MediaRecorder
    try {
      if (onStatusUpdate) onStatusUpdate('🔴 Auto-recording 4s emergency video clip...');
      const chunks = [];
      const mediaRecorder = new MediaRecorder(mediaStream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          videoData = reader.result;

          // Stop camera tracks
          mediaStream.getTracks().forEach((track) => track.stop());

          if (onStatusUpdate) onStatusUpdate('✅ Media captured! Dispatching emergency SOS email...');
          resolve({ photoData1, photoData2, videoData });
        };
      };

      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, 4000); // 4-second recording
    } catch (recErr) {
      console.warn('Video recording error:', recErr);
      mediaStream.getTracks().forEach((track) => track.stop());
      resolve({ photoData1, photoData2, videoData: null });
    }
  });
};
