import { useEffect, useState } from 'react';
import { leads, users } from '../utils/api';
import { Plus, Edit, Trash2, Search, X, MessageSquare } from 'lucide-react';

export default function Leads() {
  const [leadsList, setLeadsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotes, setShowNotes] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', source: '' });
  const [form, setForm] = useState({
    name: '', email: '', phone: '', source: 'direct', status: 'new',
    type: 'buyer', budget: '', preferredLocation: '', assignedTo: ''
  });
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await leads.getAll({ search, ...filters });
      setLeadsList(res.data.leads);
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
      const data = { ...form, budget: form.budget ? Number(form.budget) : undefined };
      if (editing) await leads.update(editing, data);
      else await leads.create(data);
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchLeads();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (lead) => {
    setEditing(lead._id);
    setForm({
      name: lead.name, email: lead.email || '', phone: lead.phone, source: lead.source,
      status: lead.status, type: lead.type, budget: lead.budget || '',
      preferredLocation: lead.preferredLocation || '', assignedTo: lead.assignedTo?._id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this lead?')) {
      await leads.delete(id);
      fetchLeads();
    }
  };

  const handleAddNote = async (id) => {
    if (!noteText.trim()) return;
    await leads.addNote(id, noteText);
    setNoteText('');
    setShowNotes(null);
    fetchLeads();
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', source: 'direct', status: 'new', type: 'buyer', budget: '', preferredLocation: '', assignedTo: '' });
  };

  const getStatusColor = (status) => {
    const colors = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-yellow-100 text-yellow-700', qualified: 'bg-purple-100 text-purple-700', interested: 'bg-green-100 text-green-700', not_interested: 'bg-gray-100 text-gray-700', converted: 'bg-emerald-100 text-emerald-700', follow_up: 'bg-orange-100 text-orange-700' };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button onClick={() => { resetForm(); setEditing(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchLeads()} className="w-full pl-10 p-2 border rounded" />
          </div>
        </div>
        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="interested">Interested</option>
          <option value="follow_up">Follow Up</option>
          <option value="converted">Converted</option>
        </select>
        <select value={filters.source} onChange={(e) => setFilters({...filters, source: e.target.value})} className="p-2 border rounded">
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social</option>
          <option value="direct">Direct</option>
          <option value="advertisement">Advertisement</option>
        </select>
        <button onClick={fetchLeads} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Filter</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leadsList.map(lead => (
              <tr key={lead._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{lead.name}</td>
                <td className="p-3">{lead.phone}</td>
                <td className="p-3 capitalize">{lead.type}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.status)}`}>{lead.status?.replace('_', ' ')}</span></td>
                <td className="p-3 capitalize">{lead.source}</td>
                <td className="p-3">{lead.assignedTo?.name || '-'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setShowNotes(lead)} className="text-green-600 hover:bg-green-50 p-1 rounded"><MessageSquare size={18} /></button>
                  <button onClick={() => handleEdit(lead)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
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
              <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Lead</h2>
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
                  <option value="tenant">Tenant</option>
                  <option value="investor">Investor</option>
                </select>
                <select value={form.source} onChange={(e) => setForm({...form, source: e.target.value})} className="p-2 border rounded">
                  <option value="direct">Direct</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social</option>
                  <option value="advertisement">Advertisement</option>
                </select>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="p-2 border rounded">
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="interested">Interested</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="converted">Converted</option>
                </select>
                <input type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="p-2 border rounded" />
                <input placeholder="Preferred Location" value={form.preferredLocation} onChange={(e) => setForm({...form, preferredLocation: e.target.value})} className="p-2 border rounded" />
              </div>
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

      {showNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Notes for {showNotes.name}</h2>
              <button onClick={() => setShowNotes(null)}><X size={24} /></button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {showNotes.notes?.map((note, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <p>{note.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {(!showNotes.notes || showNotes.notes.length === 0) && <p className="text-gray-500">No notes yet</p>}
            </div>
            <div className="flex gap-2">
              <input placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote(showNotes._id)} className="flex-1 p-2 border rounded" />
              <button onClick={() => handleAddNote(showNotes._id)} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
