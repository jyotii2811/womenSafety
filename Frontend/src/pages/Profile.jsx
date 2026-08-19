import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', profile);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    try {
      await api.put('/users/change-password', passwords);
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="page">
      <h2>My Profile</h2>
      <div className="profile-grid">
        <div className="card">
          <h3>Personal Info</h3>
          <form onSubmit={updateProfile}>
            <label>Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            <label>Email</label>
            <input value={user?.email || ''} disabled />
            <label>Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
        <div className="card">
          <h3>Change Password</h3>
          <form onSubmit={changePassword}>
            <label>Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
            <label>New Password</label>
            <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
