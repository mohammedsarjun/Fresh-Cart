 $(document).ready(() => {

  const queryString=window.location.search
  const params=new URLSearchParams(queryString)
  const wrongEmail=params.get("message")||null
  if(wrongEmail){
    $("#wrong-email-error").text(wrongEmail)
  }
    let emailPattern = /^\w+[@][a-z]{1,}[.][a-z|A-Z]*$/;
    const submitbtn=$(".submit-btn")
    submitbtn.click((e)=>{

        //email
        if ($("#email").val().length == 0) {
            e.preventDefault();
            $("#emailError").text("Enter Your Email !");
          }else if (!emailPattern.test($("#email").val())) {
            e.preventDefault();
            $("#emailError").text("Enter Your Email Properly !");
          } else {
              $("#email").val($("#email").val().trim());
            $("#emailError").text("");
          }
    })

});
  