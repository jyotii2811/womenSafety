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

const sendEmail = async (to, subject, html, attachments = []) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('EMAIL not configured — skipping email to', to);
    return { skipped: true };
  }
  try {
    await transporter.sendMail({
      from: `"Women Safety App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log('Email sent to', to);
  } catch (err) {
    console.error('Email failed to', to, ':', err.message);
    // Don't throw — SOS must succeed even if email fails
  }
};

exports.triggerSOS = async (req, res) => {
  try {
    const { lat, lng, address, photoData1, photoData2, photoData, videoData } = req.body;
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

    // Community Safety Broadcast ("Help Her"): Notify other active users in the system
    try {
      const User = require('../models/User');
      const nearbyUsers = await User.find({ _id: { $ne: req.user._id }, isActive: true }).select('_id');
      const communityNotifs = nearbyUsers.map((u) => ({
        user: u._id,
        message: `🚨 COMMUNITY EMERGENCY: ${req.user.name || 'A user'} is in danger near your location! Please check and render help if safe.`,
        type: 'community_sos',
      }));
      if (communityNotifs.length > 0) {
        await Notification.insertMany(communityNotifs);
      }
    } catch (communityErr) {
      console.warn('Community alert dispatch warning:', communityErr.message);
    }

    // Build email attachments for 2 automatic photo snapshots & 1 video clip
    const attachments = [];
    let photoHtmlSection = '';
    let videoHtmlSection = '';

    const firstPhoto = photoData1 || photoData;
    const secondPhoto = photoData2;

    if (firstPhoto && typeof firstPhoto === 'string') {
      const base64Photo1 = firstPhoto.includes(';base64,') ? firstPhoto.split(';base64,')[1] : firstPhoto;
      attachments.push({
        filename: 'emergency_snapshot_1.jpg',
        content: base64Photo1,
        encoding: 'base64',
        cid: 'emergency_photo1_cid',
      });
    }

    if (secondPhoto && typeof secondPhoto === 'string') {
      const base64Photo2 = secondPhoto.includes(';base64,') ? secondPhoto.split(';base64,')[1] : secondPhoto;
      attachments.push({
        filename: 'emergency_snapshot_2.jpg',
        content: base64Photo2,
        encoding: 'base64',
        cid: 'emergency_photo2_cid',
      });
    }

    if (firstPhoto || secondPhoto) {
      photoHtmlSection = `
        <div style="margin-top:20px;background-color:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;text-align:center;">
          <h4 style="margin:0 0 12px 0;color:#991b1b;font-size:15px;">📸 Auto-Captured Emergency Snapshots (2 Photos)</h4>
          <div style="display:inline-block;max-width:100%;">
            ${firstPhoto ? `<img src="cid:emergency_photo1_cid" alt="Snapshot 1" style="max-width:48%;height:auto;border-radius:6px;border:2px solid #dc2626;margin:4px;" />` : ''}
            ${secondPhoto ? `<img src="cid:emergency_photo2_cid" alt="Snapshot 2" style="max-width:48%;height:auto;border-radius:6px;border:2px solid #dc2626;margin:4px;" />` : ''}
          </div>
        </div>
      `;
    }

    if (videoData && typeof videoData === 'string') {
      const base64Video = videoData.includes(';base64,') ? videoData.split(';base64,')[1] : videoData;
      attachments.push({
        filename: 'emergency_video_clip.webm',
        content: base64Video,
        encoding: 'base64',
      });
      videoHtmlSection = `
        <div style="margin-top:16px;background-color:#fff1f2;border:1px solid #fda4af;border-radius:8px;padding:14px;text-align:center;">
          <p style="margin:0;font-size:14px;color:#9f1239;font-weight:bold;">🎥 Auto-Recorded 4s Emergency Video Attached!</p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#475569;">Please download and view the attached <code>emergency_video_clip.webm</code> file in this email.</p>
        </div>
      `;
    }

    // Send personalized, beautifully formatted email to each contact
    const emailPromises = contacts
      .filter((c) => c.email)
      .map((contact) => {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:20px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(220,38,38,0.15);border:1px solid #fecaca;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg, #dc2626, #b91c1c);padding:24px;text-align:center;">
                        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px;">🚨 URGENT SOS EMERGENCY ALERT</h1>
                        <p style="color:#fef2f2;margin:6px 0 0 0;font-size:14px;font-weight:500;">Women Safety & Distress Response System</p>
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="padding:28px 24px;">
                        <p style="font-size:16px;color:#1e293b;margin:0 0 16px 0;line-height:1.5;">
                          Dear <strong>${contact.name || 'Emergency Contact'}</strong>,
                        </p>
                        <p style="font-size:16px;color:#991b1b;background-color:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;margin:0 0 20px 0;border-radius:4px;font-weight:600;">
                          ⚠️ <strong>${req.user.name || 'A user'}</strong> has just triggered an EMERGENCY SOS DISTRESS SIGNAL and needs immediate assistance!
                        </p>

                        <!-- User Details Card -->
                        <table role="presentation" width="100%" style="background-color:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #e2e8f0;">
                          <tr>
                            <td style="font-size:14px;color:#475569;padding:4px 0;">👤 <strong>Sender Name:</strong> <span style="color:#0f172a;font-weight:600;">${req.user.name || 'Not provided'}</span></td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;color:#475569;padding:4px 0;">📧 <strong>Sender Email:</strong> <a href="mailto:${req.user.email}" style="color:#2563eb;text-decoration:none;font-weight:600;">${req.user.email}</a></td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;color:#475569;padding:4px 0;">📞 <strong>Sender Phone:</strong> <span style="color:#0f172a;font-weight:600;">${req.user.phone || 'Not provided in profile'}</span></td>
                          </tr>
                          <tr>
                            <td style="font-size:14px;color:#475569;padding:4px 0;">⏰ <strong>Alert Time:</strong> <span style="color:#0f172a;font-weight:600;">${new Date().toLocaleString()}</span></td>
                          </tr>
                        </table>

                        <!-- Location Box -->
                        <div style="background-color:#fff1f2;border:1px solid #fda4af;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
                          <h3 style="margin:0 0 8px 0;color:#9f1239;font-size:16px;">📍 Last Known GPS Coordinates</h3>
                          <p style="margin:0 0 14px 0;font-size:14px;color:#881337;word-break:break-word;">
                            <strong>${locationText}</strong>
                          </p>
                          ${mapLink ? `
                            <a href="${mapLink}" target="_blank" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                              🗺️ VIEW LIVE LOCATION ON GOOGLE MAPS ↗
                            </a>
                          ` : '<p style="color:#9f1239;font-size:13px;margin:0;">(GPS coordinates were not accessible at the moment of trigger)</p>'}
                        </div>

                        ${photoHtmlSection}
                        ${videoHtmlSection}

                        <!-- Actionable Steps -->
                        <p style="font-size:14px;color:#334155;margin:20px 0 10px 0;font-weight:600;">What you should do right now:</p>
                        <ol style="font-size:13px;color:#475569;margin:0 0 20px 0;padding-left:20px;line-height:1.6;">
                          <li>Try calling <strong>${req.user.name}</strong> immediately at ${req.user.phone ? `<strong>${req.user.phone}</strong>` : 'their phone number'}.</li>
                          <li>Check their live GPS location via the Google Maps button above.</li>
                          <li>Contact local emergency services (Dial <strong>112</strong> / <strong>1091</strong>) if you are unable to reach them.</li>
                        </ol>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:12px;color:#64748b;">
                          This is an automated safety alert generated by the <strong>Women Safety Emergency System</strong>.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        return sendEmail(
          contact.email,
          `🚨 URGENT SOS ALERT: ${req.user.name || 'Emergency Alert'} needs immediate help!`,
          emailHtml,
          attachments
        );
      });

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

const fs = require('fs');
const path = require('path');

exports.uploadMedia = async (req, res) => {
  try {
    const { photoData, videoData } = req.body;
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let photoUrl = null;
    let videoUrl = null;
    const timestamp = Date.now();
    const baseUrl = process.env.SERVER_URL ? process.env.SERVER_URL.replace(/\/$/, '') : `${req.protocol}://${req.get('host')}`;

    if (photoData && typeof photoData === 'string') {
      const photoFileName = `photo_${req.user._id}_${timestamp}.jpg`;
      const base64Data = photoData.includes(';base64,') ? photoData.split(';base64,')[1] : photoData;
      fs.writeFileSync(path.join(uploadsDir, photoFileName), base64Data, 'base64');
      photoUrl = `${baseUrl}/uploads/${photoFileName}`;
    }

    if (videoData && typeof videoData === 'string') {
      const videoFileName = `video_${req.user._id}_${timestamp}.webm`;
      const base64Data = videoData.includes(';base64,') ? videoData.split(';base64,')[1] : videoData;
      fs.writeFileSync(path.join(uploadsDir, videoFileName), base64Data, 'base64');
      videoUrl = `${baseUrl}/uploads/${videoFileName}`;
    }

    res.json({ success: true, photoUrl, videoUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
