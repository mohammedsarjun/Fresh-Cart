async function addWishlist(productId, variety) {
  document.querySelector('body').style.overflow = 'hidden';
  document.querySelector('.loaderContainer').style.display = 'flex';
  const urlParams = new URLSearchParams(window.location.search);
  const grams = urlParams.get('grams');
  const ml = urlParams.get('ml');
  let isItem = false;

  if (variety == 'items') {
    isItem = true;
  }
  try {
    await fetch('/wishlist/addWishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: productId,
        variety: variety,
        varietyMeasurement: grams || ml || null,
        isItem: isItem,
      }), // Corrected JSON.stringify usage
    })
      .then((response) => response.json()) // Convert response to JSON
      .then((data) => {
        if (data.redirectTo && data.status == 401) {
          window.location.href = data.redirectTo; // Use the correct property
        }
        if (data.message) {
          document.querySelector('body').style.overflow = '';
          document.querySelector('.loaderContainer').style.display = 'none';
          addToWishlistNotification(data.message);
        }
      })
      .catch((error) => console.error('Error:', error));
  } catch (error) {
    console.log(error);
  }
  console.log(productId, variety, grams, ml, isItem);
}

function addToWishlistNotification(title) {
  Swal.fire({
    title: title,
    icon: 'success',
  });
}

async function deleteWishlist(productId, variety, varietyMeasurement) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to remove this item from your wishlist?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Call the function to delete the wishlist item here
      try {
        await fetch('/wishlist/deleteWishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            varietyMeasurement: varietyMeasurement,
            variety: variety,
          }),
        })
          .then((response) => response.json()) // Convert response to JSON
          .then((data) => {
            console.log(data);
            if (data.redirectTo) {
              window.location.href = data.redirectTo; // Use the correct property
            }
            if ((data.status = 200 && data.message)) {
              deleteWishlistNotification(data.message);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
            if ((data.status = 400 && data.error)) {
              deleteWishlistNotification(data.error);
            }
          })
          .catch((error) => console.error('Error:', error));
      } catch (error) {
        console.log(error);
      }
    }
  });

  async function deleteWishlistNotification(title) {
    Swal.fire({
      title: title,
      icon: 'success',
    });
  }
}

async function addCart(productId, varietyMeasurement, quantity, variety) {
  let isItem = false;
  if (variety == 'items') {
    isItem = true;
  }

  try {
    await fetch('/cart/addCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: productId,
        varietyMeasurement: varietyMeasurement,
        quantity: quantity,
        variety: variety,
        isItem: isItem,
      }),
    })
      .then((response) => response.json()) // Convert response to JSON
      .then((data) => {
        if ((data.status = 200 && data.message)) {
          addToCartNotification(data.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        if ((data.status = 400 && data.error)) {
          addToCartErrorNotification(data.error);
        }
      })
      .catch((error) => console.error('Error:', error));

    console.log(grams, ml, inputField.value, isItem);
  } catch (error) {
    console.log(error);
  }

  async function addToCartNotification(title) {
    Swal.fire({
      title: title,
      icon: 'success',
    });
  }

  async function addToCartErrorNotification(title) {
    Swal.fire({
      title: title,
      icon: 'error', // Change to "error"
      confirmButtonColor: '#d33', // Red color for error
    });
  }
}
