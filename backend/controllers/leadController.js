const Lead = require('../models/Lead');

exports.getLeads = async (req, res) => {
  try {
    const { status, source, type, search, assignedTo, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (type) query.type = type;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    if (req.user.role === 'agent') {
      query.assignedTo = req.user.id;
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('propertyInterest', 'title price')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('propertyInterest', 'title price address');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = new Lead({ ...req.body, assignedTo: req.user.id });
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.notes.push({ text: req.body.text, createdBy: req.user.id });
    lead.lastContact = new Date();
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const qualified = await Lead.countDocuments({ status: 'qualified' });
    const converted = await Lead.countDocuments({ status: 'converted' });
    const interested = await Lead.countDocuments({ status: 'interested' });

    res.json({ total, new: newLeads, qualified, converted, interested });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
