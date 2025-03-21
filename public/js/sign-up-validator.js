$(document).ready(() => {
  let submitbtn = $('.submit-btn');
  let namePattern = /^[A-Za-z]+$/;
  let emailPattern = /^\w+[@][a-z]{1,}[.][a-z|A-Z]*$/;
  let phonePattern = /^[0-9]{10}$/;
  //Form Validation--------------------------------
  submitbtn.click((e) => {
    //firstName
    if ($('#firstName').val().length == 0) {
      e.preventDefault();
      $('#firstNameError').text('Enter your name !');
    } else if ($('#firstName').val().trim().length == 0) {
      e.preventDefault();
      $('#firstNameError').text('name should not be blank');
    } else if (!namePattern.test($('#firstName').val().trim())) {
      e.preventDefault();
      $('#firstNameError').text('Enter Your Name Properly!');
    } else {
      $('#firstName').val($('#firstName').val().trim());
      $('#firstNameError').text('');
    }

    //lastName
    if ($('#lastName').val().length == 0) {
      e.preventDefault();
      $('#secondNameError').text('Enter your name !');
    } else if ($('#lastName').val().trim().length == 0) {
      e.preventDefault();
      $('#secondNameError').text('name should not be blank');
    } else if (!namePattern.test($('#lastName').val().trim())) {
      e.preventDefault();
      $('#secondNameError').text('Enter Your Name Properly!');
    } else {
      $('#lastName').val($('#lastName').val().trim());
      $('#secondNameError').text('');
    }

    //email
    if ($('#email').val().length == 0) {
      e.preventDefault();
      $('#emailError').text('Enter Your Email !');
    } else if (!emailPattern.test($('#email').val())) {
      e.preventDefault();
      $('#emailError').text('Enter Your Email Properly !');
    } else {
      $('#email').val($('#email').val().trim());
      $('#emailError').text('');
    }

    //phone
    $('#phone').val($('#phone').val().trim());
    if ($('#phone').val().length == 0) {
      e.preventDefault();
      $('#phoneError').text('Enter Your Phone Number !');
    } else if (!phonePattern.test($('#phone').val())) {
      e.preventDefault();
      $('#phoneError').text('Enter a Valid 10-Digit Phone Number!');
    } else {
      $('#phoneError').text('');
    }

    //password

    if ($('#password').val().length < 8) {
      e.preventDefault();
      $('#passwordError').text('Password must be at least 8 characters long.');
    } else if (/\s/.test($('#password').val())) {
      e.preventDefault();
      $('#passwordError').text('Password Should Not Contain Spaces.');
    } else if (!/(?=.*[a-z])/.test($('#password').val())) {
      e.preventDefault();
      $('#passwordError').text(
        'Password must contain at least one lowercase letter.'
      );
    } else if (!/(?=.*[A-Z])/.test($('#password').val())) {
      e.preventDefault();
      $('#passwordError').text(
        'Password must contain at least one uppercase letter.'
      );
    } else if (!/(?=.*\d)/.test($('#password').val())) {
      e.preventDefault();
      $('#passwordError').text('Password must contain at least one digit.');
    } else if (!/(?=.*[@$!%*?&#])/.test($('#password').val())) {
      e.preventDefault();
      $('#passwordError').text(
        'Password must contain at least one special character (@, $, !, %, *, ?, &).'
      );
    } else {
      $('#passwordError').text('');
    }
  });
});
