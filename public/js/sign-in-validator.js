  //email


  $(document).ready(() => {
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


                //password
    
    if ($('#password').val().length < 8) {
        e.preventDefault()
        $('#passwordError').text("Password must be at least 8 characters long.");
    }
    else if(/\s/.test($('#password').val())){
        e.preventDefault()
        $('#passwordError').text("Password Should Not Contain Spaces.");
    }
    
    else if (!/(?=.*[a-z])/.test($('#password').val())) {
        e.preventDefault()
        $('#passwordError').text("Password must contain at least one lowercase letter.");
    }
    
    else if (!/(?=.*[A-Z])/.test($('#password').val())) {
        e.preventDefault()
        $('#passwordError').text("Password must contain at least one uppercase letter.");
    }
    
    else if (!/(?=.*\d)/.test($('#password').val())) {
        e.preventDefault()
        $('#passwordError').text("Password must contain at least one digit.");
    }
    
    else if (!/(?=.*[@$!%*?&#])/.test($('#password').val())) {
        e.preventDefault()
        $('#passwordError').text("Password must contain at least one special character (@, $, !, %, *, ?, &).");
    }
    
    else{
        $('#passwordError').text("");
    }
    })

});
  