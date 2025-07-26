const nodemailer = require('nodemailer'); // Using nodemailer to send emails

// Create a transporter object using SMTP (you can configure your email provider)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // App password from .env
  },
});

// Function to send a welcome email
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: '"Rakta Sansaar" <no-reply@rakta-sansaar.com>',
    to: toEmail, // Corrected this line from userEmail to toEmail
    subject: 'Welcome to Rakta Sansaar!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Rakta Sansaar</title>
          <style>
              body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; }
              .email-container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
              .header { text-align: center; padding: 20px; }
              .header h1 { color: #3498db; font-size: 36px; margin: 0; }
              .content { margin-top: 20px; font-size: 16px; line-height: 1.5; color: #333; }
              .cta-button { display: inline-block; padding: 12px 20px; background-color: #3498db; color: #fff; font-weight: bold; text-decoration: none; border-radius: 5px; margin-top: 20px; text-align: center; }
              .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #777; }
              .footer a { color: #3498db; text-decoration: none; }
              .footer p { margin: 5px 0; }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <h1>Welcome to Rakta Sansaar!</h1>
                  <p style="font-size: 18px; color: #555;">Dear ${userName},</p>
              </div>
              <div class="content">
                  <p>Thank you for joining Rakta Sansaar, where we help connect people in need of blood with donors nearby. We are excited to have you onboard!</p>
                  <p>As a member, you can:</p>
                  <ul>
                      <li>Search for blood donors based on your location.</li>
                      <li>Request blood donations when needed.</li>
                      <li>And much more to help save lives!</li>
                  </ul>
                  <p>We encourage you to <a href="http://localhost:5500/login" class="cta-button">log in now</a> and start exploring the platform!</p>
              </div>
              <div class="footer">
                  <p>If you have any questions or need support, feel free to <a href="mailto:support@rakta-sansaar.com">contact us</a>.</p>
                  <p>Best regards, <br> The Rakta Sansaar Team</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions); // Send the email
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

module.exports = { sendWelcomeEmail };
