$(document).ready(function () {
  let namePattern = /^[A-Za-z]+$/;
  let addressPattern = /^[A-Za-z0-9\s,.-]+$/;
  let zipPattern = /^[0-9]{5,10}$/;
  let submitAddressBtn = $('#submitAddAddressForm');

  submitAddressBtn.click((e) => {
    // First Name Validation
    if ($('#addAdressFirstName').val().trim().length === 0) {
      e.preventDefault();
      $('#addAdressFirstNameError').text('Enter your first name!');
    } else if (!namePattern.test($('#addAdressFirstName').val().trim())) {
      e.preventDefault();
      $('#addAdressFirstNameError').text('Enter a valid first name!');
    } else {
      $('#addAdressFirstNameError').text('');
    }

    // Last Name Validation
    if (
      $('#addAddressLastName').val().trim().length > 0 &&
      !namePattern.test($('#addAddressLastName').val().trim())
    ) {
      e.preventDefault();
      $('#addAddressLastNameError').text('Enter a valid last name!');
    } else {
      $('#addAddressLastNameError').text('');
    }

    if ($('#addAdressType').val().trim().length === 0) {
      e.preventDefault();
      $('#addAdressTypeError').text('Enter your Address Type');
    } else if (!namePattern.test($('#addAdressType').val().trim())) {
      e.preventDefault();
      $('#addAdressTypeError').text('Enter a valid Address Type!');
    } else {
      $('#addAdressTypeError').text('');
    }

    // Address Line 1 Validation
    if ($('#addAddressLine1').val().trim().length === 0) {
      e.preventDefault();
      $('#addAddressLine1Error').text('Address Line 1 is required!');
    } else if (!addressPattern.test($('#addAddressLine1').val().trim())) {
      e.preventDefault();
      $('#addAddressLine1Error').text('Enter a valid address!');
    } else {
      $('#addAddressLine1Error').text('');
    }

    // Address Line 2 Validation (Optional)
    if (
      $('#addAddressLine2').val().trim().length > 0 &&
      !addressPattern.test($('#addAddressLine2').val().trim())
    ) {
      e.preventDefault();
      $('#addAddressLine2Error').text('Enter a valid address!');
    } else {
      $('#addAddressLine2Error').text('');
    }

    // City Validation
    if ($('#addCity').val().trim().length === 0) {
      e.preventDefault();
      $('#addCityError').text('City is required!');
    } else if (!namePattern.test($('#addCity').val().trim())) {
      e.preventDefault();
      $('#addCityError').text('Enter a valid city name!');
    } else {
      $('#addCityError').text('');
    }

    // State Validation
    if ($('#addState').val().trim().length === 0) {
      e.preventDefault();
      $('#addStateError').text('State is required!');
    } else if (!namePattern.test($('#addState').val().trim())) {
      e.preventDefault();
      $('#addStateError').text('Enter a valid state name!');
    } else {
      $('#addStateError').text('');
    }

    // Country Validation
    if ($('#addCountry').val().trim().length === 0) {
      e.preventDefault();
      $('#addCountryError').text('Country is required!');
    } else if (!namePattern.test($('#addCountry').val().trim())) {
      e.preventDefault();
      $('#addCountryError').text('Enter a valid country name!');
    } else {
      $('#addCountryError').text('');
    }

    // Zip Code Validation
    if ($('#addZipCode').val().trim().length === 0) {
      e.preventDefault();
      $('#addZipCodeError').text('Zip Code is required!');
    } else if (!zipPattern.test($('#addZipCode').val().trim())) {
      e.preventDefault();
      $('#addZipCodeError').text('Enter a valid zip code!');
    } else {
      $('#addZipCodeError').text('');
    }
  });

  $('#addAddressForm').submit(async (e) => {
    e.preventDefault();
    console.log('hi');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    bodyContent = {
      addAdressFirstName: $('#addAdressFirstName').val(),
      addAddressLastName: $('#addAddressLastName').val(),
      addAddressType: $('#addAdressType').val(),
      addAddressLine1: $('#addAddressLine1').val(),
      addAddressLine2: $('#addAddressLine2').val(),
      addCity: $('#addCity').val(),
      addState: $('#addState').val(),
      addCountry: $('#addCountry').val(),
      addZipCode: $('#addZipCode').val(),
    };

    await fetch('/account/address/addAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          addressAddedNotification(data.message);
          loadingScreen.style.display = 'none';
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if (data.error) {
          addressAddedNotification(data.error);
          loadingScreen.style.display = 'none';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
  });
  async function addressAddedNotification(title) {
    Swal.fire({
      title: title,
      icon: 'success',
    });
  }

  $('#editAddressForm').submit(async (e) => {
    e.preventDefault();
    console.log('hi');
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
    bodyContent = {
      addressId: $('#addressId').val(),
      editAdressFirstName: $('#editAdressFirstName').val(),
      editAddressLastName: $('#editAddressLastName').val(),
      editAddressType: $('#editAdressType').val(),
      editAddressLine1: $('#editAddressLine1').val(),
      editAddressLine2: $('#editAddressLine2').val(),
      editCity: $('#editCity').val(),
      editState: $('#editState').val(),
      editCountry: $('#editCountry').val(),
      editZipCode: $('#editZipCode').val(),
    };

    await fetch('/account/address/editAddress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          addressAddedNotification(data.message);
          loadingScreen.style.display = 'none';
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if (data.error) {
          addressAddedNotification(data.error);
          loadingScreen.style.display = 'none';
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
  });
});
//set default address
async function setDefaultAddress(addressId, userId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to make this address your default?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, set as default',
    cancelButtonText: 'Cancel',
  }).then(async (result) => {
    const bodyContent = {
      addressId: addressId,
      userId: userId,
    };
    await fetch('/account/address/updateDefaultAddress', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          Swal.fire('Updated!', data.message, 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          // Call your function to update the default address
        }
      });
  });
}

//delete address

async function deleteAddress(addressId) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    const bodyContent = {
      addressId: addressId,
    };
    if (result.isConfirmed) {
      try {
        await fetch('/account/address/deleteAddress', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyContent),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              Swal.fire(
                data.message,
                'The address has been deleted.',
                'success'
              );
              setTimeout(() => {
                window.location.reload();
              }, 1000);
              // Call your function to update the default address
            }
          });
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  });
}

//delete address
