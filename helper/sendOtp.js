const resend = require('../services/otpSender');

const sendOTPEmail = async (recipient, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'freshcart@sarjun.online',
      to: recipient,
      subject: 'Your OTP Verification Code',
      html: `<strong>Your OTP is: ${otp}</strong>`,
    });

    if (error) {
      console.error('Error sending OTP email through Resend:', error);
      return;
    }

  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

module.exports = sendOTPEmail;

