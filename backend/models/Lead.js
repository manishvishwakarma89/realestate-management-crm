const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  source: { type: String, enum: ['website', 'referral', 'social', 'direct', 'advertisement', 'other'], default: 'direct' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'interested', 'not_interested', 'converted', 'follow_up'], default: 'new' },
  type: { type: String, enum: ['buyer', 'seller', 'tenant', 'landlord', 'investor'], default: 'buyer' },
  budget: { type: Number },
  preferredLocation: { type: String },
  propertyInterest: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [{ text: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  lastContact: { type: Date },
  nextFollowUp: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
