import { useState, useEffect, useRef } from 'react';
import { FaPhone, FaPhoneSlash, FaUser, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FakeCallModal = () => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [incomingCallActive, setIncomingCallActive] = useState(false);
  const [callAnswered, setCallAnswered] = useState(false);
  const [callerName, setCallerName] = useState('Mom');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [countdown, setCountdown] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const audioRef = useRef(null);
  const durationIntervalRef = useRef(null);

  const scheduleCall = () => {
    setShowConfigModal(false);
    toast.success(`📞 Fake Call scheduled in ${delaySeconds} seconds.`);
    setCountdown(delaySeconds);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
      setIncomingCallActive(true);
      // Play ringing sound via web audio synth tone sweep
      playRingtone();
    }
  }, [countdown]);

  const playRingtone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try { osc.stop(); ctx.close(); } catch {}
      }, 3000);
    } catch {}
  };

  const acceptCall = () => {
    setCallAnswered(true);
    setCallDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    setIncomingCallActive(false);
    setCallAnswered(false);
    setCallDuration(0);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="tool-card">
        <div>
          <div className="tool-card-header">
            <div className="mic-pulse-ring" style={{ background: '#e0e7ff', color: '#6366f1' }}>
              <FaPhone size={20} />
            </div>
            <div>
              <h3>Discreet Fake Call</h3>
              <span className="badge user">Escape Tool</span>
            </div>
          </div>
          <p>
            Simulate a realistic incoming phone call to excuse yourself from suspicious or uncomfortable surroundings discreetly.
          </p>
          {countdown !== null && (
            <div style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
              ⏳ Incoming call ringing in {countdown}s...
            </div>
          )}
        </div>

        <button className="btn btn-outline" onClick={() => setShowConfigModal(true)} style={{ width: '100%' }}>
          <FaClock /> Schedule Fake Call
        </button>
      </div>

      {/* Config Setup Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>📞 Setup Fake Incoming Call</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Caller ID / Name</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="e.g. Mom, Boss, Police"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label>Ringing Delay</label>
              <select value={delaySeconds} onChange={(e) => setDelaySeconds(Number(e.target.value))}>
                <option value={0}>Instant (Now)</option>
                <option value={5}>In 5 Seconds</option>
                <option value={10}>In 10 Seconds</option>
                <option value={30}>In 30 Seconds</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowConfigModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={scheduleCall}>Set Timer</button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Screen */}
      {incomingCallActive && (
        <div className="modal-overlay">
          <div className="phone-modal-body">
            <div>
              <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 }}>
                {callAnswered ? 'Call in progress' : 'Incoming Call...'}
              </p>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem' }}>{callerName}</h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Mobile +1 (555) 019-2831</p>

              <div className="fake-caller-avatar">
                <FaUser />
              </div>

              {callAnswered && (
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1rem', color: '#4ade80' }}>
                  {formatTime(callDuration)}
                </div>
              )}
            </div>

            <div className="phone-actions">
              {!callAnswered ? (
                <>
                  <button className="call-btn-circle call-btn-decline" onClick={endCall} title="Decline">
                    <FaPhoneSlash />
                  </button>
                  <button className="call-btn-circle call-btn-accept" onClick={acceptCall} title="Accept">
                    <FaPhone />
                  </button>
                </>
              ) : (
                <button className="call-btn-circle call-btn-decline" onClick={endCall} style={{ width: 76, height: 76 }} title="End Call">
                  <FaPhoneSlash size={28} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FakeCallModal;
