import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import api from '../api/axios';

import VoiceSOS from '../components/VoiceSOS';
import PanicSiren from '../components/PanicSiren';
import FakeCallModal from '../components/FakeCallModal';
import HelplineWidget from '../components/HelplineWidget';
import NearbyPoliceWidget from '../components/NearbyPoliceWidget';
import MediaCapture from '../components/MediaCapture';
import { performAutoEmergencyCapture } from '../utils/autoCameraCapture';

// EMAILJS CONFIG
const EMAILJS_SERVICE_ID  = 'service_aucagw7';
const EMAILJS_TEMPLATE_ID = 'template_f1ky07s';
const EMAILJS_PUBLIC_KEY  = 'bwU5fPO_Kx3nTCp-f';

const sendEmailToContact = (contact, user, lat, lng, photoUrl, videoUrl) => {
  const userName = user?.name || 'Emergency Sender';
  const userEmail = user?.email || 'Not provided';
  const userPhone = user?.phone || 'Not provided';
  const locationText = lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'GPS coordinates not available';
  const mapLink = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : 'Location link not available';
  const currentTime = new Date().toLocaleString();

  let mediaDetails = '';
  if (photoUrl) mediaDetails += `\n📸 Photo Snapshot Evidence: ${photoUrl}`;
  if (videoUrl) mediaDetails += `\n🎥 Emergency Video Clip: ${videoUrl}`;

  const formattedMessage = `🚨 URGENT SOS EMERGENCY ALERT!\n\nDear ${contact.name || 'Emergency Contact'},\n\n${userName} has triggered an EMERGENCY SOS DISTRESS SIGNAL and needs immediate help!\n\nSender Details:\n• Name: ${userName}\n• Email: ${userEmail}\n• Phone: ${userPhone}\n• Time: ${currentTime}\n\n📍 GPS Location: ${locationText}\n🗺️ Google Maps: ${mapLink}${mediaDetails}\n\nPlease try calling ${userName} immediately or contact emergency services (112 / 1091).`;

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      // Recipient Email Aliases for EmailJS Template Settings
      to_email:        contact.email,
      recipient_email: contact.email,
      email:           contact.email,
      to:              contact.email,
      send_to:         contact.email,
      contact_email:   contact.email,

      // Recipient Name Aliases
      to_name:         contact.name || 'Emergency Contact',
      contact_name:    contact.name || 'Emergency Contact',

      // Sender Info
      from_name:       userName,
      user_name:       userName,
      name:            userName,
      from_email:      userEmail,
      reply_to:        userEmail,
      phone:           userPhone,
      user_phone:      userPhone,
      location:        locationText,
      map_link:        mapLink,
      photo_url:       photoUrl || '',
      video_url:       videoUrl || '',
      time:            currentTime,
      timestamp:       currentTime,
      message:         formattedMessage,
      message_html:    formattedMessage.replace(/\n/g, '<br/>'),
    },
    EMAILJS_PUBLIC_KEY
  );
};

const SOSPage = () => {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser]       = useState(null);
  const [contacts, setContacts] = useState([]);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState({});

  const fetchAlerts   = () => api.get('/sos/my').then(({ data }) => setAlerts(data.alerts)).catch(() => {});
  const fetchContacts = () => api.get('/contacts').then(({ data }) => setContacts(data.contacts)).catch(() => {});
  const fetchUser     = () => api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {});

  useEffect(() => {
    fetchAlerts();
    fetchContacts();
    fetchUser();
  }, []);

  const doTrigger = useCallback(async (lat, lng) => {
    try {
      toast('🚨 Auto-capturing 2 snapshots & 4s video evidence...', { icon: '📸' });
      const media = await performAutoEmergencyCapture();

      const photoData1 = capturedMedia.photoData || media.photoData1;
      const photoData2 = media.photoData2;
      const videoData  = capturedMedia.videoData || media.videoData;

      // First upload media to backend to get downloadable URLs
      let photoUrl = null;
      let videoUrl = null;
      try {
        if (photoData1 || videoData) {
          const uploadRes = await api.post('/sos/upload-media', {
            photoData: photoData1,
            videoData,
          });
          photoUrl = uploadRes.data?.photoUrl;
          videoUrl = uploadRes.data?.videoUrl;
        }
      } catch (uploadErr) {
        console.warn('Media upload to server warning:', uploadErr);
      }

      await api.post('/sos/trigger', {
        lat,
        lng,
        photoData1,
        photoData2,
        videoData,
      });

      const emailContacts = contacts.filter((c) => c.email);
      if (emailContacts.length === 0) {
        toast('⚠️ No contact emails found — notify contacts directly!', { icon: '⚠️' });
      } else {
        const results = await Promise.allSettled(
          emailContacts.map((c) => sendEmailToContact(c, user, lat, lng, photoUrl, videoUrl))
        );
        const sent   = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        if (sent > 0)   toast.success(`🚨 SOS Alert & Media evidence sent to ${sent} contact(s)!`);
        if (failed > 0) toast.error(`${failed} email delivery failed.`);
      }

      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'SOS trigger failed');
    } finally {
      setLoading(false);
    }
  }, [contacts, user, capturedMedia]);

  const triggerSOS = useCallback(() => {
    if (contacts.length === 0) {
      toast.error('⚠️ Please add emergency contacts first!');
      return;
    }
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => doTrigger(coords.latitude, coords.longitude),
        ()           => doTrigger(null, null),
        { timeout: 8000 }
      );
    } else {
      doTrigger(null, null);
    }
  }, [contacts.length, doTrigger]);

  // Shake detection listener
  useEffect(() => {
    if (!shakeEnabled) return;

    let lastX = null, lastY = null, lastZ = null;
    const threshold = 18;

    const handleMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (x === null || y === null || z === null) return;

      if (lastX !== null) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);

        if (deltaX + deltaY + deltaZ > threshold) {
          toast.error('📱 Shake motion detected! Triggering SOS...');
          triggerSOS();
        }
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [shakeEnabled, triggerSOS]);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/sos/${id}/${action}`);
      toast.success(`Alert ${action}d`);
      fetchAlerts();
    } catch {
      toast.error('Failed to update alert');
    }
  };

  return (
    <div className="page">
      <h2>🚨 Emergency Safety Center</h2>

      {contacts.length === 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px', marginBottom: '1.5rem', color: '#856404' }}>
          ⚠️ You have no emergency contacts added! <a href="/contacts" style={{ color: '#856404', fontWeight: 700 }}>Add Emergency Contacts Now →</a>
        </div>
      )}

      {/* Main SOS Trigger Button */}
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #fff5f5, #ffffff)' }}>
        <div className="sos-trigger" style={{ padding: 0 }}>
          <button className="sos-btn" onClick={triggerSOS} disabled={loading}>
            {loading ? 'SENDING...' : '🚨 SOS'}
          </button>
          <h3 style={{ marginTop: '1.25rem', fontSize: '1.2rem', color: 'var(--text)' }}>
            One-Tap Emergency Panic Button
          </h3>
          <p style={{ marginTop: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Instantly sends your real-time GPS location & email emergency alerts to all trusted contacts.
          </p>

          <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="shakeToggle"
              checked={shakeEnabled}
              onChange={(e) => {
                setShakeEnabled(e.target.checked);
                if (e.target.checked) toast.success('📱 Shake-to-SOS detection enabled!');
              }}
              style={{ width: 'auto', cursor: 'pointer' }}
            />
            <label htmlFor="shakeToggle" style={{ cursor: 'pointer', margin: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--text)' }}>
              Enable Shake-to-SOS (Device motion sensor trigger)
            </label>
          </div>
        </div>
      </div>

      {/* Nearest Police Station & Safe Havens */}
      <NearbyPoliceWidget />

      {/* Live Photo & Short Video Emergency Capture */}
      <MediaCapture onCaptureMedia={(media) => setCapturedMedia((prev) => ({ ...prev, ...media }))} />

      {(capturedMedia.photoData || capturedMedia.videoData) && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '10px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📸 Live Media Captured & Ready: Next SOS trigger will automatically attach photo snapshot & video clip to contact emails!
        </div>
      )}

      {/* Interactive Emergency Tools Suite */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 700 }}>
        🛡️ Emergency Tools Suite
      </h3>
      <div className="emergency-tools-grid">
        <VoiceSOS onTriggerSOS={triggerSOS} />
        <PanicSiren />
        <FakeCallModal />
      </div>

      {/* 24/7 National Helplines */}
      <HelplineWidget />

      {/* Alert History */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 700 }}>
        📋 Alert History & Status
      </h3>
      {alerts.length === 0 ? (
        <div className="card empty-state">
          <p>No emergency alerts triggered yet.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((a) => (
            <div key={a._id} className={`alert-card status-${a.status}`}>
              <div>
                <span className={`badge ${a.status}`}>{a.status}</span>
                <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {new Date(a.createdAt).toLocaleString()}
                </p>
                {a.location?.address && <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>📍 {a.location.address}</p>}
                {a.location?.lat && (
                  <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                    🗺️ <a href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lng}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {a.location.lat.toFixed(4)}, {a.location.lng.toFixed(4)} — Open in Google Maps ↗
                    </a>
                  </p>
                )}
              </div>
              {a.status === 'active' && (
                <div className="alert-actions">
                  <button className="btn btn-sm btn-success" onClick={() => updateStatus(a._id, 'resolve')}>Resolve</button>
                  <button className="btn btn-sm btn-outline" onClick={() => updateStatus(a._id, 'cancel')}>Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SOSPage;
