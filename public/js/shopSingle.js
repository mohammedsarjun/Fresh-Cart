
async function addCart(productId,variety){
    const inputField = document.querySelector(".quantity-field");
    const urlParams = new URLSearchParams(window.location.search);
    const grams = urlParams.get('grams');
    const ml=urlParams.get('ml');
    const varietyMeasurement=grams||ml
    let isItem=false
    if(variety=="items"){
        isItem=true
    }
    
    try{
      
    await fetch("/cart/addCart",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {productId:productId,
            varietyMeasurement:varietyMeasurement,
            quantity:inputField.value,
            variety:variety,
            isItem:isItem
        })
      })  .then((response) => response.json()) // Convert response to JSON
      .then((data) => {
        if (data.redirectTo) {
          window.location.href = data.redirectTo; // Use the correct property
        }
        if(data.status=200&&data.message){
          addToCartNotification(data.message)
        }
        if(data.status=400&&data.error){
          addToCartErrorNotification(data.error)
        }
      })
      .catch((error) => console.error("Error:", error));
   
    console.log(grams,ml,inputField.value,isItem)
}catch (error) {
    res.status(500).json({ error: error.message });
}
    
}

async function addToCartNotification(title){
  Swal.fire({
    title: title,
    icon: "success"
  });
}

async function addToCartErrorNotification(title) {
  Swal.fire({
    title: title,
    icon: "error", // Change to "error"
    confirmButtonColor: "#d33", // Red color for error
  });
}

async function addWishlist(productId,variety){
  document.querySelector("body").style.overflow = "hidden";
  document.querySelector(".loaderContainer").style.display = "flex";
  const urlParams = new URLSearchParams(window.location.search);
  const grams = urlParams.get('grams');
  const ml=urlParams.get('ml');
  let isItem=false

if(variety=="items"){
isItem=true
}
try{
  

await fetch("/wishlist/addWishlist", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
      productId:productId,
      variety:variety,
      varietyMeasurement:grams||ml||null,
      isItem:isItem
}), // Corrected JSON.stringify usage
})
  .then((response) => response.json()) // Convert response to JSON
  .then((data) => {
      if (data.redirectTo && data.status==401) {
          window.location.href = data.redirectTo; // Use the correct property
        }
      if(data.message){
          document.querySelector("body").style.overflow = "";
  document.querySelector(".loaderContainer").style.display = "none";
          addToWishlistNotification(data.message)
      }
  })
  .catch((error) => console.error("Error:", error));

}catch (error) {
  console.log(error)
}
  console.log(productId,variety,grams,ml,isItem)
}
function addToWishlistNotification(title){
  Swal.fire({
      title: title,
      icon: "success"
    });
}

