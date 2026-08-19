import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get(`/admin/alerts?status=${status}&page=${page}&limit=10`)
      .then(({ data }) => { setAlerts(data.alerts); setTotal(data.total); });
  }, [status, page]);

  return (
    <AdminLayout>
      <h2>SOS Alerts Monitor</h2>
      <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <option value="">All Statuses</option>
        <option value="active">🔴 Active</option>
        <option value="resolved">🟢 Resolved</option>
        <option value="cancelled">⚫ Cancelled</option>
      </select>
      <table className="data-table">
        <thead>
          <tr><th>User</th><th>Email</th><th>Status</th><th>Location</th><th>Date</th></tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a._id}>
              <td><strong>{a.user?.name}</strong></td>
              <td>{a.user?.email}</td>
              <td><span className={`badge ${a.status}`}>{a.status}</span></td>
              <td>
                {a.location?.lat ? (
                  <a href={`https://www.google.com/maps?q=${a.location.lat},${a.location.lng}`} target="_blank" rel="noreferrer" style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.82rem' }}>
                    📍 {a.location.lat.toFixed(3)}, {a.location.lng.toFixed(3)} ↗
                  </a>
                ) : a.location?.address || '—'}
              </td>
              <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(a.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {alerts.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No alerts found</td></tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
        <span>Page {page} of {Math.ceil(total / 10) || 1}</span>
        <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(page + 1)}>Next →</button>
      </div>
    </AdminLayout>
  );
};

export default AdminAlerts;
