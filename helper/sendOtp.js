const transporter = require('../services/otpSender');

const sendOTPEmail = async (recipient, otp) => {
  const mailOptions = await {
    from: process.env.NODE_MAILER_EMAIL,
    to: recipient,
    subject: 'Your OTP Verification Code',
    text: `Your OTP is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

module.exports = sendOTPEmail;
