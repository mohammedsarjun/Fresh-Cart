document.querySelectorAll('[data-countdown]').forEach(function (t) {
  var e = t.getAttribute('data-countdown');
  function n() {
    var n,
      o,
      a,
      s = new Date().getTime(),
      s = new Date(e) - s;
    s <= 0
      ? (clearInterval(c), (t.innerHTML = 'Countdown expired'))
      : ((n = Math.floor(s / 864e5)),
        (o = Math.floor((s % 864e5) / 36e5)),
        (a = Math.floor((s % 36e5) / 6e4)),
        (s = Math.floor((s % 6e4) / 1e3)),
        (t.innerHTML =
          '<span class="countdown-section"><span class="countdown-amount hover-up">' +
          n +
          '</span><span class="countdown-period"> days </span></span><span class="countdown-section"><span class="countdown-amount hover-up">' +
          o +
          '</span><span class="countdown-period"> hours </span></span><span class="countdown-section"><span class="countdown-amount hover-up">' +
          a +
          '</span><span class="countdown-period"> mins </span></span><span class="countdown-section"><span class="countdown-amount hover-up">' +
          s +
          '</span><span class="countdown-period"> sec </span></span>'));
  }
  n();
  var c = setInterval(n, 1e3);
});
