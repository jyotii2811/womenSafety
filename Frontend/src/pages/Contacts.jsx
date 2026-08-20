import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiTrash2, FiEdit2, FiPlus, FiPhoneCall, FiMail, FiUserCheck } from 'react-icons/fi';

const emptyForm = { name: '', phone: '', email: '', relation: '' };

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchContacts = () => api.get('/contacts').then(({ data }) => setContacts(data.contacts));
  useEffect(() => { fetchContacts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/contacts/${editId}`, form);
        toast.success('Emergency contact updated!');
      } else {
        await api.post('/contacts', form);
        toast.success('Emergency contact added!');
      }
      setForm(emptyForm); setEditId(null); setShowForm(false);
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving contact');
    }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, phone: c.phone, email: c.email || '', relation: c.relation || '' });
    setEditId(c._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this emergency contact?')) return;
    await api.delete(`/contacts/${id}`);
    toast.success('Contact removed');
    fetchContacts();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>👥 Emergency Trusted Contacts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Trusted contacts notified instantly during active SOS alerts.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
        >
          <FiPlus /> Add Emergency Contact
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>
            {editId ? '✏️ Edit Contact' : '➕ Add New Emergency Contact'}
          </h3>
          <form className="contact-form" onSubmit={handleSubmit} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label>Full Name *</label>
              <input
                placeholder="e.g. Sarah Smith"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label>Phone Number *</label>
              <input
                placeholder="e.g. +91 98765 43210"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label>Email Address (For Instant SOS Email Alerts)</label>
              <input
                type="email"
                placeholder="e.g. sarah@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label>Relation</label>
              <input
                placeholder="e.g. Mother, Sister, Friend, Husband"
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <FiUserCheck /> {editId ? 'Save Changes' : 'Add Contact'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="card empty-state">
          <p>No emergency contacts added yet. Add at least 1-3 contacts to send SOS alerts.</p>
        </div>
      ) : (
        <div className="contact-list">
          {contacts.map((c) => (
            <div key={c._id} className="contact-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    flexShrink: 0,
                  }}
                >
                  {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {c.name} {c.relation && <span className="badge user" style={{ marginLeft: 8 }}>{c.relation}</span>}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '2px 0' }}>
                    📞 {c.phone}
                  </p>
                  {c.email && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ✉️ {c.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="card-actions" style={{ gap: '0.5rem' }}>
                <a href={`tel:${c.phone}`} className="btn btn-sm btn-success" title="Quick Call">
                  <FiPhoneCall /> Call
                </a>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="btn btn-sm btn-outline" title="Send Email">
                    <FiMail />
                  </a>
                )}
                <button className="icon-btn" onClick={() => handleEdit(c)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete(c._id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
