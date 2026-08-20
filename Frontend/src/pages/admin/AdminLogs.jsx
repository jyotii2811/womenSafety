import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import { FiSearch, FiRefreshCw, FiMapPin, FiActivity, FiFilter, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminLogs = () => {
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'location'
  const [logs, setLogs] = useState([]);
  const [locationLogs, setLocationLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(() => {
    setLoading(true);
    if (activeTab === 'activity') {
      api.get(`/admin/logs?search=${search}&action=${actionFilter}`)
        .then(({ data }) => setLogs(data.logs || []))
        .catch(() => toast.error('Failed to fetch activity logs'))
        .finally(() => setLoading(false));
    } else {
      api.get('/admin/location-logs')
        .then(({ data }) => setLocationLogs(data.locationLogs || []))
        .catch(() => toast.error('Failed to fetch location logs'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, search, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtered location logs by search query
  const filteredLocationLogs = locationLogs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q) ||
      l.address?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>📋 System Logs & Audit History</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comprehensive real-time tracking of security alerts, user activities, and location history logs.
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchLogs} disabled={loading}>
          <FiRefreshCw className={loading ? 'spin' : ''} /> {loading ? 'Loading...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('activity')}
        >
          <FiActivity /> Activity Logs ({logs.length})
        </button>
        <button
          className={`btn ${activeTab === 'location' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('location')}
        >
          <FiMapPin /> GPS Location History ({locationLogs.length})
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by User Name, Email, or Action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <FiSearch style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
          </div>

          {activeTab === 'activity' && (
            <div style={{ minWidth: 200 }}>
              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="">All Action Types</option>
                <option value="SOS_TRIGGERED">SOS Triggered</option>
                <option value="VOICE_SOS">Voice SOS Triggered</option>
                <option value="LOCATION_LOGGED">Location Logged</option>
                <option value="USER_REGISTER">User Registered</option>
                <option value="USER_LOGIN">User Logged In</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content: System Activity Logs */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Action Badge</th>
                <th>Details / Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>
                    <strong>{l.user?.name || 'Guest / System'}</strong>
                    {l.user?.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.user.email}</div>}
                  </td>
                  <td>
                    <span className={`badge ${l.action?.includes('SOS') ? 'active' : 'user'}`}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text)', fontSize: '0.88rem' }}>
                    {l.details || '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                    🕒 {new Date(l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: GPS Location History Logs */}
      {activeTab === 'location' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Coordinates (Lat, Lng)</th>
                <th>Geocoded Address</th>
                <th>Google Maps Link</th>
                <th>Logged At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocationLogs.map((l) => (
                <tr key={l._id}>
                  <td>
                    <strong>{l.user?.name || 'Unknown User'}</strong>
                    {l.user?.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.user.email}</div>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {l.lat?.toFixed(5)}, {l.lng?.toFixed(5)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text)', fontSize: '0.88rem', maxWidth: 300 }}>
                    {l.address || 'Location coordinates saved'}
                  </td>
                  <td>
                    {l.lat && l.lng ? (
                      <a
                        href={`https://www.google.com/maps?q=${l.lat},${l.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        <FiMapPin /> Open Maps <FiExternalLink />
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                    🕒 {new Date(l.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredLocationLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    No GPS location logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLogs;
