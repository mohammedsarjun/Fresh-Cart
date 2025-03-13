// Get the hamburger and menu elements
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

// Add click event to toggle the menu
hamburger.addEventListener('click', () => {
    menu.classList.toggle('active');
});
