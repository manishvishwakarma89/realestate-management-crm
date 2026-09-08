const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  type: { type: String, enum: ['buyer', 'seller', 'owner', 'tenant', 'vendor', 'other'], default: 'buyer' },
  address: { type: String },
  profession: { type: String },
  annualIncome: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  notes: [{ text: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  lastInteraction: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
