async function customerBlockAction(userId){
    Swal.fire({
        title: "Are you sure?",
        text: "you want to block this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Block it!"
      }).then((result) => {
        if (result.isConfirmed) {
            const bodyContent={userId:userId}
            try{
            fetch("/admin/customers/block",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyContent),
            }).then((response)=>response.json())
            .then((data)=>{
                if(data.message){
                    Swal.fire({
                        title: data.message,
                        text: "Use has been Blocked.",
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

async function customerUnblockAction(userId){
    Swal.fire({
        title: "Are you sure?",
        text: "you want to Unblock this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Unblock it!"
      }).then((result) => {
        if (result.isConfirmed) {
            const bodyContent={userId:userId}
            try{
            fetch("/admin/customers/unblock",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyContent),
            }).then((response)=>response.json())
            .then((data)=>{
                if(data.message){
                    Swal.fire({
                        title: data.message,
                        text: "Use has been UnBlocked.",
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

function openEditModal(id, firstName,secondName,email, phone) {
  document.getElementById('customerId').value=id
  document.getElementById('firstName').value = firstName;
  document.getElementById('lastName').value = secondName;
  document.getElementById('email').value = email;
  document.getElementById('phone').value = phone;

  // Show modal
  var editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
  editModal.show();
}

function openCreateUserModal() {
  // Show modal
  var editModal = new bootstrap.Modal(document.getElementById('createUserModal'));
  editModal.show();
}


document.getElementById('userForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent form submission
const bodyContent={
  userId:document.getElementById('customerId').value,
  firstName : document.getElementById('firstName').value,
  secondName : document.getElementById('lastName').value,
  email : document.getElementById('email').value,
  phone : document.getElementById('phone').value,
}


  try {
      const response = await fetch(`/admin/customers/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyContent)
      });

      const data = await response.json();

      if (response.ok) {
        if(data.message){
          otpVerifyNotification(data.message)
          setTimeout(()=>{
            location.reload()
          },1000)
        }
           // Refresh page to show updated user details
      } else {
          alert(data.error);
      }
  } catch (error) {
      console.log(error);
  }
});


async function otpVerifyNotification(title){
  Swal.fire({
    title: title,
    icon: "success"
  });
}
//delete user
function deleteUser(userId) {
  Swal.fire({
    title: "Are you sure?",
    text: "you want to delete this user?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
        const bodyContent={userId:userId}
        fetch("/admin/customers/delete",{
            method: "delete",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyContent),
        }).then((response)=>response.json())
        .then((data)=>{
            if(data.message){
                Swal.fire({
                    title: data.message,
                    text: "Use has been Deleted.",
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
    
    }
  });

  //create user
}
 async function createUser(event){
  event.preventDefault();

const bodyContent={
firstName:document.getElementById("cfirstName").value,
secondName:document.getElementById("clastName").value,
email:document.getElementById("cemail").value,
phone:document.getElementById("cphone").value,
password:document.getElementById("cpassword").value
}
try{
  fetch("/admin/customers/createUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyContent)
  })
  .then(response => response.json())
  .then(data => {
    if(data.message){
      Swal.fire({
          title: data.message,
          text: "User Added.",
          icon: "success"
        });
        setTimeout(()=>{
          location.reload()
        },1000)
        
  } else {
          Swal.fire({
            title: data.error,
            text: "",
            icon: "error",
            confirmButtonColor: "#d33"
        });
         // Show success message
          // Refresh the page
      }
  })
  .catch(error => {
      console.error("Error adding customer:", error);
      alert("Failed to add customer!");
  });
}catch (error) {
  console.error("An error occurred:", error);
} 
 } 

  //user Search
  window.onload = function () {
    const searchInput = document.getElementById("user-search");
    const urlParams = new URLSearchParams(window.location.search);

    // Check if 'search' parameter exists, then remove it from the URL
    if (urlParams.has("search")) {
        searchInput.value = ""; // Clear input field
        history.replaceState(null, "", window.location.pathname); // Remove query params without reloading
    }
};
  async function userSearch(){
     const querySearch=document.getElementById('user-search').value
     if(userSearch){
      window.location.href=`/admin/customers?search=${querySearch}`
     }
  }

