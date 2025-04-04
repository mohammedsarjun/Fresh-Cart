document.querySelectorAll('.color-palette').forEach(function (e) {
  e.addEventListener('click', function (e) {
    var t = this.querySelector(
        '.color-palette-hex-code div:last-child'
      ).textContent.trim(),
      o = (navigator.clipboard.writeText(t), document.createElement('div')),
      t =
        ((o.className = 'customTooltip'),
        (o.textContent = 'Copied!'),
        this.getBoundingClientRect());
    (o.style.top = t.top + window.pageYOffset + -14 + 'px'),
      (o.style.left = t.left + window.pageXOffset + 6 + 'px'),
      document.body.appendChild(o),
      setTimeout(function () {
        o.parentNode.removeChild(o);
      }, 1e3);
  });
});
