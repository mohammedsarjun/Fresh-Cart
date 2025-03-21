function initializeSwiperCarousels() {
  document.querySelectorAll('.swiper-container').forEach((t) => {
    var e = t.getAttribute('data-speed') || 400,
      a = t.getAttribute('data-space-between') || 100,
      i = 'true' === t.getAttribute('data-pagination'),
      r = 'true' === t.getAttribute('data-navigation'),
      n = 'true' === t.getAttribute('data-autoplay'),
      s = t.getAttribute('data-autoplay-delay') || 3e3,
      p = t.getAttribute('data-pagination-type') || 'bullets',
      o = t.getAttribute('data-effect') || 'slide',
      u = t.getAttribute('data-breakpoints');
    let l = {};
    if (u)
      try {
        l = JSON.parse(u);
      } catch (t) {
        console.error('Error parsing breakpoints data:', t);
      }
    u = {
      speed: parseInt(e),
      spaceBetween: parseInt(a),
      breakpoints: l,
      effect: o,
    };
    'fade' === o && (u.fadeEffect = { crossFade: !0 }),
      i &&
        (e = t.querySelector('.swiper-pagination')) &&
        ((u.pagination = { el: e, type: p, dynamicBullets: !0, clickable: !0 }),
        'custom' === p) &&
        (u.pagination.renderCustom = function (t, e, a) {
          var i = '';
          for (let t = 1; t <= a; t++)
            e == t
              ? (i += `<span class="swiper-pagination-numbers swiper-pagination-numbers-active">${t}</span>`)
              : (i += `<span class="swiper-pagination-numbers">${t}</span>`);
          return i;
        }),
      r
        ? (u.navigation = {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          })
        : (a = t.querySelector('.swiper-navigation')) &&
          a.classList.add('swiper-navigation-hidden'),
      n && (u.autoplay = { delay: parseInt(s) }),
      new Swiper(t, u);
  });
}
initializeSwiperCarousels();
