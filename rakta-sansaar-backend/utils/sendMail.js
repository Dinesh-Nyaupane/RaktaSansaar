const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your email address
    pass: process.env.EMAIL_PASS,  // App password (NOT your Gmail password)
  },
});

/**
 * Send email
 * @param {string} to - recipient email
 * @param {string} subject - subject line
 * @param {string} text - plain text fallback
 * @param {string} html - (optional) HTML content
 */
const sendMail = async (to, subject, text, html = '') => {
  try {
    const info = await transporter.sendMail({
      from: `"Rakta Sansaar 🩸" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html, // ✨ Add HTML version
    });

    console.log('📧 Email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendMail;
