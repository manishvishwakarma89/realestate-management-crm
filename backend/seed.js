const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const seed = async () => {
  const users = [
    { _id: '1', name: 'Admin User', email: 'admin@crm.com', password: await bcrypt.hash('admin123', 10), role: 'admin', phone: '9999999999', isActive: true },
    { _id: '2', name: 'Manager User', email: 'manager@crm.com', password: await bcrypt.hash('manager123', 10), role: 'manager', phone: '8888888888', isActive: true },
    { _id: '3', name: 'Agent User', email: 'agent@crm.com', password: await bcrypt.hash('agent123', 10), role: 'agent', phone: '7777777777', isActive: true },
  ];
  
  const properties = [
    { _id: '1', title: 'Luxury Villa', type: 'villa', status: 'available', price: 50000000, area: 5000, bedrooms: 5, bathrooms: 4, address: { city: 'Mumbai', state: 'Maharashtra' }, createdAt: new Date().toISOString() },
    { _id: '2', title: 'Modern Apartment', type: 'apartment', status: 'available', price: 15000000, area: 2000, bedrooms: 3, bathrooms: 2, address: { city: 'Delhi', state: 'Delhi' }, createdAt: new Date().toISOString() },
  ];

  const data = { users, properties, leads: [], contacts: [] };
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  console.log('Database seeded successfully!');
  console.log('Login credentials:');
  console.log('  Admin:    admin@crm.com / admin123');
  console.log('  Manager:  manager@crm.com / manager123');
  console.log('  Agent:    agent@crm.com / agent123');
};

seed();
