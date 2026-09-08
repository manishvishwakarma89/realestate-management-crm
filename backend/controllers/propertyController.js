const Property = require('../models/Property');

exports.getProperties = async (req, res) => {
  try {
    const { status, type, city, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (req.user.role === 'agent') {
      query.assignedTo = req.user.id;
    }

    const properties = await Property.find(query)
      .populate('assignedTo', 'name email')
      .populate('owner', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(query);

    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('owner', 'name email phone');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    property.views += 1;
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const property = new Property({ ...req.body, owner: req.user.id, assignedTo: req.user.id });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Property.countDocuments();
    const available = await Property.countDocuments({ status: 'available' });
    const sold = await Property.countDocuments({ status: 'sold' });
    const totalValue = await Property.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, value: { $sum: '$price' } } }
    ]);

    res.json({
      total,
      available,
      sold,
      pending: total - available - sold,
      totalValue: totalValue[0]?.value || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
