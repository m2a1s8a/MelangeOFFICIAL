// ハンバーガーメニューのJavaScript (★★修正版★★)
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navMenu = document.querySelector('.nav-menu');


hamburgerMenu.addEventListener('click', function() {
	hamburgerMenu.classList.toggle('open');
	navMenu.classList.toggle('open');


});