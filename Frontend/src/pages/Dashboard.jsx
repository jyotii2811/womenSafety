import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FiAlertCircle, FiUsers, FiMapPin, FiShield, FiPhoneCall, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { FaShieldAlt, FaPhoneAlt, FaUserShield, FaVolumeUp } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ alerts: 0, contacts: 0, active: 0 });
  const [contactsList, setContactsList] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/sos/my').catch(() => ({ data: { alerts: [] } })),
      api.get('/contacts').catch(() => ({ data: { contacts: [] } })),
    ]).then(([alertsRes, contactsRes]) => {
      const alerts = alertsRes.data?.alerts || [];
      const contacts = contactsRes.data?.contacts || [];
      setContactsList(contacts);
      setStats({
        alerts: alerts.length,
        contacts: contacts.length,
        active: alerts.filter((a) => a.status === 'active').length,
      });
    });
  }, []);

  const safetyScore = Math.min(
    100,
    (stats.contacts > 0 ? 50 : 0) + (stats.contacts >= 3 ? 30 : stats.contacts * 10) + 20
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.2rem' }}>Welcome back, {user?.name || 'User'} 👋</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Personal Safety Command & Response Control Dashboard
          </p>
        </div>
        <Link to="/sos" className="btn btn-danger" style={{ fontSize: '1rem', padding: '12px 24px', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}>
          🚨 EMERGENCY SOS HUB
        </Link>
      </div>

      {/* Safety Status Cards */}
      <div className="stats-grid">
        <div className={`stat-card ${stats.active > 0 ? 'active' : ''}`}>
          <FiAlertCircle size={32} />
          <div>
            <h3>{stats.active}</h3>
            <p>Active SOS Alerts</p>
          </div>
        </div>

        <div className="stat-card success">
          <FiUsers size={32} />
          <div>
            <h3>{stats.contacts}</h3>
            <p>Trusted Contacts</p>
          </div>
        </div>

        <div className="stat-card info">
          <FiShield size={32} />
          <div>
            <h3>{safetyScore}%</h3>
            <p>Safety Preparedness</p>
          </div>
        </div>

        <div className="stat-card">
          <FiMapPin size={32} />
          <div>
            <h3>{stats.alerts}</h3>
            <p>Total Alerts Logged</p>
          </div>
        </div>
      </div>

      {/* Safety Preparedness Checklist */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaShieldAlt style={{ color: 'var(--primary)' }} /> Safety Readiness Checklist
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: stats.contacts > 0 ? '#f0fdf4' : '#fff5f5', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {stats.contacts > 0 ? <FiCheckCircle color="#16a34a" size={20} /> : <FiXCircle color="#dc2626" size={20} />}
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Emergency Contacts Configured ({stats.contacts}/3+ recommended)</span>
            </div>
            {stats.contacts === 0 && <Link to="/contacts" className="btn btn-sm btn-outline">Add Contacts</Link>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiCheckCircle color="#16a34a" size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>GPS Location Services Ready</span>
            </div>
            <Link to="/location" className="btn btn-sm btn-outline">Test GPS</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiCheckCircle color="#16a34a" size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Voice SOS Guard & Panic Siren Ready</span>
            </div>
            <Link to="/sos" className="btn btn-sm btn-primary">Open SOS Tools</Link>
          </div>
        </div>
      </div>

      {/* Emergency Quick Action Grid */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 700 }}>
        ⚡ Quick Safety Actions
      </h3>
      <div className="quick-actions" style={{ marginBottom: '2rem' }}>
        <Link to="/sos" className="btn btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
          🚨 Trigger Emergency SOS
        </Link>
        <Link to="/contacts" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
          <FiUsers /> Manage Contacts
        </Link>
        <Link to="/location" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
          <FiMapPin /> Safety Map & GPS
        </Link>
      </div>

      {/* Instant National Hotline Links */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '0.3rem' }}>📞 24/7 National Emergency Speed Dial</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Direct one-tap connection to law enforcement & medical emergency dispatch</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="tel:112" className="btn btn-danger" style={{ borderRadius: '50px' }}>
              <FaPhoneAlt /> Call 112 (Emergency)
            </a>
            <a href="tel:1091" className="btn btn-primary" style={{ borderRadius: '50px' }}>
              <FaUserShield /> Call 1091 (Women Helpline)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
