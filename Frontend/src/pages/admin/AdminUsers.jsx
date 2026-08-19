import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = () => {
    api.get(`/admin/users?search=${search}&page=${page}&limit=10`)
      .then(({ data }) => { setUsers(data.users); setTotal(data.total); });
  };

  useEffect(() => { fetchUsers(); }, [search, page]);

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      toast.success('Status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <AdminLayout>
      <h2>Manage Users</h2>
      <input
        className="search-input"
        placeholder="🔍 Search by name..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td><strong>{u.name}</strong></td>
              <td>{u.email}</td>
              <td>{u.phone || '—'}</td>
              <td><span className={`badge ${u.role}`}>{u.role}</span></td>
              <td><span className={`badge ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-success'}`} onClick={() => toggleStatus(u._id)}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No users found</td></tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
        <span>Page {page} of {Math.ceil(total / 10) || 1}</span>
        <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(page + 1)}>Next →</button>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
