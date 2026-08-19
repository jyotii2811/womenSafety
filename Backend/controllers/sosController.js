const SOSAlert = require('../models/SOSAlert');
const EmergencyContact = require('../models/EmergencyContact');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || user === 'your_email@gmail.com') return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('EMAIL not configured — skipping email to', to);
    return { skipped: true };
  }
  try {
    await transporter.sendMail({ from: `"Women Safety App" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log('Email sent to', to);
  } catch (err) {
    console.error('Email failed to', to, ':', err.message);
    // Don't throw — SOS must succeed even if email fails
  }
};

exports.triggerSOS = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const contacts = await EmergencyContact.find({ user: req.user._id });

    const locationText = address || (lat && lng ? `${lat}, ${lng}` : 'Location not available');
    const mapLink = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

    const alert = await SOSAlert.create({
      user: req.user._id,
      location: { lat, lng, address },
      notifiedContacts: contacts.map((c) => c._id),
    });

    await Notification.create({ user: req.user._id, message: 'SOS Alert triggered!', type: 'sos' });
    await ActivityLog.create({ user: req.user._id, action: 'SOS_TRIGGERED', details: `Alert ID: ${alert._id}` });

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#dc2626;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:white;margin:0;">🚨 SOS EMERGENCY ALERT</h1>
        </div>
        <div style="background:#fff7f7;padding:24px;border:1px solid #fecaca;border-radius:0 0 8px 8px;">
          <p style="font-size:16px;"><strong>${req.user.name}</strong> has triggered an emergency SOS alert!</p>
          <p style="font-size:14px;color:#555;">📧 Their email: <strong>${req.user.email}</strong></p>
          ${req.user.phone ? `<p style="font-size:14px;color:#555;">📞 Phone: <strong>${req.user.phone}</strong></p>` : ''}
          <div style="background:#fee2e2;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0;font-size:14px;">📍 <strong>Location:</strong> ${locationText}</p>
            ${mapLink ? `<a href="${mapLink}" style="display:inline-block;margin-top:10px;background:#dc2626;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:bold;">Open in Google Maps</a>` : ''}
          </div>
          <p style="font-size:13px;color:#888;">🕐 Time: ${new Date().toLocaleString()}</p>
          <p style="font-size:14px;color:#dc2626;font-weight:bold;">Please respond immediately or contact emergency services!</p>
        </div>
      </div>
    `;

    // Send emails in parallel, don't await all — SOS response is priority
    const emailPromises = contacts
      .filter((c) => c.email)
      .map((c) => sendEmail(c.email, `🚨 SOS Alert from ${req.user.name}`, emailHtml));

    Promise.allSettled(emailPromises); // fire and forget

    res.status(201).json({
      success: true,
      alert,
      emailsSent: contacts.filter((c) => c.email).length,
      message: contacts.length === 0
        ? 'SOS triggered but no emergency contacts found. Please add contacts!'
        : `SOS triggered. Notifying ${contacts.length} contact(s).`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelAlert = async (req, res) => {
  try {
    const alert = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
