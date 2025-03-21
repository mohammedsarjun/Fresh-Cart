$(document).ready(() => {
  const submitbtn = $('.submit-btn');
  submitbtn.click((e) => {
    //password

    if ($('#newPassword').val().length < 8) {
      e.preventDefault();
      $('#passwordError').text('Password must be at least 8 characters long.');
    } else if (/\s/.test($('#newPassword').val())) {
      e.preventDefault();
      $('#passwordError').text('Password Should Not Contain Spaces.');
    } else if (!/(?=.*[a-z])/.test($('#newPassword').val())) {
      e.preventDefault();
      $('#passwordError').text(
        'Password must contain at least one lowercase letter.'
      );
    } else if (!/(?=.*[A-Z])/.test($('#newPassword').val())) {
      e.preventDefault();
      $('#passwordError').text(
        'Password must contain at least one uppercase letter.'
      );
    } else if (!/(?=.*\d)/.test($('#newPassword').val())) {
      e.preventDefault();
      $('#passwordError').text('Password must contain at least one digit.');
    } else if (!/(?=.*[@$!%*?&#])/.test($('#newPassword').val())) {
      e.preventDefault();
      $('#passwordError').text(
        'Password must contain at least one special character (@, $, !, %, *, ?, &).'
      );
    } else {
      $('#passwordError').text('');
    }

    //confirm password validation
    if ($('#confirmPassword').val().length == 0) {
      e.preventDefault();
      $('#newPasswordError').text('Enter Confirm password');
    } else if ($('#newPassword').val() != $('#confirmPassword').val()) {
      e.preventDefault();
      $('#newPasswordError').text("Entered password doesn't match !");
    } else {
      $('#newPasswordError').text('');
    }
  });

  $('#changePasswordForm').on('submit', async (e) => {
    e.preventDefault();
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'block';
    let newPassword = $('#newPassword').val();
    newPassword = { newPassword: newPassword };
    try {
      await fetch('/auth/changePasswords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPassword),
      })
        .then((data) => data.json())
        .then((data) => {
          if (data) {
            passwordChangedNotification(data.message);
            setTimeout(() => {
              window.location.href = data.redirectTo;
            }, 2000);
          }
        });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
});

async function passwordChangedNotification(title) {
  Swal.fire({
    title: title,
    icon: 'success',
  });
}
