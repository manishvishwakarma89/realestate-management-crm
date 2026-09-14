const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'realestate_crm_secret_key_2024';
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_USER = process.env.MONGO_USER || 'root';
const MONGO_PASS = process.env.MONGO_PASS || 'root';
const DB_NAME = 'realestate_crm';
const PORT = process.env.PORT || 5000;

// Build the MongoDB connection string with authSource=admin
const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}?authSource=admin`;
console.log('Connecting to MongoDB at:', `${MONGO_HOST}:${MONGO_PORT}`);

let db;
let usersCollection, propertiesCollection, leadsCollection, contactsCollection;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    usersCollection = db.collection('users');
    propertiesCollection = db.collection('properties');
    leadsCollection = db.collection('leads');
    contactsCollection = db.collection('contacts');
    
    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const auth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { 
    res.status(401).json({ message: 'Invalid token' }); 
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    
    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });
    
    const hashed = await bcrypt.hash(password, 10);
    const user = { 
      name, 
      email, 
      password: hashed, 
      role: role || 'agent', 
      phone, 
      isActive: true,
      createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(user);
    const token = jwt.sign({ id: result.insertedId.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: result.insertedId.toString(), 
        name, 
        email, 
        role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        name: user.name, 
        email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { password, ...rest } = user;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Properties Routes
app.get('/api/properties', auth, async (req, res) => {
  try {
    const properties = await propertiesCollection.find({}).toArray();
    res.json({ properties, total: properties.length, page: 1, pages: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/properties/stats', auth, async (req, res) => {
  try {
    const total = await propertiesCollection.countDocuments();
    const available = await propertiesCollection.countDocuments({ status: 'available' });
    const sold = await propertiesCollection.countDocuments({ status: 'sold' });
    res.json({ total, available, sold, pending: total - available - sold, totalValue: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/properties', auth, async (req, res) => {
  try {
    const property = {
      ...req.body,
      owner: req.user.id,
      assignedTo: req.user.id,
      createdAt: new Date()
    };
    
    const result = await propertiesCollection.insertOne(property);
    res.json({ ...property, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/properties/:id', auth, async (req, res) => {
  try {
    const result = await propertiesCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    
    if (!result.value) return res.status(404).json({ message: 'Not found' });
    res.json(result.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/properties/:id', auth, async (req, res) => {
  try {
    const result = await propertiesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leads Routes
app.get('/api/leads', auth, async (req, res) => {
  try {
    const leads = await leadsCollection.find({}).toArray();
    res.json({ leads, total: leads.length, page: 1, pages: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/leads/stats', auth, async (req, res) => {
  try {
    const total = await leadsCollection.countDocuments();
    const newLeads = await leadsCollection.countDocuments({ status: 'new' });
    res.json({ total, new: newLeads, qualified: 0, converted: 0, interested: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leads', auth, async (req, res) => {
  try {
    const lead = {
      ...req.body,
      assignedTo: req.user.id,
      createdAt: new Date()
    };
    
    const result = await leadsCollection.insertOne(lead);
    res.json({ ...lead, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/leads/:id', auth, async (req, res) => {
  try {
    const result = await leadsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    
    if (!result.value) return res.status(404).json({ message: 'Not found' });
    res.json(result.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/leads/:id', auth, async (req, res) => {
  try {
    const result = await leadsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Contacts Routes
app.get('/api/contacts', auth, async (req, res) => {
  try {
    const contacts = await contactsCollection.find({}).toArray();
    res.json({ contacts, total: contacts.length, page: 1, pages: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/contacts', auth, async (req, res) => {
  try {
    const contact = {
      ...req.body,
      assignedTo: req.user.id,
      createdAt: new Date()
    };
    
    const result = await contactsCollection.insertOne(contact);
    res.json({ ...contact, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/contacts/:id', auth, async (req, res) => {
  try {
    const result = await contactsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    
    if (!result.value) return res.status(404).json({ message: 'Not found' });
    res.json(result.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/contacts/:id', auth, async (req, res) => {
  try {
    const result = await contactsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Users Routes
app.get('/api/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    
    const users = await usersCollection.find({}).toArray();
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server after DB connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Connected to MongoDB');
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
