// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let todosOsProdutos = [];
let categoriaAtiva = "";
let inputNome, inputEndereco, botaoBuscar, containerResultados;

const categoriasMap = {
    'food':        '🍎 Alimentos',
    'clothes':     '👕 Roupas',
    'electronics': '💻 Eletrônicos',
    'books':       '📚 Livros',
    'furniture':   '🪑 Móveis',
    'others':      '📦 Outros'
};

// ========================================
// HEADER — esconde ao rolar para baixo
// ========================================
let lastScrollTop = 0;
const header = document.querySelector('.header');

if (header) {
    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        header.style.top = scrollTop > lastScrollTop ? '-200px' : '0';
        lastScrollTop = scrollTop;
    });
}

// ========================================
// DOM PRONTO
// ========================================
document.addEventListener('DOMContentLoaded', () => {

    inputNome          = document.getElementById('nome-produto');
    inputEndereco      = document.getElementById('input-endereco');
    botaoBuscar        = document.getElementById('botao-buscar');
    containerResultados = document.getElementById('resultados');

    // só roda o resto se for a página de pesquisa
    if (!containerResultados) return;

    // --- Dropdown de categorias ---
    const btnCategoria = document.getElementById('btnCategoria');
    const dropdown     = document.getElementById('dropdownMenu');

    if (btnCategoria && dropdown) {

        // abre/fecha ao clicar no botão
        btnCategoria.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            btnCategoria.classList.toggle('ativo');
        });

        // fecha ao clicar fora
        document.addEventListener('click', (e) => {
            if (!btnCategoria.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                btnCategoria.classList.remove('ativo');
            }
        });

        // seleciona categoria ao clicar no link
        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                selecionarCategoriaViaMenu(link.dataset.categoria);
            });
        });
    }

    // --- Botão buscar ---
    if (botaoBuscar) {
        botaoBuscar.addEventListener('click', (e) => {
            e.preventDefault();
            filtrarProdutos();
        });
    }

    // --- Filtro em tempo real ---
    if (inputNome)     inputNome.addEventListener('input', filtrarProdutos);
    if (inputEndereco) inputEndereco.addEventListener('input', filtrarProdutos);

    // --- Carrega produtos ao abrir a página ---
    carregarProdutos();
});

// ========================================
// FUNÇÕES DE PESQUISA
// ========================================
async function carregarProdutos() {
    try {
        const resposta = await fetch('http://localhost:3000/api/donations/search');
        const json = await resposta.json();

        if (json.success) {
            todosOsProdutos = json.data;
            renderizarProdutos(todosOsProdutos);
        } else {
            console.error('Erro do servidor:', json.message);
        }
    } catch (erro) {
        console.error('Erro ao carregar doações:', erro);
        if (containerResultados) {
            containerResultados.innerHTML = `
                <div class="sem-resultados">
                    <p>Não foi possível conectar ao servidor.</p>
                </div>`;
        }
    }
}

function selecionarCategoriaViaMenu(valor) {
    categoriaAtiva = valor;

    const btnTexto = document.querySelector('#btnCategoria span:first-child');
    if (btnTexto) {
        btnTexto.textContent = valor === "" ? "Categoria" : categoriasMap[valor] || valor;
    }

    document.getElementById('dropdownMenu')?.classList.remove('show');
    document.getElementById('btnCategoria')?.classList.remove('ativo');

    filtrarProdutos();
}

async function filtrarProdutos() {
    const params = new URLSearchParams();
    if (inputNome?.value.trim())    params.append('keyword', inputNome.value.trim());
    if (categoriaAtiva)             params.append('category', categoriaAtiva);

    try {
        const resposta = await fetch(`http://localhost:3000/api/donations/search?${params}`);
        const json = await resposta.json();

        if (json.success) {
            const buscaEndereco = inputEndereco?.value.toLowerCase().trim() || "";
            const filtrados = buscaEndereco
                ? json.data.filter(d => {
                    const cidade = d.location?.address?.city?.toLowerCase() || "";
                    const bairro = d.location?.address?.neighborhood?.toLowerCase() || "";
                    return cidade.includes(buscaEndereco) || bairro.includes(buscaEndereco);
                })
                : json.data;

            renderizarProdutos(filtrados);
        }
    } catch (erro) {
        console.error('Erro ao filtrar:', erro);
    }
}

function renderizarProdutos(lista) {
    if (!containerResultados) return;
    containerResultados.innerHTML = "";

    if (lista.length === 0) {
        containerResultados.innerHTML = `
            <div class="sem-resultados">
                <p>Nenhuma doação encontrada.</p>
                <small>Tente mudar a categoria ou digitar outro termo!</small>
            </div>`;
        return;
    }

    lista.forEach(doacao => {
        const imagemUrl = doacao.images?.[0]?.url || 'https://placehold.co/300x200?text=Sem+Imagem';
        const cidade         = doacao.location?.address?.city || 'Localização não informada';
        const categoriaLabel = categoriasMap[doacao.category] || doacao.category;
        const doador         = doacao.donor?.name || '';

        const card = document.createElement('div');
        card.className = 'card-produto';
        card.innerHTML = `
            <img src="${imagemUrl}" alt="${doacao.title}">
            <h3>${doacao.title}</h3>
            <p class="categoria">${categoriaLabel}</p>
            <p class="endereco">📍 ${cidade}</p>
            ${doador ? `<p class="doador">👤 ${doador}</p>` : ''}
        `;
        containerResultados.appendChild(card);
    });
}