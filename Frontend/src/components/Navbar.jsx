import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiLogOut, FiBell, FiAlertCircle } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <FiShield size={24} /> <span>SafeGuard Women</span>
      </NavLink>

      {user ? (
        <div className="navbar-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink
            to="/sos"
            style={({ isActive }) => ({
              background: isActive ? '#dc2626' : 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              borderRadius: '20px',
              padding: '5px 14px',
              fontWeight: 800,
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            })}
          >
            <FiAlertCircle /> SOS HUB
          </NavLink>
          <NavLink to="/contacts">Contacts</NavLink>
          <NavLink to="/location">Location</NavLink>
          {user.role === 'admin' && (
            <NavLink to="/admin" style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px' }}>
              Admin Panel
            </NavLink>
          )}
          <NavLink to="/notifications" title="Notifications">
            <FiBell size={18} />
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            <FiLogOut /> Logout
          </button>
        </div>
      ) : (
        <div className="navbar-links">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register" className="btn btn-sm btn-primary" style={{ color: 'white', marginLeft: '6px' }}>
            Register Free
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
