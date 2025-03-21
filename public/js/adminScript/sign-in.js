$(document).ready(() => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const errorMessage = params.get('message') || null;
  if (errorMessage) {
    $('#errorMessage').text(errorMessage);
  }
  $('#sign-in-form').on('submit', async (e) => {
    e.preventDefault();
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'block';
    let bodyContent = {
      email: $('#email').val(),
      password: $('#password').val(),
    };
    try {
      await fetch('/admin/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyContent),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.redirectTo) {
            window.location.href = data.redirectTo;
          }
        });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
});
