$(document).ready(() => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const wrongOtp = params.get('message') || null;
  if (wrongOtp) {
    $('#wrong-otp-error').text(wrongOtp);
  }
  const otpPattern = /^[0-9]{6}$/;
  const submitbtn = $('.submit-btn');
  const resendOtp = $('#resendOtp');
  const verifyOtp = $('#verifyOtp');
  submitbtn.click((e) => {
    const otp = $('#otp-value').val();

    if (!otp) {
      e.preventDefault();
      $('#otpError').text('Enter Your OTP !');
    } else if (!otpPattern.test(otp)) {
      e.preventDefault();
      $('#otpError').text('Invalid OTP! It should be exactly 6 digits.');
    } else {
      $('#otpError').text('');
    }
  });

  resendOtp.click(async () => {
    let otpEmail = { otpEmail: window.otpEmail };
    popNotification('OTP RESENT!');
    await fetch('/auth/resendOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpEmail),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
        }
      });
  });

  verifyOtp.on('submit', async (e) => {
    e.preventDefault();
    let enteredOtp = $('#otp-value').val();
    enteredOtp = { enteredOtp: enteredOtp };
    try {
      await fetch('/auth/otpVerify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enteredOtp),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.redirectTo && data.statusCode == 200) {
            otpVerifyNotification(data.message);
            setTimeout(() => {
              window.location.href = data.redirectTo;
            }, 2000);
          } else if (data.redirectTo && data.statusCode == 400) {
            window.location.href = data.redirectTo;
          }
        });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });

  async function popNotification(notification) {
    Swal.fire({
      toast: true,
      position: 'top-end', // Position: 'top', 'top-start', 'top-end', 'center', etc.
      icon: 'info', // Icon: 'success', 'error', 'warning', 'info', 'question'
      title: notification,
      showConfirmButton: false,
      timer: 3000, // Auto-dismiss after 3 seconds
      timerProgressBar: true, // Shows a timer progress bar
      background: '#f1f1f1', // Optional: Customize background color
      color: '#000', // Optional: Customize text color
    });
  }
});
//otp verify
async function otpVerifyNotification(title) {
  Swal.fire({
    title: title,
    icon: 'success',
  });
}
