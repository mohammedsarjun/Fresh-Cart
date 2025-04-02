async function openCategoryModal() {
  var myModal = new bootstrap.Modal(document.getElementById('addProductModal'));
  myModal.show();
}
function toggleVarietyInput(type) {
  let container = document.getElementById('varietyInputs');
  let checkbox = document.getElementById(type + 'Checkbox');
  let units = document.querySelectorAll('.variety-check-input');
  let addVariety = document.querySelectorAll('.addVariety');

  addVariety.forEach((addVariety) => {
    if (!addVariety.id.includes(type)) {
      document.getElementById(addVariety.id).remove();
    }
  });
  units.forEach((unit) => {
    if (unit != checkbox) {
      unit.checked = false;
    }
  });

  if (checkbox.checked) {
    let divExist = document.getElementById(type + 'Container') || null;

    if (!divExist) {
      let div = document.createElement('div');
      div.setAttribute('id', type + 'Container');
      div.classList.add('mb-3');
      div.classList.add('addVariety');
      div.innerHTML = `
        <label class="form-label">${type.toUpperCase()} Varieties:</label>
        ${type !== 'items' ? `<input type="number" class="form-control" id="varietyPrice" required placeholder="Price per ${type.toUpperCase()}" step="0.01" min="0.5"> ` : ''}
          <p class="error-style w-100 text-center" id="varietyPriceError"></p>
        <div id="${type}Fields"></div>
        <button type="button" class="btn btn-primary btn-sm mt-2" onclick="addVariety('${type}')">+ Add Variety</button>
         <p class="error-style w-100 text-center" id="varietyDetailError"></p>
    `;

      container.appendChild(div);
    }
  } else {
    document.getElementById(type + 'Container').remove();
  }
}

window.addVariety = function (type) {
  if (type != 'items') {
    let fieldsContainer = document.getElementById(type + 'Fields');
    fieldsContainer.classList.add('field-container');
    fieldsContainer.insertAdjacentHTML(
      'beforeend',
      '<p class="error-style w-100 text-center" id="varietyGroupError"></p>'
    );
    let varietyCount =
      fieldsContainer.getElementsByClassName('variety-group').length;

    if (varietyCount >= 3) {
      alert('You can add up to 3 varieties only.');
      return;
    }

    let div = document.createElement('div');
    div.classList.add('row', 'variety-group', 'mt-2');

    div.innerHTML = `
       
           <span class="delete-icon d-flex align-items-center col-md-12 mt-3 mb-3"  onclick="removeVariety(event)"><i class="fa fa-trash"onclick="iRemoveVariety(event)"></i></span>
            
            <div class="col-md-4">
              <small>Enter ${type}</small>
                <input type="number" class="form-control varietyMeasurement varietyInputs" name="${type}Variety" placeholder="Enter ${type} value (e.g., 500ml)" id="" min="1">
            </div>
             <div class="col-md-4">
              <small>Enter Stock</small>
                <input type="number" class="form-control varietyStock varietyInputs" name="${type}Stock" placeholder="Enter Stock"  id="" min="0">
            </div>

            
             
        `;

    fieldsContainer.prepend(div);
    ('');
  } else {
    let fieldsContainer = document.getElementById(type + 'Fields');
    fieldsContainer.classList.add('field-container');
    let varietyCount =
      fieldsContainer.getElementsByClassName('variety-group').length;
    fieldsContainer.insertAdjacentHTML(
      'beforeend',
      '<p class="error-style w-100 text-center" id="varietyGroupError"></p>'
    );

    if (varietyCount >= 1) {
      alert('You can add only 1 varieties for items.');
      return;
    }

    let div = document.createElement('div');
    div.classList.add('row', 'variety-group', 'mt-2');

    div.innerHTML = `
       
           <span class="delete-icon d-flex align-items-center col-md-12 mt-3 mb-3"  onclick="removeVariety(event)"><i class="fa fa-trash"onclick="iRemoveVariety(event)"></i></span>
            
            <div class="col-md-4">
                <input type="text" class="form-control itemPrice varietyInputs" name="${type}Variety" placeholder="Enter ${type} Price" min="0.5">
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control itemStock varietyInputs" name="${type}Discount" placeholder="Enter Stock" min="0">
            </div>
        `;

    fieldsContainer.prepend(div);
    ('');
  }
};

function removeVariety(e) {
  e.target.parentElement.remove();
}
function iRemoveVariety(e) {
  e.target.parentElement.parentElement.remove();
}

//Image Validation
$(document).ready(function () {
  let cropper;

  function setupCropper(
    inputId,
    previewId,
    cropButtonId,
    croppedPreviewId,
    removeButtonId,
    labelId
  ) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const cropButton = document.getElementById(cropButtonId);
    const croppedPreview = document.getElementById(croppedPreviewId);
    const removeButton = document.getElementById(removeButtonId);
    const label = document.getElementById(labelId);

    // When image is selected
    input.addEventListener('change', function (event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
          cropButton.style.display = 'inline-block';
          removeButton.style.display = 'inline-block';
          label.style.display = 'block';

          if (cropper) {
            cropper.destroy();
          }

          cropper = new Cropper(preview, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 0.8,
          });
        };
        reader.readAsDataURL(files[0]);
      }
    });

    // When crop button is clicked
    cropButton.addEventListener('click', function () {
      if (cropper) {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob(function (blob) {
          const file = new File([blob], `${inputId}_cropped.jpg`, {
            type: 'image/jpeg',
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;

          // Update cropped preview
          const croppedImageURL = canvas.toDataURL('image/jpeg');
          croppedPreview.src = croppedImageURL;
          croppedPreview.style.display = 'block';

          // Hide crop button, original preview, and label
          cropButton.style.display = 'none';
          preview.style.display = 'none';
          label.style.display = 'none';
        }, 'image/jpeg');

        // Destroy the cropper instance after cropping
        cropper.destroy();
        cropper = null;
      }
    });

    // When remove button is clicked
    removeButton.addEventListener('click', function () {
      input.value = ''; // Clear file input
      preview.style.display = 'none';
      cropButton.style.display = 'none';
      croppedPreview.style.display = 'none';
      removeButton.style.display = 'none';
      label.style.display = 'none';

      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
    });
  }

  // Setup cropper for the three image inputs
  setupCropper(
    'productImage1',
    'cropPreview1',
    'cropImage1',
    'croppedImagePreview1',
    'removeImage1',
    'previewLabel1'
  );
  setupCropper(
    'productImage2',
    'cropPreview2',
    'cropImage2',
    'croppedImagePreview2',
    'removeImage2',
    'previewLabel2'
  );
  setupCropper(
    'productImage3',
    'cropPreview3',
    'cropImage3',
    'croppedImagePreview3',
    'removeImage3',
    'previewLabel3'
  );
});

document.addEventListener('DOMContentLoaded', function () {
  const dropdownItems = document.querySelectorAll('.category-item');
  const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
  const selectedCategoryInput = document.getElementById('selectedCategory');

  dropdownItems.forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      const selectedValue = this.getAttribute('data-value');
      categoryDropdownBtn.textContent = selectedValue; // Update button text
      selectedCategoryInput.value = selectedValue; // Update hidden input
    });
  });
});

document
  .getElementById('categoryForm')
  .addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    let formData = new FormData();
    let varietyCheckInput = document.querySelectorAll('.variety-check-input');

    // Get the first checked variety
    let variety = [...varietyCheckInput]
      .filter((v) => v.checked)
      .map((v) => v.value)[0];

    formData.append('productName', $('#productName').val());
    formData.append('productCategory', $('#selectCategory').val());
    formData.append('productDescription', $('#productDescription').val());

    // Append files (Ensure they match Multer's expected field names)
    const image1 = document.getElementById('productImage1').files[0];
    const image2 = document.getElementById('productImage2').files[0];
    const image3 = document.getElementById('productImage3').files[0];

    if (image1) formData.append('productImageOne', image1);
    if (image2) formData.append('productImageTwo', image2);
    if (image3) formData.append('productImageThree', image3);

    // If variety is not "items", process variety details
    if (variety && variety !== 'items') {
      let varietyMeasurement = Array.from(
        document.querySelectorAll('.varietyMeasurement')
      );
      let varietyDiscount = Array.from(
        document.querySelectorAll('.varietyDiscount')
      );
      let varietyStock = Array.from(document.querySelectorAll('.varietyStock'));

      let varietyValues = [...varietyCheckInput]
        .filter((v) => v.checked)
        .map((v) => v.value);

      formData.append('variety', JSON.stringify(varietyValues)); // Convert to JSON string

      let varietyDetails = [];

      for (let i = 0; i < varietyMeasurement.length; i++) {
        varietyDetails.push({
          varietyMeasurement: varietyMeasurement[i].value,
          varietyStock: varietyStock[i].value,
        });
      }

      formData.append('varietyDetails', JSON.stringify(varietyDetails)); // Convert to JSON string

      let firstVariety = varietyValues[0]; // Get the first selected variety
      if (firstVariety) {
        formData.append(`pricePer${firstVariety}`, $('#varietyPrice').val()); // Add dynamically
      }
    } else {
      // If variety is "items", process item-specific details
      let itemPrice = document.querySelector('.itemPrice');

      let itemStock = document.querySelector('.itemStock');

      let varietyDetails = [];
      let varietyValues = [...varietyCheckInput]
        .filter((v) => v.checked)
        .map((v) => v.value);
      formData.append('variety', JSON.stringify(varietyValues));

      varietyDetails.push({
        varietyPrice: itemPrice.value,
        itemStock: itemStock.value,
      });

      formData.append('varietyDetails', JSON.stringify(varietyDetails));
    }

    console.log([...formData.entries()]); // Debugging: Log FormData content
    try {
      console.log('hi');
      let response = await fetch('/admin/products/addProducts', {
        method: 'POST',
        body: formData,
      });

      let result = await response.json();

      if (response.ok) {
        console.log("resposne is ok")
        if (result.message) {
          Swal.fire({
            title: result.message,
            text: 'Product Added.',
            icon: 'success',
          });
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          Swal.fire({
            title: result.error,
            text: '',
            icon: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('selectVarietyError').innerText =
        'Failed to add product.';
    }
  });

window.onload = function () {
  const searchInput = document.getElementById('user-search');
  const urlParams = new URLSearchParams(window.location.search);

  // Check if 'search' parameter exists, then remove it from the URL
  if (urlParams.has('search')) {
    searchInput.value = ''; // Clear input field
    history.replaceState(null, '', window.location.pathname); // Remove query params without reloading
  }
};
async function userSearch() {
  const querySearch = document.getElementById('user-search').value;
  if (userSearch) {
    window.location.href = `/admin/customers?search=${querySearch}`;
  }
}
