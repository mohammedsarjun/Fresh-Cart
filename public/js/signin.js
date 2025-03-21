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
      await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyContent),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.issue == "USER DIDN'T VERIFY") {
            signinVerifyModal(data.message);
          }
          if (data.redirectTo) {
            window.location.href = data.redirectTo;
          }
        });
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
});

//user didnt verify modal
async function signinVerifyModal(message) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success ms-3',
      cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: message,
      text: 'Do you want to verify your account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Verify!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/auth/otp';
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        window.location.href = '/auth/signin';
      }
    });
}
