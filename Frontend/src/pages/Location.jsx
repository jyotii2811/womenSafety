import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiMapPin, FiNavigation, FiShield, FiCrosshair, FiExternalLink } from 'react-icons/fi';
import { FaUserShield, FaHospital, FaBuilding } from 'react-icons/fa';

const Location = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [addressName, setAddressName] = useState('');

  const fetchLogs = () => api.get('/location/history').then(({ data }) => setLogs(data.logs)).catch(() => {});

  const getCurrentPos = useCallback((autoLog = false) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setCurrentCoords({ lat, lng });

        // Optional reverse geocode display via Nominatim API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddressName(data.display_name);
          }
        } catch {}

        if (autoLog) {
          try {
            await api.post('/location', { lat, lng });
            toast.success('📍 Location logged successfully');
            fetchLogs();
          } catch {
            toast.error('Failed to save location log');
          }
        }
        setLoading(false);
      },
      (err) => {
        toast.error('Location permission denied or unavailable');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    fetchLogs();
    getCurrentPos(false);
  }, [getCurrentPos]);

  const mapIframeUrl = currentCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${currentCoords.lng - 0.008},${currentCoords.lat - 0.008},${currentCoords.lng + 0.008},${currentCoords.lat + 0.008}&layer=mapnik&marker=${currentCoords.lat},${currentCoords.lng}`
    : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>🗺️ Live Safety Map & Tracking</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Real-time GPS tracking and emergency safety zone locator.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => getCurrentPos(true)} disabled={loading}>
          <FiMapPin /> {loading ? 'Fetching location...' : 'Log Current Location'}
        </button>
      </div>

      {/* Live Map Display Container */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span className="badge active">GPS Signal Active</span>
            {currentCoords && (
              <span style={{ fontSize: '0.88rem', fontWeight: 600, marginLeft: '10px', color: 'var(--text)' }}>
                Lat: {currentCoords.lat.toFixed(5)}, Lng: {currentCoords.lng.toFixed(5)}
              </span>
            )}
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => getCurrentPos(false)}>
            <FiCrosshair /> Refresh GPS Position
          </button>
        </div>

        {addressName && (
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', marginBottom: '1rem', color: 'var(--text)' }}>
            📍 <strong>Current Location:</strong> {addressName}
          </div>
        )}

        {mapIframeUrl ? (
          <div className="map-container-box">
            <iframe
              title="User Live Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={mapIframeUrl}
              style={{ border: 0 }}
            />
          </div>
        ) : (
          <div className="map-container-box empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <FiNavigation size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <p>Click "Refresh GPS Position" to view your live location on the map.</p>
          </div>
        )}

        {/* Nearby Emergency Services Quick Search */}
        {currentCoords && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <a
              href={`https://www.google.com/maps/search/police+station/@${currentCoords.lat},${currentCoords.lng},14z`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ justifyContent: 'center', borderColor: '#0284c7', color: '#0284c7' }}
            >
              <FaBuilding /> Nearby Police Stations <FiExternalLink />
            </a>

            <a
              href={`https://www.google.com/maps/search/hospital/@${currentCoords.lat},${currentCoords.lng},14z`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ justifyContent: 'center', borderColor: '#16a34a', color: '#16a34a' }}
            >
              <FaHospital /> Nearby Emergency Care <FiExternalLink />
            </a>

            <a
              href={`https://www.google.com/maps/search/women+help+desk/@${currentCoords.lat},${currentCoords.lng},14z`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ justifyContent: 'center', borderColor: '#e91e63', color: '#e91e63' }}
            >
              <FaUserShield /> Women Safety Desks <FiExternalLink />
            </a>
          </div>
        )}
      </div>

      {/* Location History Logs */}
      <h3 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '1.2rem', fontWeight: 700 }}>
        📜 Location History Logs
      </h3>
      {logs.length === 0 ? (
        <div className="card empty-state">
          <p>No location logs saved yet.</p>
        </div>
      ) : (
        <div className="location-list">
          {logs.map((l) => (
            <div key={l._id} className="location-card">
              <FiMapPin size={24} style={{ color: 'var(--primary)' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, margin: 0 }}>
                  Lat: {l.lat.toFixed(5)}, Lng: {l.lng.toFixed(5)}
                </p>
                {l.address && <p style={{ fontSize: '0.88rem', color: 'var(--muted)', margin: '2px 0' }}>{l.address}</p>}
                <small style={{ color: 'var(--muted)' }}>🕒 {new Date(l.createdAt).toLocaleString()}</small>
              </div>
              <a
                href={`https://www.google.com/maps?q=${l.lat},${l.lng}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline"
              >
                Maps ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Location;
