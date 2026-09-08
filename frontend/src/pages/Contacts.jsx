import { useEffect, useState } from 'react';
import { contacts, users } from '../utils/api';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

export default function Contacts() {
  const [contactsList, setContactsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '' });
  const [form, setForm] = useState({
    name: '', email: '', phone: '', type: 'buyer', address: '', profession: '', annualIncome: '', assignedTo: '', tags: ''
  });

  useEffect(() => {
    fetchContacts();
    fetchUsers();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await contacts.getAll({ search, ...filters });
      setContactsList(res.data.contacts);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await users.getAll();
      setUsersList(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, annualIncome: form.annualIncome ? Number(form.annualIncome) : undefined, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) await contacts.update(editing, data);
      else await contacts.create(data);
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchContacts();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (contact) => {
    setEditing(contact._id);
    setForm({
      name: contact.name, email: contact.email || '', phone: contact.phone, type: contact.type,
      address: contact.address || '', profession: contact.profession || '', annualIncome: contact.annualIncome || '',
      assignedTo: contact.assignedTo?._id || '', tags: contact.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this contact?')) {
      await contacts.delete(id);
      fetchContacts();
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', type: 'buyer', address: '', profession: '', annualIncome: '', assignedTo: '', tags: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={18} /> Add Contact
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchContacts()} className="w-full pl-10 p-2 border rounded" />
          </div>
        </div>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="p-2 border rounded">
          <option value="">All Types</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="owner">Owner</option>
          <option value="tenant">Tenant</option>
          <option value="vendor">Vendor</option>
        </select>
        <button onClick={fetchContacts} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Filter</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contactsList.map(contact => (
              <tr key={contact._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{contact.name}</td>
                <td className="p-3">{contact.phone}</td>
                <td className="p-3">{contact.email || '-'}</td>
                <td className="p-3 capitalize">{contact.type}</td>
                <td className="p-3">{contact.assignedTo?.name || '-'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(contact)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(contact._id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Contact</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="p-2 border rounded" required />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="p-2 border rounded" required />
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="p-2 border rounded" />
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="p-2 border rounded">
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="vendor">Vendor</option>
                </select>
                <input placeholder="Address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="p-2 border rounded" />
                <input placeholder="Profession" value={form.profession} onChange={(e) => setForm({...form, profession: e.target.value})} className="p-2 border rounded" />
                <input type="number" placeholder="Annual Income" value={form.annualIncome} onChange={(e) => setForm({...form, annualIncome: e.target.value})} className="p-2 border rounded" />
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} className="w-full p-2 border rounded" />
              <select value={form.assignedTo} onChange={(e) => setForm({...form, assignedTo: e.target.value})} className="w-full p-2 border rounded">
                <option value="">Assign to...</option>
                {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
