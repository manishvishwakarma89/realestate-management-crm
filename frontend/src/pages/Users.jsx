import { useEffect, useState } from 'react';
import { users } from '../utils/api';
import { Edit, Trash2 } from 'lucide-react';

export default function Users() {
  const [usersList, setUsersList] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'agent', phone: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await users.getAll();
      setUsersList(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await users.update(editing, form);
      setEditing(null);
      setForm({ name: '', email: '', role: 'agent', phone: '' });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (user) => {
    setEditing(user._id);
    setForm({ name: user.name, email: user.email, role: user.role, phone: user.phone || '' });
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this user?')) {
      await users.delete(id);
      fetchUsers();
    }
  };

  const getRoleBadge = (role) => {
    const colors = { admin: 'bg-red-100 text-red-700', manager: 'bg-purple-100 text-purple-700', agent: 'bg-blue-100 text-blue-700' };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map(user => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${getRoleBadge(user.role)}`}>{user.role}</span></td>
                <td className="p-3">{user.phone || '-'}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(user)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded" required />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-2 border rounded" required />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full p-2 border rounded" />
              <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full p-2 border rounded">
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
