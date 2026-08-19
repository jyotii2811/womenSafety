import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import api from '../api/axios';

// ✅ EMAILJS CONFIG — apni values daalo
const EMAILJS_SERVICE_ID  = 'service_aucagw7';
const EMAILJS_TEMPLATE_ID = 'template_f1ky07s';
const EMAILJS_PUBLIC_KEY  = 'bwU5fPO_Kx3nTCp-f';

const sendEmailToContact = (contact, user, lat, lng) => {
  const mapLink = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : 'Location not available';
  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email:  contact.email,
      to_name:   contact.name,
      from_name: user.name,
      from_email: user.email,
      phone:     user.phone || 'Not provided',
      location:  lat && lng ? `${lat}, ${lng}` : 'Not available',
      map_link:  mapLink,
      time:      new Date().toLocaleString(),
    },
    EMAILJS_PUBLIC_KEY
  );
};

const SOSPage = () => {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser]       = useState(null);
  const [contacts, setContacts] = useState([]);

  const fetchAlerts   = () => api.get('/sos/my').then(({ data }) => setAlerts(data.alerts));
  const fetchContacts = () => api.get('/contacts').then(({ data }) => setContacts(data.contacts));
  const fetchUser     = () => api.get('/auth/me').then(({ data }) => setUser(data.user));

  useEffect(() => {
    fetchAlerts();
    fetchContacts();
    fetchUser();
  }, []);

  const triggerSOS = () => {
    if (contacts.length === 0) {
      toast.error('⚠️ Pehle emergency contacts add karo!');
      return;
    }
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => doTrigger(coords.latitude, coords.longitude),
      ()           => doTrigger(null, null),
      { timeout: 8000 }
    );
  };

  const doTrigger = async (lat, lng) => {
    try {
      // 1. Save alert in DB
      await api.post('/sos/trigger', { lat, lng });

      // 2. Send email to every contact that has email
      const emailContacts = contacts.filter((c) => c.email);
      if (emailContacts.length === 0) {
        toast('⚠️ Contacts mein kisi ka email nahi hai — SMS/call manually karo', { icon: '⚠️' });
      } else {
        const results = await Promise.allSettled(
          emailContacts.map((c) => sendEmailToContact(c, user, lat, lng))
        );
        const sent   = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        if (sent > 0)   toast.success(`🚨 SOS sent! ${sent} contact(s) ko email gayi`);
        if (failed > 0) toast.error(`${failed} email(s) fail hui — EmailJS config check karo`);
      }

      fetchAlerts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'SOS trigger failed');
    } finally {
      setLoading(false);
    }
  };

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
      <h2>SOS Alert</h2>

      {contacts.length === 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px', marginBottom: '1rem', color: '#856404' }}>
          ⚠️ Koi emergency contact nahi hai! <a href="/contacts" style={{ color: '#856404', fontWeight: 700 }}>Abhi add karo →</a>
        </div>
      )}

      <div className="sos-trigger">
        <button className="sos-btn" onClick={triggerSOS} disabled={loading}>
          {loading ? 'Sending...' : '🚨 SOS'}
        </button>
        <p>Press to instantly alert all your emergency contacts</p>
      </div>

      <h3>Alert History</h3>
      {alerts.length === 0 ? <p>No alerts yet.</p> : (
        <div className="alert-list">
          {alerts.map((a) => (
            <div key={a._id} className={`alert-card status-${a.status}`}>
              <div>
                <span className={`badge ${a.status}`}>{a.status}</span>
                <p>{new Date(a.createdAt).toLocaleString()}</p>
                {a.location?.address && <p>📍 {a.location.address}</p>}
                {a.location?.lat && (
                  <p>
                    📍 <a href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lng}`} target="_blank" rel="noreferrer">
                      {a.location.lat.toFixed(4)}, {a.location.lng.toFixed(4)} — Maps ↗
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
