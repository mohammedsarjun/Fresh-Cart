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
                'The address has been deleted',
                'success'
              );
              setTimeout(() => {
                window.location.href = '/cart/checkout';
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

function openAddAdressModal() {
  console.log('hi');
  var myModal = new bootstrap.Modal(document.getElementById('addAddressModal'));

  myModal.show();
}

function openEditAddressModal(
  addressId,
  addressType,
  firstName,
  lastName,
  addressLine1,
  addressLine2,
  city,
  state,
  country,
  zipCode
) {
  var myModal = new bootstrap.Modal(
    document.getElementById('editAddressModal')
  );
  myModal.show();
  $('#addressId').val(addressId);
  $('#editAdressFirstName').val(firstName);
  $('#editAddressLastName').val(lastName);
  $('#editAddressType').val(addressType);
  $('#editAddressLine1').val(addressLine1);
  $('#editAddressLine2').val(addressLine2);
  $('#editCity').val(city);
  $('#editState').val(state);
  $('#editCountry').val(country);
  $('#editZipCode').val(zipCode);
}

async function placeOrder() {
  if(document.querySelector(
    'input[name="selectedAddress"]:checked'
  )==null){
  return  Swal.fire({
      toast: true,
      position: 'top-end', // Position at bottom-right
      icon: 'error',
      title: "Add Address to Place Order",
      showConfirmButton: false,
      timer: 3000, // Auto close after 3 seconds
    });
  }
  const selectedAddress = document.querySelector(
    'input[name="selectedAddress"]:checked'
  ).value;
  const selectedPayment = document.querySelector(
    'input[name="selectedPayement"]:checked'
  ).value;


  let bodyContent = {
    selectedAddress: selectedAddress,
    selectedPayment: selectedPayment,
  };
  try {
    await fetch('/cart/placeOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.redirectTo) {
          window.location.href = data.redirectTo;

          // Call your function to update the default address
        }
      });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function placeOrderWithWallet(amount) {

  if(document.querySelector(
    'input[name="selectedAddress"]:checked'
  )==null){
  return  Swal.fire({
      toast: true,
      position: 'top-end', // Position at bottom-right
      icon: 'error',
      title: "Add Address to Place Order",
      showConfirmButton: false,
      timer: 3000, // Auto close after 3 seconds
    });
  }

  
  const selectedAddress = document.querySelector(
    'input[name="selectedAddress"]:checked'
  ).value;
  const selectedPayment = document.querySelector(
    'input[name="selectedPayement"]:checked'
  ).value;
  let bodyContent = {
    amount,
    selectedAddress: selectedAddress,
    selectedPayment: selectedPayment,
  };
  try {
    await fetch('/cart/placeOrderWithWallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyContent),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
        }
        if (data.error) {
          Swal.fire(data.error, ' ', 'error');
        }
      });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

const razorPayRadio = document.getElementById('razorpay-radio');
const cashOnDelivery = document.getElementById('cashonDelivery');
const wallet = document.getElementById('wallet-radio');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const placeOrderBtnWithOnline = document.getElementById(
  'placeOrderBtnWithOnline'
);
const placeOrderBtnWithWallet = document.getElementById(
  'placeOrderBtnWithWallet'
);
razorPayRadio.addEventListener('change', () => {
  if (razorPayRadio.checked) {
    console.log(window.totalPrice);
    placeOrderBtn.style.display = 'none';
    placeOrderBtnWithWallet.classList.add('placeOrderW');
    placeOrderBtnWithOnline.classList.remove('placeOrderW');
  }
});

cashOnDelivery.addEventListener('change', () => {
  if (cashOnDelivery.checked) {
    console.log('asd');
    placeOrderBtnWithOnline.classList.add('placeOrderW');
    placeOrderBtnWithWallet.classList.add('placeOrderW');
    placeOrderBtn.style.display = 'block';
  }
});

wallet.addEventListener('change', () => {
  if (wallet.checked) {
    console.log('punda');
    placeOrderBtn.style.display = 'none';
    placeOrderBtnWithOnline.classList.add('placeOrderW');
    placeOrderBtnWithWallet.classList.remove('placeOrderW');
  }
});

//redeem coupon

async function redeemCoupon(e) {
  e.preventDefault();
  let couponCode = document.getElementById('couponCode').value;
  try {
    await fetch('/cart/verifyCoupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ couponCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          Swal.fire(data.message, data.text, 'success');

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if (data.error) {
          Swal.fire(data.error, data.text, 'error');
        }
      });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function removeCoupon(e) {
  e.preventDefault();
  let couponCode = document.getElementById('couponCode').value;
  try {
    await fetch('/cart/removeCoupon', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ couponCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          Swal.fire(data.message, data.text, 'success');

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if (data.error) {
          Swal.fire(data.error, data.text, 'error');
        }
      });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
