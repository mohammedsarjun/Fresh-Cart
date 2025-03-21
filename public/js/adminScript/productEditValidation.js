$(document).ready(() => {
  console.log('hgi');
  const submitProductForm = $('#submitProductForm');
  const editCategoryFormBtn = $('#edit-form-submit-btn');

  submitProductForm.click((e) => {
    // Prevent form submission

    const productName = $('#editProductName').val().trim();
    const productImage1 = document.getElementById('editProductImage1');
    const productImage2 = document.getElementById('editProductImage2');
    const productImage3 = document.getElementById('editProductImage3');
    const productDescription = $('#productEditDescription').val().trim();
    let checkboxes = document.querySelectorAll(
      'input[name="checkVarietyOption"]:checked'
    );
    let varietyGroup = document.querySelectorAll('.variety-group');

    if (checkboxes.length === 0) {
      e.preventDefault();
      $('#selectVarietyError').text('Select One Variety');
    } else {
      $('#selectVarietyError').text(''); // Hide error message if valid
    }
    // const productDescription = $("#productDescription").val().trim();
    // const productImage = $("#category-img")[0].files[0];

    if (varietyGroup.length == 0) {
      e.preventDefault();
      $('#varietyDetailError').text('Add atleast 1 variety');
    } else {
      $('#varietyDetailError').text('');
    }
    if (productName.length === 0) {
      e.preventDefault();
      $('#productNameError').text('Enter Product Name');
    } else {
      $('#productNameError').text('');
    }

    if (productDescription.length === 0) {
      e.preventDefault();
      $('#productDescriptionError').text('Enter Product Description');
    } else {
      $('#productDescriptionError').text('');
    }

    if (document.getElementById('editVarietyPrice').value.length == 0) {
      e.preventDefault();
      $('#varietyPriceError').text('Enter Price!');
    } else if (
      isNaN(document.getElementById('editVarietyPrice').value) ||
      document.getElementById('editVarietyPrice').value <= 0
    ) {
      e.preventDefault();
      $('#varietyPriceError').text('Price must be greater than zero.');
    } else {
      $('#varietyPriceError').text('');
    }
  });
});
