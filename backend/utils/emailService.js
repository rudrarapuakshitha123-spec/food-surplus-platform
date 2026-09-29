const nodemailer = require('nodemailer');

// Reuse a single transporter instance
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const baseWrapper = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    <div style="background:#15803d; padding: 20px; color:#fff;">
      <h2 style="margin:0;">🥗 ${title}</h2>
    </div>
    <div style="padding: 24px; color:#111827;">
      ${bodyHtml}
    </div>
    <div style="background:#f0fdf4; padding: 12px 24px; font-size: 12px; color:#4b5563;">
      Smart Food Surplus Platform — reducing waste, feeding communities.
    </div>
  </div>
`;

// Sends an email; failures are logged but never thrown, so email issues
// never block the core reservation/listing flow.
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured — skipping email send.');
      return;
    }
    await transporter.sendMail({
      from: `"Food Surplus Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendNewListingEmail = (to, listing) => {
  const html = baseWrapper(
    'New Food Available Near You!',
    `<p>A new listing was just posted in your area (<strong>${listing.areaCode}</strong>):</p>
     <p style="font-size:18px; font-weight:700;">${listing.title}</p>
     <p>${listing.description}</p>
     <p><strong>Quantity:</strong> ${listing.quantity} ${listing.unit}<br/>
        <strong>Expires:</strong> ${new Date(listing.expiresAt).toLocaleString()}</p>
     <p>Log in to the platform to reserve it before it's gone.</p>`
  );
  return sendEmail(to, `New food surplus posted: ${listing.title}`, html);
};

const sendReservationEmail = (to, listingTitle, recipientName) => {
  const html = baseWrapper(
    'Your Listing Was Reserved',
    `<p><strong>${recipientName}</strong> just reserved your listing:</p>
     <p style="font-size:18px; font-weight:700;">${listingTitle}</p>
     <p>Log in to confirm the pickup details.</p>`
  );
  return sendEmail(to, `Reservation received for: ${listingTitle}`, html);
};

module.exports = { sendEmail, sendNewListingEmail, sendReservationEmail };
