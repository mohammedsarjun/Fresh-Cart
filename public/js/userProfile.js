
let namePattern = /^[A-Za-z]+$/;
let lastNamePattern=/^(?:[A-Za-z]+)?$/
let emailPattern = /^\w+[@][a-z]{1,}[.][a-z|A-Z]*$/;
let submitbtn = $("#submitEditUserForm");
let phonePattern = /^[0-9]{10}$/;
let changePasswordSumbitBtn=$("#passwordSaveChangeBtn")

//validation for edit User
submitbtn.click((e) => {
if ($("#editFirstName").val().length == 0) {
    e.preventDefault();
    $("#editFirstNameError").text("Enter your name !");
  } else if ($("#editFirstName").val().trim().length == 0) {
    e.preventDefault();
    $("#editFirstNameError").text("name should not be blank");
  } else if (!namePattern.test($("#editFirstName").val().trim())) {
    e.preventDefault();
    $("#editFirstNameError").text("Enter Your Name Properly!");
  } else {
    $("#editFirstName").val($("#editFirstName").val().trim());
    $("#editFirstNameError").text("");
  }


  if (!lastNamePattern.test($("#editLastName").val().trim())) {
    e.preventDefault();
    $("#editLastNameError").text("Enter Your Name Properly!");
  } else {
    $("#editLastName").val($("#editLastName").val().trim());
    $("#editLastNameError").text("");
  }


if ($("#editEmail").val().length == 0) {
    e.preventDefault();
    $("#editEmailError").text("Enter Your Email !");
  }else if (!emailPattern.test($("#editEmail").val())) {
    e.preventDefault();
    $("#editEmailError").text("Enter Your Email Properly !");
  } else {
      $("#editEmail").val($("#editEmail").val().trim());
    $("#editEmailError").text("");
  }




    if ($("#editPhone").val().length == 0) {
        e.preventDefault();
        $("#editPhoneError").text("Enter Your Phone Number !");
      }else if (!phonePattern.test($("#editPhone").val())) {
        e.preventDefault();
        $("#editPhoneError").text("Enter a Valid 10-Digit Phone Number!");
      } else {
        $("#editPhone").val($("#editPhone").val().trim())
        $("#editPhoneError").text("");
      }
    })
function openEditUserModal(id,firstName,secondName,email,phone) {
    var myModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    myModal.show();
    $("#userId").val(id)
    $("#editFirstName").val(firstName)
    $("#editLastName").val(secondName)
    $("#editEmail").val(email)
    $("#editPhone").val(phone)

  }




document.getElementById("editUserModal").addEventListener("submit", async function (event) {

  event.preventDefault();
  const loadingScreen = document.getElementById("loading-screen");
            loadingScreen.style.display = "block";
  const bodyContent={
    userId:$("#userId").val(),
    firstName:$("#editFirstName").val(),
    secondName:$("#editLastName").val(),
    email:$("#editEmail").val(),
    phone: $("#editPhone").val()
  }
  try{
 await fetch("/account/settings/editUserData", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyContent),
}).then((response) => response.json())
.then((data) => {
  if(data.message&&data.redirectTo){
    userUpdatedNotification(data.message)
    loadingScreen.style.display = "none";
    setTimeout(()=>{
    if (data.redirectTo) {
      window.location.href = data.redirectTo;
    }
  },1000)
  }
  if(data.error){
    userUpdateErrorNotification(data.error)
    loadingScreen.style.display = "none";
    setTimeout(()=>{
      window.location.reload()
    },2000)
    
  }
  
});
  }catch (error) {
    console.error("An error occurred:", error);
} 
});
async function userUpdatedNotification(title){
  Swal.fire({
    title: title,
    icon: "success"
  });
}

async function userUpdateErrorNotification(title) {
  Swal.fire({
    title: title,
    icon: "error", // Change icon to "error"
    confirmButtonColor: "#d33" // Red color for the button
  });
}
//change password

//password validation
changePasswordSumbitBtn.click((e) => {
  console.log("bi")
if ($('#changeNewPassword').val().length < 8) {
  e.preventDefault()
  $('#newPasswordChangingError').text("Password must be at least 8 characters long.");
}
else if(/\s/.test($('#changeNewPassword').val())){
  e.preventDefault()
  $('#newPasswordChangingError').text("Password Should Not Contain Spaces.");
}

else if (!/(?=.*[a-z])/.test($('#changeNewPassword').val())) {
  e.preventDefault()
  $('#newPasswordChangingError').text("Password must contain at least one lowercase letter.");
}

else if (!/(?=.*[A-Z])/.test($('#changeNewPassword').val())) {
  e.preventDefault()
  $('#newPasswordChangingError').text("Password must contain at least one uppercase letter.");
}

else if (!/(?=.*\d)/.test($('#changeNewPassword').val())) {
  e.preventDefault()
  $('#newPasswordChangingError').text("Password must contain at least one digit.");
}

else if (!/(?=.*[@$!%*?&#])/.test($('#changeNewPassword').val())) {
  e.preventDefault()
  $('#newPasswordChangingError').text("Password must contain at least one special character (@, $, !, %, *, ?, &).");
}

else{
  $('#newPasswordChangingError').text("");
}


if ($('#changeCurrentPassword').val().length < 8) {
  e.preventDefault()
  $('#currentPasswordChangingError').text("Password must be at least 8 characters long.");
}
else if(/\s/.test($('#changeCurrentPassword').val())){
  e.preventDefault()
  $('#currentPasswordChangingError').text("Password Should Not Contain Spaces.");
}

else{
  
  $('#currentPasswordChangingError').text("");
}
})


//updating password

$("#changePasswordForm").submit(async (e) => {
  e.preventDefault();
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "block";
  bodyContent = {newPassword:$("#changeNewPassword").val(),currentPassword:$("#changeCurrentPassword").val()}
    try{
    await fetch("/account/changePassword", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyContent)
    }).then((response) => response.json())
    .then((data) => {
      if(data.message){
        userUpdatedNotification(data.message)
        loadingScreen.style.display = "none";
        setTimeout(()=>{
        if (data.redirectTo) {
          window.location.reload();
        }
      },1000)
      }
      if(data.error){
        userUpdateErrorNotification(data.error)
        loadingScreen.style.display = "none";
        setTimeout(()=>{
          window.location.reload()
        },2000)
        
      }
      
    });
  }catch (error) {
    console.error("An error occurred:", error);
} 
  
})

//reset passoword

$("#resetPasswordBtn").on("click",async (e)=>{
  e.preventDefault()
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.style.display = "block";
  await fetch("/account/settings/changePassword", {
    method: "GET"
}).then((response) => response.json())
.then((data) => {
  if(data.redirectTo){
      window.location.href=data.redirectTo;
  }
});

})