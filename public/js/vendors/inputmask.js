!(function () {
  var e = document.getElementById('card-mask'),
    e =
      (e && new IMask(e, { mask: '0000-0000-0000-0000' }),
      document.getElementById('digit-mask'));
  e && new IMask(e, { mask: '000' });
})();
