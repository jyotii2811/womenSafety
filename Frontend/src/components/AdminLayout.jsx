import { NavLink } from 'react-router-dom';
import { FiUsers, FiAlertCircle, FiActivity, FiGrid, FiAlertOctagon } from 'react-icons/fi';

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <aside className="admin-sidebar">
      <div className="admin-sidebar-title">Admin Panel</div>
      <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
        <FiGrid size={15} /> Dashboard
      </NavLink>
      <NavLink to="/admin/sos-center" className={({ isActive }) => `sos-link${isActive ? ' active' : ''}`}>
        <FiAlertOctagon size={15} /> 🚨 SOS Center
      </NavLink>
      <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
        <FiUsers size={15} /> Manage Users
      </NavLink>
      <NavLink to="/admin/alerts" className={({ isActive }) => isActive ? 'active' : ''}>
        <FiAlertCircle size={15} /> SOS Alerts
      </NavLink>
      <NavLink to="/admin/logs" className={({ isActive }) => isActive ? 'active' : ''}>
        <FiActivity size={15} /> Activity Logs
      </NavLink>
    </aside>
    <main className="admin-content">{children}</main>
  </div>
);

export default AdminLayout;
