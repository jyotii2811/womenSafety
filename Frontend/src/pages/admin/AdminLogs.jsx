import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/logs').then(({ data }) => setLogs(data.logs));
  }, []);

  return (
    <AdminLayout>
      <h2>Activity Logs</h2>
      <table className="data-table">
        <thead>
          <tr><th>User</th><th>Action</th><th>Details</th><th>Time</th></tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id}>
              <td><strong>{l.user?.name || 'Unknown'}</strong></td>
              <td><span className="badge">{l.action}</span></td>
              <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{l.details || '—'}</td>
              <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No logs found</td></tr>
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminLogs;
