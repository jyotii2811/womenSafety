import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiBell, FiTrash2 } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = () => api.get('/notifications').then(({ data }) => setNotifications(data.notifications));
  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await api.put('/notifications/mark-read');
    toast.success('All marked as read');
    fetchNotifications();
  };

  const deleteOne = async (id) => {
    await api.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2><FiBell /> Notifications</h2>
        {notifications.length > 0 && <button className="btn btn-outline" onClick={markAllRead}>Mark all read</button>}
      </div>
      {notifications.length === 0 ? <p>No notifications.</p> : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div key={n._id} className={`notification-card ${!n.isRead ? 'unread' : ''}`}>
              <div>
                <p>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              <button className="icon-btn danger" onClick={() => deleteOne(n._id)}><FiTrash2 /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
