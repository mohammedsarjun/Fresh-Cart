$(document).ready(() => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const userExist = params.get('message') || null;
  if (userExist) {
    $('#userExistError').text(userExist);
  }

  $('#sign-up-form').on('submit', async (e) => {
    e.preventDefault();
    let referralCode = $('#referralCode').val();
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'block';
    let userDetails = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      email: $('#email').val(),
      phone: $('#phone').val(),
      password: $('#password').val(),
      referralCode: referralCode || null,
    };
    // Send the form data using fetch
    try {
      await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            loadingScreen.style.display = 'none';
            Swal.fire({
              toast: true,
              position: 'top-end', // Position at bottom-right
              icon: 'error',
              title: data.error,
              showConfirmButton: false,
              timer: 3000, // Auto close after 3 seconds
            });
          } else if (data.redirectTo) {
            location.href = data.redirectTo;
          }
        });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
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
