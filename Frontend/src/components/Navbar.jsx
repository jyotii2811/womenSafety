import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiLogOut, FiBell } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <FiShield /> WomenSafety
      </NavLink>
      {user && (
        <div className="navbar-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/sos">SOS</NavLink>
          <NavLink to="/contacts">Contacts</NavLink>
          <NavLink to="/location">Location</NavLink>
          {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to="/notifications"><FiBell /></NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <button onClick={handleLogout} className="btn-logout"><FiLogOut /> Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
