import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { FiAlertCircle, FiMail, FiMapPin, FiClock, FiRefreshCw, FiSend, FiCheckCircle, FiPhone } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';

const STATUS_COLOR = { active: '#ef4444', resolved: '#22c55e', cancelled: '#94a3b8' };
const STATUS_BG = { active: '#fef2f2', resolved: '#f0fdf4', cancelled: '#f8fafc' };

const AdminSOSCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(false);
  const [respondModal, setRespondModal] = useState(null); // alert object
  const [message, setMessage] = useState('');
  const [helpSent, setHelpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef(null);

  const fetchAlerts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/admin/alerts?status=${filter}&limit=100`);
      setAlerts(data.alerts);
    } catch {
      if (!silent) toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 15 seconds
    intervalRef.current = setInterval(() => fetchAlerts(true), 15000);
    return () => clearInterval(intervalRef.current);
  }, [filter]);

  const openRespond = (alert) => {
    setRespondModal(alert);
    setMessage('');
    setHelpSent(false);
  };

  const submitResponse = async () => {
    if (!message.trim()) return toast.error('Please enter a message');
    setSubmitting(true);
    try {
      await api.put(`/admin/alerts/${respondModal._id}/respond`, { message, helpSent });
      toast.success(helpSent ? '✅ Help marked as sent!' : '📩 Response recorded');
      setRespondModal(null);
      fetchAlerts();
    } catch {
      toast.error('Failed to respond');
    } finally {
      setSubmitting(false);
    }
  };

  const getMapLink = (location) => {
    if (!location?.lat) return null;
    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
  };

  const timeSince = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <AdminLayout>
    <div style={{ minHeight: '100%', background: '#0f172a', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7f1d1d, #991b1b)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#ef4444', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
            <FiAlertCircle size={22} color="white" />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>SOS Control Center</h1>
            <p style={{ color: '#fca5a5', fontSize: '0.8rem', margin: 0 }}>Live emergency alert monitoring</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 12px', color: '#fca5a5', fontSize: '0.8rem' }}>
            🔄 Auto-refresh: 15s
          </div>
          <button onClick={() => fetchAlerts()} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {['active', 'resolved', 'cancelled', ''].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: filter === s ? STATUS_COLOR[s] || '#6366f1' : '#1e293b', color: filter === s ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'active' && alerts.filter(a => a.status === 'active').length > 0 && filter !== 'active' && (
                <span style={{ marginLeft: 6, background: '#ef4444', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: '0.75rem' }}>
                  {alerts.filter(a => a.status === 'active').length}
                </span>
              )}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.85rem', alignSelf: 'center' }}>
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Alerts Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem' }}>Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '4rem' }}>
            <FiCheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No {filter} alerts</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
            {alerts.map((alert) => (
              <div key={alert._id} style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', border: `1px solid ${alert.status === 'active' ? '#ef444440' : '#334155'}`, boxShadow: alert.status === 'active' ? '0 0 20px rgba(239,68,68,0.15)' : 'none' }}>
                {/* Alert Header */}
                <div style={{ background: STATUS_COLOR[alert.status] + '20', borderBottom: `1px solid ${STATUS_COLOR[alert.status]}30`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {alert.status === 'active' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
                    <span style={{ color: STATUS_COLOR[alert.status], fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {alert.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: '0.78rem' }}>
                    <FiClock size={12} />
                    {timeSince(alert.createdAt)}
                  </div>
                </div>

                {/* User Info */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                      {alert.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{alert.user?.name || 'Unknown'}</p>
                      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.8rem' }}>ID: {alert._id.slice(-6)}</p>
                    </div>
                  </div>

                  {/* Gmail */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', borderRadius: 8, padding: '8px 12px', marginBottom: '8px' }}>
                    <FiMail size={14} color="#6366f1" />
                    <span style={{ color: '#e2e8f0', fontSize: '0.85rem', wordBreak: 'break-all' }}>{alert.user?.email || '—'}</span>
                  </div>

                  {/* Phone */}
                  {alert.user?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', borderRadius: 8, padding: '8px 12px', marginBottom: '8px' }}>
                      <FiPhone size={14} color="#22c55e" />
                      <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{alert.user.phone}</span>
                    </div>
                  )}

                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', borderRadius: 8, padding: '8px 12px', marginBottom: '12px' }}>
                    <FiMapPin size={14} color="#f59e0b" />
                    {getMapLink(alert.location) ? (
                      <a href={getMapLink(alert.location)} target="_blank" rel="noreferrer"
                        style={{ color: '#f59e0b', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                        📍 {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)} — Open in Maps ↗
                      </a>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Location not available</span>
                    )}
                  </div>

                  {/* Time */}
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '12px' }}>
                    🕐 Triggered: {new Date(alert.createdAt).toLocaleString()}
                  </div>

                  {/* Admin Response (if exists) */}
                  {alert.adminResponse?.message && (
                    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', marginBottom: '12px' }}>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 4px' }}>Admin Response:</p>
                      <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: 0 }}>{alert.adminResponse.message}</p>
                      {alert.adminResponse.helpSent && (
                        <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>✅ Help was sent</span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  {alert.status === 'active' && (
                    <button onClick={() => openRespond(alert)}
                      style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7f1d1d, #ef4444)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <FiSend size={14} /> Respond to Alert
                    </button>
                  )}
                  {alert.status !== 'active' && !alert.adminResponse?.message && (
                    <button onClick={() => openRespond(alert)}
                      style={{ width: '100%', padding: '8px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                      Add Note
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Respond Modal */}
      {respondModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480, border: '1px solid #334155' }}>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Respond to SOS Alert</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              From: <strong style={{ color: '#e2e8f0' }}>{respondModal.user?.name}</strong> ({respondModal.user?.email})
            </p>

            <label style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>Message to user *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
              placeholder="e.g. We have received your SOS. Help is on the way. Please stay calm."
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: 'white', fontSize: '0.9rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: '1rem', cursor: 'pointer', color: '#e2e8f0' }}>
              <input type="checkbox" checked={helpSent} onChange={(e) => setHelpSent(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#22c55e' }} />
              <span style={{ fontSize: '0.9rem' }}>✅ Mark as "Help Sent" (resolves the alert)</span>
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              <button onClick={submitResponse} disabled={submitting}
                style={{ flex: 1, padding: '12px', background: helpSent ? 'linear-gradient(135deg, #166534, #22c55e)' : 'linear-gradient(135deg, #1d4ed8, #6366f1)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                {submitting ? 'Sending...' : helpSent ? '✅ Send & Mark Help Sent' : '📩 Send Response'}
              </button>
              <button onClick={() => setRespondModal(null)}
                style={{ padding: '12px 20px', background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
    </AdminLayout>
  );
};

export default AdminSOSCenter;
