//arrumando a header para subir ao ser acionado o scroll

let lastScrolltop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrolltop) {
        //rolando para baixo
        header.style.top = '-200px'; //esconde a header
    } else {
        //rolando para cima
        header.style.top = '0'; //mostra a header
    }

    lastScrolltop = scrollTop;
});