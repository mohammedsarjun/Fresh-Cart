$(document).ready(() => {
    const submitProductForm = $("#submitProductForm");
    const editCategoryFormBtn=$("#edit-form-submit-btn")
    
   ;

    submitProductForm.click((e) => {
      
        // Prevent form submission

        const productName = $("#productName").val().trim();
        const productImage1=document.getElementById("productImage1")
        const productImage2=document.getElementById("productImage2")
        const productImage3=document.getElementById("productImage3")
        const productDescription = $("#productDescription").val().trim();;
        let checkboxes = document.querySelectorAll('input[name="checkVarietyOption"]:checked');
        let varietyGroup=document.querySelectorAll(".variety-group")
       
        if (checkboxes.length === 0) { 
           
            e.preventDefault();
            $("#selectVarietyError").text("Select One Variety");
        } else {
            $("#selectVarietyError").text(""); // Hide error message if valid
        }
        // const productDescription = $("#productDescription").val().trim();
        // const productImage = $("#category-img")[0].files[0];

        if(varietyGroup.length==0){
            e.preventDefault();
            $("#varietyDetailError").text("Add atleast 1 variety");
        }
        else{
            $("#varietyDetailError").text("");
        }
        if (productName.length === 0) {
            e.preventDefault();
            $("#productNameError").text("Enter Product Name");
        } else {
            $("#productNameError").text("");
        }


        if (!productImage1.files.length) {
            e.preventDefault(); // Stop form submission
            $("#picOneError").text("Enter Product Pic 1")
        } else {
            $("#picOneError").text("")// Clear error if image is selected
        }

        if (!productImage2.files.length) {
            e.preventDefault(); // Stop form submission
            $("#picTwoError").text("Enter Product Pic 2")
            
        } else {
            $("#picTwoError").text("")// Clear error if image is selected
        }

        if (!productImage3.files.length) {
            e.preventDefault(); // Stop form submission
            $("#picThreeError").text("Enter Product Pic 3")
            
        } else {
            $("#picThreeError").text("")// Clear error if image is selected
        }

        if (productDescription.length === 0) {
            e.preventDefault();
            $("#productDescriptionError").text("Enter Product Description");
        } else {
            $("#productDescriptionError").text("");
        }

        document.querySelectorAll(".field-container").forEach(group => {
            group.querySelectorAll(".varietyInputs").forEach(input => {
                ; // Select the corresponding error span
                if (input.value.trim() === "" && input.classList != "") {
                    $("#varietyGroupError").text("Enter required Fields") 
                 
                } else {
                    $("#varietyGroupError").text(""); // Clear error message if valid
                }
            });
        });
        

        if (document.getElementById("varietyPrice").value.length==0) {
            e.preventDefault();
            $("#varietyPriceError").text("Enter Price!");
        } else if(isNaN(document.getElementById("editVarietyPrice").value) || document.getElementById("editVarietyPrice").value <= 0){
            e.preventDefault();
            $("#varietyPriceError").text("Price must be greater than zero.");
        }
        else {
            $("#varietyPriceError").text("");
        }
        
      
    });

    
 

    editCategoryFormBtn.click((e)=>{
        const categoryName = $("#ecategoryName").val().trim();
        const categoryDescription = $("#ecategoryDescription").val().trim();
        const categoryImage = $("#category-img")[0].files[0];

        if (categoryName.length === 0) {
            e.preventDefault();
            $("#ecategoryNameError").text("Enter Category Name");
        } else if (!categoryPattern.test(categoryName)) {
            e.preventDefault();
            $("#ecategoryNameError").text("Category name can only contain letters, numbers, spaces, hyphens (-), or underscores (_). It must start and end with a letter or number.");
        } else {
            $("#ecategoryNameError").text("");
        }

        if (categoryDescription.length === 0) {
            e.preventDefault();
            $("#ecategoryDescriptionError").text("Enter Category Description");
        } else if (!categoryPattern.test(categoryDescription)) {
            e.preventDefault();
            $("#ecategoryDescriptionError").text("Category description can only contain letters, numbers, spaces, hyphens (-), or underscores (_). It must start and end with a letter or number.");
        } else {
            $("#ecategoryDescriptionError").text("");
        }

    })
});
