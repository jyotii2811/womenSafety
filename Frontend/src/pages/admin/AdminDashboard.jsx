import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FiUsers, FiAlertCircle, FiActivity, FiAlertOctagon } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats));
  }, []);

  return (
    <AdminLayout>
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <FiUsers size={28} />
          <div><h3>{stats.totalUsers ?? '—'}</h3><p>Total Users</p></div>
        </div>
        <div className="stat-card active">
          <FiAlertCircle size={28} />
          <div><h3>{stats.activeAlerts ?? '—'}</h3><p>Active Alerts</p></div>
        </div>
        <div className="stat-card success">
          <FiAlertCircle size={28} />
          <div><h3>{stats.totalAlerts ?? '—'}</h3><p>Total Alerts</p></div>
        </div>
        <div className="stat-card info">
          <FiActivity size={28} />
          <div><h3>{stats.totalLogs ?? '—'}</h3><p>Activity Logs</p></div>
        </div>
      </div>
      <div className="quick-actions">
        <Link to="/admin/sos-center" className="btn btn-danger"><FiAlertOctagon /> SOS Control Center</Link>
        <Link to="/admin/users" className="btn btn-outline"><FiUsers /> Manage Users</Link>
        <Link to="/admin/alerts" className="btn btn-outline"><FiAlertCircle /> View Alerts</Link>
        <Link to="/admin/logs" className="btn btn-outline"><FiActivity /> Activity Logs</Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
