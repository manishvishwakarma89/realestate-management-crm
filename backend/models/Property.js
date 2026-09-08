const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['apartment', 'house', 'villa', 'land', 'commercial', 'office'], required: true },
  status: { type: String, enum: ['available', 'sold', 'reserved', 'pending'], default: 'available' },
  price: { type: Number, required: true },
  area: { type: Number, required: true },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  parking: { type: Number, default: 0 },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  features: [{ type: String }],
  images: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  listedBy: { type: String, enum: ['direct', 'agent', 'company'], default: 'agent' },
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
