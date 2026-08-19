import { Link } from 'react-router-dom';
import { FiShield, FiMapPin, FiUsers } from 'react-icons/fi';

const Home = () => (
  <div className="home">
    <div className="hero">
      <h1><FiShield /> Women Safety Platform</h1>
      <p>Instant SOS alerts, live location sharing, and trusted emergency contacts — all in one place.</p>
      <div className="hero-btns">
        <Link to="/register" className="btn btn-primary">Get Started</Link>
        <Link to="/login" className="btn btn-outline">Login</Link>
      </div>
    </div>
    <div className="features">
      <div className="feature-card">
        <FiShield size={32} />
        <h3>One-Tap SOS</h3>
        <p>Instantly alert all your emergency contacts with your location.</p>
      </div>
      <div className="feature-card">
        <FiMapPin size={32} />
        <h3>Live Location</h3>
        <p>Share real-time location during active SOS alerts.</p>
      </div>
      <div className="feature-card">
        <FiUsers size={32} />
        <h3>Trusted Contacts</h3>
        <p>Manage your emergency contacts easily.</p>
      </div>
    </div>
  </div>
);

export default Home;
