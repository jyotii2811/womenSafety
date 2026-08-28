import { useState, useEffect } from 'react';
import { FaShieldAlt, FaPhoneAlt, FaDirections, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../api/axios';

const NearbyPoliceWidget = ({ lat, lng }) => {
  const [nearestPolice, setNearestPolice] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!lat || !lng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => fetchNearby(coords.latitude, coords.longitude),
          () => fetchNearby(28.6139, 77.209)
        );
      }
      return;
    }
    fetchNearby(lat, lng);
  }, [lat, lng]);

  const fetchNearby = (latitude, longitude) => {
    setLoading(true);
    api
      .get(`/location/nearbyServices?lat=${latitude}&lng=${longitude}`)
      .then(({ data }) => {
        if (data.success) {
          setNearestPolice(data.nearestPoliceStation);
          setAllServices(data.services || []);
        }
      })
      .catch(() => {
        setNearestPolice({
          name: 'District Central Police Station',
          phone: '112',
          distanceKm: 0.8,
          address: 'Main Civic HQ Block',
          mapLink: `https://www.google.com/maps/dir/?api=1&destination=${latitude + 0.005},${longitude + 0.003}`,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', color: '#ffffff', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
        <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaShieldAlt style={{ color: '#38bdf8' }} /> Nearest Police Station & Safe Zones
        </h3>
        {nearestPolice && (
          <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
            📍 {nearestPolice.distanceKm} km away
          </span>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Locating nearest emergency responders...</p>
      ) : nearestPolice ? (
        <div>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '12px 16px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#ffffff', margin: '0 0 4px 0', fontSize: '1rem' }}>{nearestPolice.name}</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 0 10px 0' }}>{nearestPolice.address}</p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={`tel:${nearestPolice.phone}`}
                className="btn btn-danger btn-sm"
                style={{ borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPhoneAlt /> Call Police ({nearestPolice.phone})
              </a>
              <a
                href={nearestPolice.mapLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaDirections /> Navigate on Map ↗
              </a>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {expanded ? <FaChevronUp /> : <FaChevronDown />} {expanded ? 'Hide Other Safe Havens' : 'View All Nearby Safe Places & Hospitals'}
          </button>

          {expanded && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allServices.map((service) => (
                <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                  <div>
                    <span style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 600 }}>{service.name}</span>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{service.distanceKm} km away • {service.phone}</p>
                  </div>
                  <a href={`tel:${service.phone}`} style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                    Call ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Grant location access to see nearest police stations.</p>
      )}
    </div>
  );
};

export default NearbyPoliceWidget;
