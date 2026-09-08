const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) return { users: [], properties: [], leads: [], contacts: [] };
  return JSON.parse(fs.readFileSync(DB_FILE));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

let { users, properties, leads, contacts } = readDB();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'realestate_crm_secret_key_2024';

const auth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { _id: Date.now().toString(), name, email, password: hashed, role: role || 'agent', phone, isActive: true };
  users.push(user);
  writeDB({ users, properties, leads, contacts });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name, email, role } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  user.lastLogin = new Date().toISOString();
  writeDB({ users, properties, leads, contacts });
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = users.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...rest } = user;
  res.json(rest);
});

app.get('/api/properties', auth, (req, res) => {
  const query = properties;
  res.json({ properties: query, total: query.length, page: 1, pages: 1 });
});

app.get('/api/properties/stats', auth, (req, res) => {
  const total = properties.length;
  const available = properties.filter(p => p.status === 'available').length;
  const sold = properties.filter(p => p.status === 'sold').length;
  res.json({ total, available, sold, pending: total - available - sold, totalValue: 0 });
});

app.post('/api/properties', auth, (req, res) => {
  const property = { _id: Date.now().toString(), ...req.body, owner: req.user.id, assignedTo: req.user.id, createdAt: new Date().toISOString() };
  properties.push(property);
  writeDB({ users, properties, leads, contacts });
  res.json(property);
});

app.put('/api/properties/:id', auth, (req, res) => {
  const idx = properties.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  properties[idx] = { ...properties[idx], ...req.body };
  writeDB({ users, properties, leads, contacts });
  res.json(properties[idx]);
});

app.delete('/api/properties/:id', auth, (req, res) => {
  properties = properties.filter(p => p._id !== req.params.id);
  writeDB({ users, properties, leads, contacts });
  res.json({ message: 'Deleted' });
});

app.get('/api/leads', auth, (req, res) => res.json({ leads, total: leads.length, page: 1, pages: 1 }));
app.get('/api/leads/stats', auth, (req, res) => {
  const total = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  res.json({ total, new: newLeads, qualified: 0, converted: 0, interested: 0 });
});
app.post('/api/leads', auth, (req, res) => {
  const lead = { _id: Date.now().toString(), ...req.body, assignedTo: req.user.id, createdAt: new Date().toISOString() };
  leads.push(lead);
  writeDB({ users, properties, leads, contacts });
  res.json(lead);
});
app.put('/api/leads/:id', auth, (req, res) => {
  const idx = leads.findIndex(l => l._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  leads[idx] = { ...leads[idx], ...req.body };
  writeDB({ users, properties, leads, contacts });
  res.json(leads[idx]);
});
app.delete('/api/leads/:id', auth, (req, res) => {
  leads = leads.filter(l => l._id !== req.params.id);
  writeDB({ users, properties, leads, contacts });
  res.json({ message: 'Deleted' });
});

app.get('/api/contacts', auth, (req, res) => res.json({ contacts, total: contacts.length, page: 1, pages: 1 }));
app.post('/api/contacts', auth, (req, res) => {
  const contact = { _id: Date.now().toString(), ...req.body, assignedTo: req.user.id, createdAt: new Date().toISOString() };
  contacts.push(contact);
  writeDB({ users, properties, leads, contacts });
  res.json(contact);
});
app.put('/api/contacts/:id', auth, (req, res) => {
  const idx = contacts.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  contacts[idx] = { ...contacts[idx], ...req.body };
  writeDB({ users, properties, leads, contacts });
  res.json(contacts[idx]);
});
app.delete('/api/contacts/:id', auth, (req, res) => {
  contacts = contacts.filter(c => c._id !== req.params.id);
  writeDB({ users, properties, leads, contacts });
  res.json({ message: 'Deleted' });
});

app.get('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  res.json(users.map(u => { const { password, ...rest } = u; return rest; }));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using JSON file database (no MongoDB required)');
});
