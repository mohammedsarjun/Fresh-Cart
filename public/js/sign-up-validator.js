$(document).ready(() => {
  let submitbtn = $('.submit-btn');
  let referralPattern = /^[a-zA-Z0-9]{6}$/;
  let namePattern = /^[A-Za-z]+$/;
  let emailPattern = /^\w+[@][a-z]{1,}[.][a-z|A-Z]*$/;
  let phonePattern = /^[0-9]{10}$/;

  function validateInput(input, pattern, errorElement, errorMessage) {
    let value = input.val().trim();
    console.log(input);
    if (value.length === 0 && input != '#referralCode') {
      errorElement.text(errorMessage);
      return false;
    } else if (!pattern.test(value)) {
      errorElement.text(errorMessage);
      return false;
    } else {
      errorElement.text('');
      input.val(value);
      return true;
    }
  }

  function validateReferralInput(input, pattern, errorElement, errorMessage) {
    let value = input.val().trim();
    console.log(input);
    if (value.length === 0) {
      errorElement.text('');
      input.val(value);
      return true;
    } else if (!pattern.test(value)) {
      errorElement.text(errorMessage);
      return false;
    } else {
      errorElement.text('');
      input.val(value);
      return true;
    }
  }

  function validatePassword() {
    let password = $('#password').val();
    let errorElement = $('#passwordError');

    if (password.length < 8) {
      errorElement.text('Password must be at least 8 characters long.');
      return false;
    } else if (/\s/.test(password)) {
      errorElement.text('Password should not contain spaces.');
      return false;
    } else if (!/(?=.*[a-z])/.test(password)) {
      errorElement.text('Password must contain at least one lowercase letter.');
      return false;
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errorElement.text('Password must contain at least one uppercase letter.');
      return false;
    } else if (!/(?=.*\d)/.test(password)) {
      errorElement.text('Password must contain at least one digit.');
      return false;
    } else if (!/(?=.*[@$!%*?&#])/.test(password)) {
      errorElement.text(
        'Password must contain at least one special character (@, $, !, %, *, ?, &).'
      );
      return false;
    } else {
      errorElement.text('');
      return true;
    }
  }

  function validatePhone() {
    let phone = $('#phone').val().trim();
    let errorElement = $('#phoneError');

    if (phone.length === 0) {
      errorElement.text('Enter Your Phone Number!');
      return false;
    } else if (!phonePattern.test(phone)) {
      errorElement.text('Enter a valid 10-digit phone number!');
      return false;
    } else {
      errorElement.text('');
      $('#phone').val(phone);
      return true;
    }
  }

  submitbtn.click((e) => {
    let isValid = true;

    if (
      !validateInput(
        $('#firstName'),
        namePattern,
        $('#firstNameError'),
        'Enter Your Name Properly!'
      )
    )
      isValid = false;
    if (
      !validateInput(
        $('#lastName'),
        namePattern,
        $('#secondNameError'),
        'Enter Your Name Properly!'
      )
    )
      isValid = false;
    if (
      !validateInput(
        $('#email'),
        emailPattern,
        $('#emailError'),
        'Enter Your Email Properly!'
      )
    )
      isValid = false;
    if (
      !validateReferralInput(
        $('#referralCode'),
        referralPattern,
        $('#referralCodeError'),
        'Referral code must be 6 characters long and contain only letters and numbers.'
      )
    )
      isValid = false;
    if (!validatePhone()) isValid = false;
    if (!validatePassword()) isValid = false;

    if (!isValid) e.preventDefault();
  });

  // Remove errors dynamically when the user types valid input
  $('#firstName, #lastName').on('keyup', function () {
    validateInput(
      $(this),
      namePattern,
      $('#' + this.id + 'Error'),
      'Enter Your Name Properly!'
    );
  });

  $('#email').on('keyup', function () {
    validateInput(
      $(this),
      emailPattern,
      $('#emailError'),
      'Enter Your Email Properly!'
    );
  });

  $('#phone').on('keyup', function () {
    validatePhone();
  });

  $('#password').on('keyup', function () {
    validatePassword();
  });

  $('#referralCode').on('keyup', function () {
    validateReferralInput(
      $(this),
      referralPattern,
      $('#referralCodeError'),
      'Referral code must be at least 6 characters long and contain only letters and numbers.'
    );
  });
});
