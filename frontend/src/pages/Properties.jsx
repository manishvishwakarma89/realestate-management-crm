import { useEffect, useState } from 'react';
import { properties, users } from '../utils/api';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

export default function Properties() {
  const [propertiesList, setProperties] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [form, setForm] = useState({
    title: '', description: '', type: 'apartment', status: 'available',
    price: '', area: '', bedrooms: '', bathrooms: '', parking: '',
    address: { city: '', state: '' }, features: '', assignedTo: ''
  });

  useEffect(() => {
    fetchProperties();
    fetchUsers();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await properties.getAll({ search, ...filters });
      setProperties(res.data.properties);
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
      const data = { ...form, price: Number(form.price), area: Number(form.area), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), parking: Number(form.parking), features: form.features.split(',').map(f => f.trim()) };
      if (editing) {
        await properties.update(editing, data);
      } else {
        await properties.create(data);
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchProperties();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (prop) => {
    setEditing(prop._id);
    setForm({
      title: prop.title, description: prop.description || '', type: prop.type,
      status: prop.status, price: prop.price, area: prop.area, bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms, parking: prop.parking,
      address: { city: prop.address?.city || '', state: prop.address?.state || '' },
      features: prop.features?.join(', ') || '', assignedTo: prop.assignedTo?._id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this property?')) {
      await properties.delete(id);
      fetchProperties();
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', type: 'apartment', status: 'available', price: '', area: '', bedrooms: '', bathrooms: '', parking: '', address: { city: '', state: '' }, features: '', assignedTo: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={18} /> Add Property
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchProperties()} className="w-full pl-10 p-2 border rounded" />
          </div>
        </div>
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="reserved">Reserved</option>
          <option value="pending">Pending</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="p-2 border rounded">
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
        </select>
        <button onClick={fetchProperties} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Filter</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {propertiesList.map(prop => (
              <tr key={prop._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{prop.title}</td>
                <td className="p-3 capitalize">{prop.type}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${prop.status === 'available' ? 'bg-green-100 text-green-700' : prop.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{prop.status}</span></td>
                <td className="p-3">₹{prop.price?.toLocaleString()}</td>
                <td className="p-3">{prop.address?.city}, {prop.address?.state}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(prop)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(prop._id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Property</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="p-2 border rounded" required />
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="p-2 border rounded">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
                <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="p-2 border rounded" required />
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="p-2 border rounded">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                  <option value="pending">Pending</option>
                </select>
                <input type="number" placeholder="Area (sq ft)" value={form.area} onChange={(e) => setForm({...form, area: e.target.value})} className="p-2 border rounded" required />
                <input type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => setForm({...form, bedrooms: e.target.value})} className="p-2 border rounded" />
                <input type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => setForm({...form, bathrooms: e.target.value})} className="p-2 border rounded" />
                <input type="number" placeholder="Parking" value={form.parking} onChange={(e) => setForm({...form, parking: e.target.value})} className="p-2 border rounded" />
                <input placeholder="City" value={form.address.city} onChange={(e) => setForm({...form, address: {...form.address, city: e.target.value}})} className="p-2 border rounded" />
                <input placeholder="State" value={form.address.state} onChange={(e) => setForm({...form, address: {...form.address, state: e.target.value}})} className="p-2 border rounded" />
              </div>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded" rows={3} />
              <input placeholder="Features (comma separated)" value={form.features} onChange={(e) => setForm({...form, features: e.target.value})} className="w-full p-2 border rounded" />
              <select value={form.assignedTo} onChange={(e) => setForm({...form, assignedTo: e.target.value})} className="w-full p-2 border rounded">
                <option value="">Assign to...</option>
                {usersList.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
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
