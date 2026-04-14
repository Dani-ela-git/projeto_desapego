// arrumando a header para subir ao ser acionado o scroll
let lastScrolltop = 0;
const header = document.querySelector('.header');

if (header) {
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrolltop) {
            // rolando para baixo
            header.style.top = '-200px'; // esconde a header
        } else {
            // rolando para cima
            header.style.top = '0'; // mostra a header
        }

        lastScrolltop = scrollTop;
    });
}

// eventos da parte de pesquisa (dropdown)
// aguardando DOM carregar
document.addEventListener('DOMContentLoaded', function () {  // CORRIGIDO: tinha ){ e estava errado

    // selecionando o botão Categorias
    const btnCategoria = document.getElementById('btnCategoria'); // CORRIGIDO: usar ID direto

    // verifica se o botão existe
    if (btnCategoria) {
        // pega o dropdown que já existe no HTML
        const dropdown = document.querySelector('.dropdown-categorias'); // CORRIGIDO: não precisa criar

        // função que abre e fecha o dropdown
        function abreFecha(event) {
            event.stopPropagation(); // evita que o clique feche imediatamente
            dropdown.classList.toggle('show');
            btnCategoria.classList.toggle('ativo');
        }

        // Adiciona evento de clique no botão de categoria
        btnCategoria.addEventListener('click', abreFecha);

        // Fecha o dropdown se clicar fora
        document.addEventListener('click', function (event) {
            if (btnCategoria && dropdown) {
                if (!btnCategoria.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show');
                    btnCategoria.classList.remove('ativo');
                }
            }
        });

        // função para retirar o dropdown quando clicar em uma categoria
        const links = dropdown.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault(); // CORRIGIDO: evitar navegação
                // Opcional: preencher o botão com a categoria selecionada
                const spanCategoria = btnCategoria.querySelector('span:first-child');
                if (spanCategoria) {
                    spanCategoria.textContent = this.textContent;
                }
                dropdown.classList.remove('show');
                btnCategoria.classList.remove('ativo');
            });
        });
    }
});
