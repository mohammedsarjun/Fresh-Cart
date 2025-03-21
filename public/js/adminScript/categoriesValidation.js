$(document).ready(() => {
  const submitCategoryForm = $('#submitCategoryForm');
  const editCategoryFormBtn = $('#edit-form-submit-btn');

  const categoryPattern = /^[a-zA-Z0-9]+(?:[\s-_][a-zA-Z0-9]+)*$/;

  submitCategoryForm.click((e) => {
    // Prevent form submission

    const categoryName = $('#categoryName').val().trim();
    const categoryDescription = $('#categoryDescription').val().trim();
    const categoryImage = $('#category-img')[0].files[0];

    console.log('Category Name:', categoryName);

    if (categoryName.length === 0) {
      e.preventDefault();
      $('#categoryNameError').text('Enter Category Name');
    } else if (!categoryPattern.test(categoryName)) {
      e.preventDefault();
      $('#categoryNameError').text(
        'Category name can only contain letters, numbers, spaces, hyphens (-), or underscores (_). It must start and end with a letter or number.'
      );
    } else {
      $('#categoryNameError').text('');
    }

    if (categoryDescription.length === 0) {
      e.preventDefault();
      $('#categoryDescriptionError').text('Enter Category Description');
    } else if (!categoryPattern.test(categoryDescription)) {
      e.preventDefault();
      $('#categoryDescriptionError').text(
        'Category description can only contain letters, numbers, spaces, hyphens (-), or underscores (_). It must start and end with a letter or number.'
      );
    } else {
      $('#categoryDescriptionError').text('');
    }

    if (!categoryImage) {
      e.preventDefault();
      $('#categoryImgError').text('Upload category Image!');
    } else {
      $('#categoryImgError').text('');
    }
  });

  editCategoryFormBtn.click((e) => {
    const categoryName = $('#ecategoryName').val().trim();
    const categoryDescription = $('#ecategoryDescription').val().trim();
    const categoryImage = $('#category-img')[0].files[0];

    if (categoryName.length === 0) {
      e.preventDefault();
      $('#ecategoryNameError').text('Enter Category Name');
    } else if (!categoryPattern.test(categoryName)) {
      e.preventDefault();
      $('#ecategoryNameError').text(
        'Category name can only contain letters, numbers, spaces, hyphens (-), or underscores (_). It must start and end with a letter or number.'
      );
    } else {
      $('#ecategoryNameError').text('');
    }

    if (categoryDescription.length === 0) {
      e.preventDefault();
      $('#ecategoryDescriptionError').text('Enter Category Description');
    } else if (!categoryPattern.test(categoryDescription)) {
      e.preventDefault();
      $('#ecategoryDescriptionError').text(
        'Category description can only contain letters, numbers, spaces, hyphens (-), or underscores (_). It must start and end with a letter or number.'
      );
    } else {
      $('#ecategoryDescriptionError').text('');
    }
  });
});
