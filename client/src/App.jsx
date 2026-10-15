import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
const empty = { name: '', email: '', phone: '' };

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setUsers((await api.get('/users')).data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) await api.put(`/users/${editingId}`, form);
      else await api.post('/users', form);
      reset();
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const reset = () => {
    setForm(empty);
    setEditingId(null);
  };

  const edit = (u) => {
    setEditingId(u._id);
    setForm({ name: u.name, email: u.email, phone: u.phone || '' });
  };

  const remove = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="container">
      <h1>User CRUD</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input name="name" placeholder="Name" value={form.name} onChange={change} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={change} />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={reset}>Cancel</button>}
      </form>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>
                <button onClick={() => edit(u)}>Edit</button>
                <button onClick={() => remove(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {!users.length && <tr><td colSpan="4">No users yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
