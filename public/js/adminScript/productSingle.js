async function productUnListAction(productId){
    Swal.fire({
        title: "Are you sure?",
        text: "you want to UnList this product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Unlist it!"
      }).then((result) => {
        if (result.isConfirmed) {
            const bodyContent={productId:productId}
            try{
            fetch("/admin/products/unListProduct",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyContent),
            }).then((response)=>response.json())
            .then((data)=>{
                if(data.message){
                    Swal.fire({
                        title: data.message,
                        text: "Product has been unlisted.",
                        icon: "success"
                      });
                      setTimeout(()=>{
                        location.reload()
                      },1000)
                      
                }
                else{
                    Swal.fire({
                        title: data.error,
                        text: "",
                        icon: "success"
                      });
                }
                
            })
        }catch (error) {
            console.error("An error occurred:", error);
        } 
        
        }
      });
}


async function productListAction(productId){
    Swal.fire({
        title: "Are you sure?",
        text: "you want to List this product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, list it!"
      }).then((result) => {
        if (result.isConfirmed) {
            const bodyContent={productId:productId}
            try{
            fetch("/admin/products/listProduct",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyContent),
            }).then((response)=>response.json())
            .then((data)=>{
                if(data.message){
                    Swal.fire({
                        title: data.message,
                        text: "Product has been listed.",
                        icon: "success"
                      });
                      setTimeout(()=>{
                        location.reload()
                      },1000)
                      
                }
                else{
                    Swal.fire({
                        title: data.error,
                        text: "",
                        icon: "success"
                      });
                }
                
            })
        }catch (error) {
            console.error("An error occurred:", error);
        } 
        
        }
      });
}

async function productDeleteAction(productId){
    
        Swal.fire({
          title: "Are you sure?",
          text: "you want to delete this Product?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, Delete it!"
        }).then((result) => {
          if (result.isConfirmed) {
              const bodyContent={productId:productId}
              try{
              fetch("/admin/products/delete",{
                  method: "delete",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(bodyContent),
              }).then((response)=>response.json())
              .then((data)=>{
                  if(data.message){
                      Swal.fire({
                          title: data.message,
                          text: "Product has been Deleted.",
                          icon: "success"
                        });
                        setTimeout(()=>{
                          window.location.href=data.redirectTo
                        },1000)
                        
                  }
                  else{
                      Swal.fire({
                          title: data.error,
                          text: "",
                          icon: "success"
                        });
                  }
                  
              })
            }catch (error) {
                console.error("An error occurred:", error);
            } 
          
          }
        });
      
        //create user
      }
      async function productEditAction(productId,productImg1,productImg2,productImg3,productName,availability,variety,perRate,productDescription){
        var myModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        myModal.show();
        document.getElementById('editProductName').value=productName
        document.getElementById('imagePreview1').src=productImg1
        document.getElementById('imagePreview2').src=productImg2
        document.getElementById('imagePreview3').src=productImg3
        
        if(variety!="items"){
          document.getElementById(`${variety}EditCheckbox`).checked=true
          toggleVarietyInput(variety)
          document.getElementById('editVarietyPrice').value=JSON.parse(perRate)
          window.varietyDetails.slice().reverse().forEach((varietyDetail) => {
            addVariety(variety, varietyDetail.varietyMeasurement, varietyDetail.varietyDiscount, varietyDetail.varietyStock);
        });
        
        }
        else{ 
          document.getElementById(`${variety}EditCheckbox`).checked=true
          toggleVarietyInput(variety)
          window.varietyDetails.forEach((varietyDetail)=>{
            addVariety(variety,varietyDetail.varietyPrice,varietyDetail.varietyDiscount,varietyDetail.itemStock)
          })
        }
        document.getElementById('productEditDescription').value=JSON.parse(productDescription)
      }

//clicking events

      function toggleVarietyInput(type) {

        let container = document.getElementById("varietyInputs");
        let checkbox = document.getElementById(type + "EditCheckbox");
        let units=document.querySelectorAll(".variety-check-input")
        let addVariety=document.querySelectorAll(".addVariety")
        addVariety.forEach(addVariety=>{
            if(!addVariety.id.includes(type)){
                document.getElementById(addVariety.id).remove();
            }
        })
        units.forEach(unit => {
            if(unit!=checkbox) {
                unit.checked=false
            }
        });
    
        if (checkbox.checked) {
            let divExist=document.getElementById(type + "Container") ||null
            
            
            if(!divExist){
                let div = document.createElement("div");
            div.setAttribute("id", type + "Container");
            div.classList.add("mb-3");
            div.classList.add("addVariety");
            div.innerHTML = `
            <label class="form-label">${type.toUpperCase()} Varieties:</label>
            ${type !== "items" ? `<input type="number" class="form-control" id="editVarietyPrice" required placeholder="Price per ${type.toUpperCase()}">` : ""}
              <p class="error-style w-100 text-center" id="varietyPriceError"></p>
            <div id="${type}Fields"></div>
            <button type="button" class="btn btn-primary btn-sm mt-2" onclick="addVariety('${type}')">+ Add Variety</button>
        `;
        
    
            container.appendChild(div);
            }
           
        } else {
            document.getElementById(type + "Container").remove();
        }
    }
    
    function addVariety(type,varietyMeasurement,varietyDiscount,varietyStock) {
        if(type!="items"){  
            let fieldsContainer = document.getElementById(type + "Fields");
            fieldsContainer.classList.add("field-container");
            fieldsContainer.insertAdjacentHTML("beforeend", '<p class="error-style w-100 text-center" id="varietyGroupError"></p>');
            let varietyCount = fieldsContainer.getElementsByClassName("variety-group").length;
        
            if (varietyCount >= 3) {
                alert("You can add up to 3 varieties only.");
                return;
            }
        
            let div = document.createElement("div");
            div.classList.add("row", "variety-group", "mt-2");
        
            div.innerHTML = `
           
               <span class="delete-icon d-flex align-items-center col-md-12 mt-3 mb-3"  onclick="removeVariety(event)"><i class="fa fa-trash"onclick="iRemoveVariety(event)"></i></span>
                
                <div class="col-md-4">
                <small>Enter ${type}</small>
                    <input type="number" class="form-control varietyMeasurement varietyInputs" name="${type}Variety" placeholder="Enter ${type} value (e.g., 500ml)" id="" value="${varietyMeasurement}">
                </div>
                
                 <div class="col-md-4">
                 <small>Enter Stock</small>
                    <input type="number" class="form-control varietyStock varietyInputs" name="${type}Stock" placeholder="Enter Stock"  id="" value="${varietyStock}">
                </div>
                 
            `;
        
            fieldsContainer.prepend(div);
        }
        else{
        
            let fieldsContainer = document.getElementById(type + "Fields");
            fieldsContainer.classList.add("field-container");
            fieldsContainer.insertAdjacentHTML("beforeend", '<p class="error-style w-100 text-center" id="varietyGroupError"></p>');
            let varietyCount = fieldsContainer.getElementsByClassName("variety-group").length;
        
            if (varietyCount >= 1) {
                alert("You can add only 1 varieties for items.");
                return;
            }
        
            let div = document.createElement("div");
            div.classList.add("row", "variety-group", "mt-2");
        
            div.innerHTML = `
           
               <span class="delete-icon d-flex align-items-center col-md-12 mt-3 mb-3"  onclick="removeVariety(event)"><i class="fa fa-trash"onclick="iRemoveVariety(event)"></i></span>
                
                <div class="col-md-4">
                    <input type="text" class="form-control itemPrice varietyInputs" name="${type}Variety" placeholder="Enter ${type} Price" value="${varietyMeasurement}">
                </div>
              
                <div class="col-md-4">
                    <input type="number" class="form-control itemStock varietyInputs" name="${type}Stock" placeholder="Enter Stock" value="${varietyStock}">
                </div>
            `;
        
            fieldsContainer.prepend(div);
        }
      
    }
    
    function removeVariety(e){
    e.target.parentElement.remove()
    }
    function iRemoveVariety(e){
        e.target.parentElement.parentElement.remove()
    }

    //picture upload handling
    function handleUserPicUpload(targetNum){
      if(targetNum==0){
       document.getElementById('imagePreview1').remove()
      }
      else if(targetNum==1){
        document.getElementById('imagePreview2').remove()
      }
      else if(targetNum==2){
        document.getElementById('imagePreview3').remove()
      }
    }
    

    $(document).ready(function () {
      let cropper;
  
      function setupCropper(inputId, previewId, cropButtonId, croppedPreviewId, removeButtonId, labelId) {
          const input = document.getElementById(inputId);
          const preview = document.getElementById(previewId);
          const cropButton = document.getElementById(cropButtonId);
          const croppedPreview = document.getElementById(croppedPreviewId);
          const removeButton = document.getElementById(removeButtonId);
          const label = document.getElementById(labelId);
  
          // When image is selected
          input.addEventListener("change", function (event) {
              const files = event.target.files;
              if (files && files.length > 0) {
                  const reader = new FileReader();
                  reader.onload = function (e) {
                      preview.src = e.target.result;
                      preview.style.display = "block";
                      cropButton.style.display = "inline-block";
                      removeButton.style.display = "inline-block";
                      label.style.display = "block";
  
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
          cropButton.addEventListener("click", function () {
              if (cropper) {
                  const canvas = cropper.getCroppedCanvas();
                  canvas.toBlob(function (blob) {
                      const file = new File([blob], `${inputId}_cropped.jpg`, { type: "image/jpeg" });
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      input.files = dataTransfer.files;
  
                      // Update cropped preview
                      const croppedImageURL = canvas.toDataURL("image/jpeg");
                      croppedPreview.src = croppedImageURL;
                      croppedPreview.style.display = "block";
  
                      // Hide crop button, original preview, and label
                      cropButton.style.display = "none";
                      preview.style.display = "none";
                      label.style.display = "none";
                  }, "image/jpeg");
  
                  // Destroy the cropper instance after cropping
                  cropper.destroy();
                  cropper = null;
              }
          });
  
          // When remove button is clicked
          removeButton.addEventListener("click", function () {
              input.value = ""; // Clear file input
              preview.style.display = "none";
              cropButton.style.display = "none";
              croppedPreview.style.display = "none";
              removeButton.style.display = "none";
              label.style.display = "none";
  
              if (cropper) {
                  cropper.destroy();
                  cropper = null;
              }
          });
      }
  
      // Setup cropper for the three image inputs
      setupCropper("editProductImage1", "cropPreview1", "cropImage1", "croppedImagePreview1", "removeImage1", "previewLabel1");
      setupCropper("editProductImage2", "cropPreview2", "cropImage2", "croppedImagePreview2", "removeImage2", "previewLabel2");
      setupCropper("editProductImage3", "cropPreview3", "cropImage3", "croppedImagePreview3", "removeImage3", "previewLabel3");
  });

  
  document.getElementById("productUpdateForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission
console.log("hi")
    let formData = new FormData();
    let varietyCheckInput = document.querySelectorAll(".variety-check-input");

    
    // Get the first checked variety
    let variety = [...varietyCheckInput]
        .filter(v => v.checked)
        .map(v => v.value)[0];
    formData.append("productId",$("#editProductId").val())
    formData.append("productName", $("#editProductName").val());
    formData.append("productCategory", $("#editSelectCategory").val());
    formData.append("productDescription", $("#productEditDescription").val());
   
    // Append files (Ensure they match Multer's expected field names)
    const image1 = document.getElementById('editProductImage1').files[0];
    const image2 = document.getElementById('editProductImage2').files[0];
    const image3 = document.getElementById('editProductImage3').files[0];
   
    if (image1) formData.append("editProductImageOne", image1);
    if (image2) formData.append("editProductImageTwo", image2);
    if (image3) formData.append("editProductImageThree", image3);

    // If variety is not "items", process variety details
    if (variety && variety !== "items") {
        let varietyMeasurement = Array.from(document.querySelectorAll(".varietyMeasurement"));
   
        let varietyStock = Array.from(document.querySelectorAll(".varietyStock"));

        let perUnitRate=document.getElementById("editVarietyPrice");
        formData.append("perUnitRate",perUnitRate)
        console.log(perUnitRate)
        let varietyValues = [...varietyCheckInput]
            .filter(v => v.checked)
            .map(v => v.value);
    
        formData.append("variety", JSON.stringify(varietyValues)); // Convert to JSON string
    
        let varietyDetails = [];
    console.log(varietyStock)
        for (let i = 0; i < varietyMeasurement.length; i++) {
            varietyDetails.push({
                varietyMeasurement: varietyMeasurement[i].value,
                varietyStock:varietyStock[i].value
            });
        }

        formData.append("varietyDetails", JSON.stringify(varietyDetails)); // Convert to JSON string
    
        let firstVariety = varietyValues[0]; // Get the first selected variety
        if (firstVariety) {
            formData.append(`pricePer${firstVariety}`, $("#editVarietyPrice").val()); // Add dynamically
        }
       ;
    } else {
        // If variety is "items", process item-specific details
        let itemPrice = document.querySelector(".itemPrice");

        let itemStock=document.querySelector(".itemStock")

        let varietyDetails = [];
        let varietyValues = [...varietyCheckInput]
            .filter(v => v.checked)
            .map(v => v.value);
            formData.append("variety", JSON.stringify(varietyValues));
   
    varietyDetails.push({
        varietyPrice: itemPrice.value,

        itemStock:itemStock.value
    });
 
      
   
    formData.append("varietyDetails", JSON.stringify(varietyDetails));
}
    

    try {
        let response = await fetch("/admin/products/editProduct", {
            method: "PUT",
            body: formData,
        });

        let result = await response.json();

        if (response.ok) {
            if(result.message){
                Swal.fire({
                    title: result.message,
                    text: "Product Edited.",
                    icon: "success"
                  });
                  setTimeout(()=>{
                    location.reload()
                  },1000)
                  
                  
            }
            else{
                Swal.fire({
                    title: result.error,
                    text: "",
                    icon: "success"
                  });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("selectVarietyError").innerText = "Failed to add product.";
    }
});