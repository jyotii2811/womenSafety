import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';

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
        toast.success('Contact updated');
      } else {
        await api.post('/contacts', form);
        toast.success('Contact added');
      }
      setForm(emptyForm); setEditId(null); setShowForm(false);
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving contact');
    }
  };

  const handleEdit = (c) => { setForm({ name: c.name, phone: c.phone, email: c.email || '', relation: c.relation || '' }); setEditId(c._id); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    await api.delete(`/contacts/${id}`);
    toast.success('Deleted');
    fetchContacts();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Emergency Contacts</h2>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}><FiPlus /> Add Contact</button>
      </div>
      {showForm && (
        <form className="contact-form" onSubmit={handleSubmit}>
          <input placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Relation (e.g. Mother)" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Add'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
      {contacts.length === 0 ? <p>No contacts added yet.</p> : (
        <div className="contact-list">
          {contacts.map((c) => (
            <div key={c._id} className="contact-card">
              <div>
                <h4>{c.name} {c.relation && <span className="badge">{c.relation}</span>}</h4>
                <p>📞 {c.phone}</p>
                {c.email && <p>✉️ {c.email}</p>}
              </div>
              <div className="card-actions">
                <button className="icon-btn" onClick={() => handleEdit(c)}><FiEdit2 /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(c._id)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
