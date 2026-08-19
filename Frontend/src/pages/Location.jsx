import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiMapPin } from 'react-icons/fi';

const Location = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = () => api.get('/location/history').then(({ data }) => setLogs(data.logs));
  useEffect(() => { fetchLogs(); }, []);

  const logCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await api.post('/location', { lat: coords.latitude, lng: coords.longitude });
          toast.success('Location logged');
          fetchLogs();
        } catch {
          toast.error('Failed to log location');
        } finally {
          setLoading(false);
        }
      },
      () => { toast.error('Location access denied'); setLoading(false); }
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Location History</h2>
        <button className="btn btn-primary" onClick={logCurrentLocation} disabled={loading}>
          <FiMapPin /> {loading ? 'Getting location...' : 'Log Current Location'}
        </button>
      </div>
      {logs.length === 0 ? <p>No location logs yet.</p> : (
        <div className="location-list">
          {logs.map((l) => (
            <div key={l._id} className="location-card">
              <FiMapPin />
              <div>
                <p>{l.lat.toFixed(5)}, {l.lng.toFixed(5)}</p>
                {l.address && <p>{l.address}</p>}
                <small>{new Date(l.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Location;
