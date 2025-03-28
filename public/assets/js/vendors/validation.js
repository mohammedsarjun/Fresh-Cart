(() => {
  'use strict';
  var a = document.querySelectorAll('.needs-validation');
  Array.from(a).forEach((e) => {
    e.addEventListener(
      'submit',
      (a) => {
        e.checkValidity() || (a.preventDefault(), a.stopPropagation()),
          e.classList.add('was-validated');
      },
      !1
    );
  });
})();
