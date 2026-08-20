import { Link } from 'react-router-dom';
import { FiShield, FiMapPin, FiUsers, FiMic, FiPhoneCall, FiVolume2 } from 'react-icons/fi';
import { FaShieldAlt, FaPhoneAlt, FaUserShield } from 'react-icons/fa';

const Home = () => (
  <div className="home">
    <div className="hero">
      <h1>
        <FaShieldAlt style={{ color: 'var(--primary)' }} /> SafeGuard Women Platform
      </h1>
      <p>
        Next-generation personal safety app with hands-free Voice SOS, high-decibel Panic Siren, discreet Fake Call simulator, and real-time GPS tracking.
      </p>

      <div className="hero-btns">
        <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1.05rem', boxShadow: '0 4px 20px rgba(233,30,99,0.4)' }}>
          Create Free Account
        </Link>
        <Link to="/login" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '1.05rem' }}>
          Login to Account
        </Link>
      </div>
    </div>

    {/* Feature Highlights Grid */}
    <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 800 }}>
      🛡️ Powerful Personal Safety Features
    </h2>

    <div className="features">
      <div className="feature-card">
        <FiShield size={36} />
        <h3>One-Tap Emergency SOS</h3>
        <p>Instantly broadcast emergency notifications and GPS links to your trusted contacts via Email and App Alert.</p>
      </div>

      <div className="feature-card">
        <FiMic size={36} />
        <h3>Hands-Free Voice SOS</h3>
        <p>Say "Help", "Emergency", or "Bachao" to automatically trigger SOS alerts without touching your phone.</p>
      </div>

      <div className="feature-card">
        <FiVolume2 size={36} />
        <h3>Panic Siren & Strobe</h3>
        <p>Emits an oscillating high-decibel siren and visual strobe screen overlay to startle threats and attract public help.</p>
      </div>

      <div className="feature-card">
        <FiPhoneCall size={36} />
        <h3>Discreet Fake Call</h3>
        <p>Simulate realistic incoming phone calls with custom caller IDs to safely excuse yourself from uncomfortable surroundings.</p>
      </div>

      <div className="feature-card">
        <FiMapPin size={36} />
        <h3>Live GPS & Safety Map</h3>
        <p>Interactive live tracking with one-tap navigation to nearby Police Stations, Hospitals, and Women Safety Desks.</p>
      </div>

      <div className="feature-card">
        <FiUsers size={36} />
        <h3>Trusted Network</h3>
        <p>Manage emergency contacts with auto-sync and emergency speed-dial hotlines (112, 1091, 181).</p>
      </div>
    </div>

    {/* Quick Helpline Banner */}
    <div className="card" style={{ marginBottom: '4rem', background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
        📞 National Emergency Helplines Always Available
      </h2>
      <p style={{ color: 'var(--text)', maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '1rem' }}>
        In case of an immediate emergency, call official law enforcement or emergency medical services:
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="tel:112" className="btn btn-danger" style={{ fontSize: '1rem', padding: '10px 22px', borderRadius: '50px' }}>
          <FaPhoneAlt /> Call 112 (National Emergency)
        </a>
        <a href="tel:1091" className="btn btn-primary" style={{ fontSize: '1rem', padding: '10px 22px', borderRadius: '50px' }}>
          <FaUserShield /> Call 1091 (Women Helpline)
        </a>
      </div>
    </div>
  </div>
);

export default Home;
