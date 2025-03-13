async function saveCoupon(e){
    try {
        e.preventDefault()
        console.log("dshjkbhdsjabhjasbdfhfjbs")
        let couponName=document.getElementById("couponName").value
        let discountPercentage=document.getElementById("discountPercentage").value
        let startDate=document.getElementById("startDate").value
        let expiryDate=document.getElementById("expiryDate").value
        let minPurchase=document.getElementById("minPurchase").value
        let maxDiscount=document.getElementById("maxDiscount").value
        let bodyContent={
            couponName,
            discountPercentage,
            startDate,
            expiryDate,
            minPurchase,
            maxDiscount
        }
        const response = await fetch(`/admin/coupon/addCoupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyContent)
        });
  
        const data = await response.json();
  
        if (response.ok) {
          if(data.message){
            couponAddedNotification(data.message)
            setTimeout(()=>{
              location.reload()
            },1000)
          }
             // Refresh page to show updated user details
        } else if(data.error) {
            couponErrorNotification(data.error)
          
        }
    } catch (error) {
        console.log(error);
    }
}

async function couponAddedNotification(title){
    Swal.fire({
      title: title,
      icon: "success"
    });
  }

async function updateCoupon(e){
    try {
        e.preventDefault()
        let couponId=document.getElementById("updateCouponId").value
        let couponName=document.getElementById("updateCouponName").value
        let discountPercentage=document.getElementById("updateDiscountPercentage").value
        let startDate=document.getElementById("updateStartDate").value
        let expiryDate=document.getElementById("updateExpiryDate").value
        let minPurchase=document.getElementById("updateMinPurchase").value
        let maxDiscount=document.getElementById("updateMaxDiscount").value
        let updateListingStatus=document.getElementById("updateListingStatus").value
       
        let bodyContent={
            couponId,
            couponName,
            discountPercentage,
            startDate,
            expiryDate,
            minPurchase,
            maxDiscount,
            updateListingStatus
        }
        const response = await fetch(`/admin/coupon/updateCoupon`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyContent)
        });
  
        const data = await response.json();
  
        if (response.ok) {
          if(data.message){
            couponUpdatedNotification(data.message)
            setTimeout(()=>{
              location.reload()
            },1000)
          }
             // Refresh page to show updated user details
        } else if(data.error){
            couponErrorNotification(data.error)
        }
    } catch (error) {
        console.log(error);
    }
}


async function couponUpdatedNotification(title){
    Swal.fire({
      title: title,
      icon: "success"
    });
  }
  async function couponErrorNotification(errorMessage) {
    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error"
    });
  }
async function openUpdateCouponModal(couponId,couponCode,discountPercentage,couponStartDate,couponExpiryDate,minimumPurchase,maximumDiscount,isListed){
    console.log(couponCode)
    // var myModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    ; // Your original date format (DD/MM/YYYY)

    let parts = couponStartDate.split("/"); // Split into [10, 03, 2025]
    couponStartDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    

    let expiryParts=couponExpiryDate.split("/");
    couponExpiryDate = `${expiryParts[2]}-${expiryParts[1]}-${expiryParts[0]}`;
    // myModal.show();
    document.getElementById("updateCouponName").value = couponCode
    document.getElementById("updateDiscountPercentage").value = discountPercentage
    document.getElementById("updateStartDate").value = couponStartDate
    document.getElementById("updateExpiryDate").value = couponExpiryDate
    document.getElementById("updateMinPurchase").value = minimumPurchase
    document.getElementById("updateMaxDiscount").value = maximumDiscount
    document.getElementById("updateListingStatus").value = isListed ? "listed" : "unlisted";
    document.getElementById("updateCouponId").value = couponId
}

async function deleteCoupon(couponId){
  Swal.fire({
    title: "Are you sure?",
    text: "you want to delete this Coupon?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
try{
  fetch("/admin/coupon/deleteCoupon",{
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({couponId}),
  }).then((response)=>response.json())
  .then((data)=>{
      if(data.message){
          Swal.fire({
              title: data.message,
              text: "Coupon has been Deleted.",
              icon: "success"
            });
            setTimeout(()=>{
              location.reload()
            },1000) 
      }
      else{
        categoryErrorNotification(data.error)
        setTimeout(()=>{
          location.reload()
        },2000) 
      }})
    }catch (error) {
      console.error("An error occurred:", error);
  } 
    }})
}