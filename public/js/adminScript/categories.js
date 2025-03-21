function openCategoryModal() {
  var myModal = new bootstrap.Modal(
    document.getElementById('addCategoryModal')
  );
  myModal.show();
}

document
  .getElementById('categoryForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();
    const categoryName = document.getElementById('categoryName').value;
    const categoryDescription = document.getElementById(
      'categoryDescription'
    ).value;
    const categoryImage = document.getElementById('category-img').files[0];
    if (categoryName && categoryDescription && categoryImage) {
      const formData = new FormData();
      formData.append('categoryName', categoryName); // Add text data
      formData.append('categoryDescription', categoryDescription); // Add text data
      formData.append('categoryImage', categoryImage); // Add the image file

      try {
        const response = await fetch('/admin/categories/addCategories', {
          method: 'POST',
          body: formData, // Send FormData, NOT JSON
        });

        const data = await response.json();
        if (data.message) {
          categoryAddedNotification(data.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          categoryErrorNotification(data.error);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error('Error inserting category:', error);
      }

      // Close the modal after form submission
      var myModal = bootstrap.Modal.getInstance(
        document.getElementById('addCategoryModal')
      );
      myModal.hide();

      // Optionally, reset the form
      document.getElementById('categoryForm').reset();
    } else if (categoryImage == undefined) {
      e.preventDefault();
      console.log(!categoryImage);
      $('#categoryImgError').text('Upload category Image!');
    }
  });

async function categoryUnpublishAction(categoryId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'you want to Unpublish this category?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Unpublish it!',
  }).then((result) => {
    if (result.isConfirmed) {
      const bodyContent = { categoryId: categoryId };
      try {
        fetch('/admin/categories/unPublish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyContent),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              Swal.fire({
                title: data.message,
                text: 'category has been unpublished.',
                icon: 'success',
              });
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              Swal.fire({
                title: data.error,
                text: '',
                icon: 'success',
              });
            }
          });
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  });
}

async function categoryPublishAction(categoryId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'you want to publish this category?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Publish it!',
  }).then((result) => {
    if (result.isConfirmed) {
      const bodyContent = { categoryId: categoryId };
      try {
        fetch('/admin/categories/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyContent),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              Swal.fire({
                title: data.message,
                text: 'category has been published.',
                icon: 'success',
              });
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              Swal.fire({
                title: data.error,
                text: '',
                icon: 'success',
              });
            }
          });
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  });
}

async function openEditModal(
  categoryId,
  categoryName,
  categoryDescription,
  categoryImage
) {
  document.getElementById('ecategoryId').value = categoryId;
  document.getElementById('ecategoryName').value = categoryName;
  document.getElementById('ecategoryDescription').value = categoryDescription;
  document.getElementById('categoryEditImg').src = categoryImage;

  var editModal = new bootstrap.Modal(
    document.getElementById('editCategoryModal')
  );
  editModal.show();
}
//update category
$('#editCategoryForm').on('submit', async (e) => {
  e.preventDefault();
  console.log(document.getElementById('ecategoryImage').files[0]);

  const formData = new FormData();
  formData.append('categoryId', $('#ecategoryId').val());
  formData.append('categoryName', $('#ecategoryName').val()); // Add text data
  formData.append('categoryDescription', $('#ecategoryDescription').val()); // Add text data
  formData.append(
    'categoryImage',
    document.getElementById('ecategoryImage').files[0]
  );

  try {
    fetch('/admin/categories/updatecategory', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          Swal.fire({
            title: data.message,
            text: 'Category has been updated.',
            icon: 'success',
          });
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          categoryErrorNotification(data.error);
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      });
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

//category delete
async function categoryDeleteAction(categoryId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'you want to delete this Category?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      const bodyContent = { categoryId: categoryId };
      try {
        fetch('/admin/categories/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyContent),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              Swal.fire({
                title: data.message,
                text: 'Category has been Deleted.',
                icon: 'success',
              });
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              categoryErrorNotification(data.error);
              setTimeout(() => {
                location.reload();
              }, 2000);
            }
          });
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  });
}

async function categoryAddedNotification(title) {
  Swal.fire({
    title: title,
    icon: 'success',
  });
}

async function categoryErrorNotification(errorMessage) {
  Swal.fire({
    title: 'Error',
    text: errorMessage,
    icon: 'error',
  });
}

//user Search
window.onload = function () {
  const searchInput = document.getElementById('category-search');
  const urlParams = new URLSearchParams(window.location.search);

  // Check if 'search' parameter exists, then remove it from the URL
  if (urlParams.has('search')) {
    searchInput.value = ''; // Clear input field
    history.replaceState(null, '', window.location.pathname); // Remove query params without reloading
  }
};
