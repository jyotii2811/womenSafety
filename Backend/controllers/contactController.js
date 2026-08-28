const EmergencyContact = require('../models/EmergencyContact');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user._id });
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { name, phone, email, relation } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and phone required' });
    const contact = await EmergencyContact.create({ user: req.user._id, name, phone, email, relation });
    res.status(201).json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
