import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FiAlertCircle, FiUsers, FiMapPin } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ alerts: 0, contacts: 0, active: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/sos/my'),
      api.get('/contacts'),
    ]).then(([alertsRes, contactsRes]) => {
      const alerts = alertsRes.data.alerts;
      setStats({
        alerts: alerts.length,
        contacts: contactsRes.data.contacts.length,
        active: alerts.filter((a) => a.status === 'active').length,
      });
    });
  }, []);

  return (
    <div className="page">
      <h2>Welcome, {user?.name} 👋</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <FiAlertCircle size={28} />
          <div>
            <h3>{stats.alerts}</h3>
            <p>Total SOS Alerts</p>
          </div>
        </div>
        <div className="stat-card active">
          <FiAlertCircle size={28} />
          <div>
            <h3>{stats.active}</h3>
            <p>Active Alerts</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers size={28} />
          <div>
            <h3>{stats.contacts}</h3>
            <p>Emergency Contacts</p>
          </div>
        </div>
      </div>
      <div className="quick-actions">
        <Link to="/sos" className="btn btn-danger">🚨 Trigger SOS</Link>
        <Link to="/contacts" className="btn btn-outline">Manage Contacts</Link>
        <Link to="/location" className="btn btn-outline">Location History</Link>
      </div>
    </div>
  );
};

export default Dashboard;
