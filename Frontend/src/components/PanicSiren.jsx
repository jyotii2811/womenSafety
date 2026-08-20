import { useState, useRef, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PanicSiren = () => {
  const [isActive, setIsActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  const startSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Frequency siren sweep
      let high = false;
      intervalRef.current = setInterval(() => {
        if (oscillatorRef.current && audioCtxRef.current) {
          const freq = high ? 700 : 1200;
          oscillatorRef.current.frequency.exponentialRampToValueAtTime(
            freq,
            audioCtxRef.current.currentTime + 0.25
          );
          high = !high;
        }
      }, 300);

      setIsActive(true);
      toast.error('🚨 High-Decibel Panic Siren Triggered!', { duration: 5000 });
    } catch (err) {
      console.error('Audio synthesizer error:', err);
      toast.error('Could not initialize audio siren.');
    }
  };

  const stopSiren = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch {}
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
    }
    setIsActive(false);
    toast('Panic Siren stopped.', { icon: '🔕' });
  };

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  return (
    <>
      <div className={`tool-card ${isActive ? 'voice-sos-active' : ''}`}>
        <div>
          <div className="tool-card-header">
            <div className="mic-pulse-ring" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {isActive ? <FaVolumeUp size={22} /> : <FaVolumeMute size={22} />}
            </div>
            <div>
              <h3>Panic Siren Sound & Strobe</h3>
              <span className={`badge ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? 'ALARM RINGING' : 'Standby'}
              </span>
            </div>
          </div>
          <p>
            Emits a high-volume oscillating emergency siren and flashing strobe to deter threats and draw immediate public attention.
          </p>
        </div>

        <button
          className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
          onClick={isActive ? stopSiren : startSiren}
          style={{ width: '100%', background: isActive ? '#dc2626' : undefined }}
        >
          {isActive ? <FaVolumeMute /> : <FaVolumeUp />} {isActive ? 'Stop Panic Siren' : 'Sound Panic Siren'}
        </button>
      </div>

      {/* Strobe Screen Overlay when Active */}
      {isActive && (
        <div className="strobe-overlay" onClick={stopSiren}>
          <FaExclamationTriangle size={72} style={{ marginBottom: '1.5rem', animation: 'bounce 0.5s infinite' }} />
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase' }}>🚨 EMERGENCY SIREN ACTIVE 🚨</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: 0.9 }}>Click anywhere on screen to stop sound</p>
          <button className="btn btn-outline" style={{ marginTop: '2rem', borderColor: 'white', color: 'white' }}>
            Silence Siren
          </button>
        </div>
      )}
    </>
  );
};

export default PanicSiren;
