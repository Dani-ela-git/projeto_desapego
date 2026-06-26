// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let todosOsProdutos = [];
let categoriaAtiva = "";
let inputNome, inputEndereco, botaoBuscar, containerResultados;

const categoriasMap = {
    'food':        ' Alimentos',
    'clothes':     ' Roupas',
    'electronics': ' Eletrônicos',
    'books':       ' Livros',
    'furniture':   ' Móveis',
    'others':      ' Outros'
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
// DOM 
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

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userCpf');
        localStorage.removeItem('userName');
        window.location.href = 'login.html';
    });
}
// troca botão login/logout dinamicamente em qualquer página
const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName');
const navLogin = document.querySelector('.navbar .login a');

if (navLogin) {
    if (token && userName) {
        navLogin.textContent = `Sair (${userName.split(' ')[0]})`;
        navLogin.href = '#';
        navLogin.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userCpf');
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
        });
    } else {
        navLogin.textContent = 'Login';
        navLogin.href = 'login.html';
    }
}
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

    const userCpf = localStorage.getItem('userCpf');
    const token   = localStorage.getItem('token');

    lista.forEach(doacao => {
        const imagemUrl      = doacao.images?.[0]?.url || 'https://placehold.co/300x200?text=Sem+Imagem';
        const cidade         = doacao.location?.address?.city || 'Localização não informada';
        const categoriaLabel = categoriasMap[doacao.category] || doacao.category;
        const doador         = doacao.donor?.name || '';
        const telefone       = doacao.donor?.phone || '';

        // formata telefone: 11987654321 -> (11) 98765-4321
        const telFormatado = telefone.length === 11
            ? `(${telefone.slice(0,2)}) ${telefone.slice(2,7)}-${telefone.slice(7)}`
            : telefone.length === 10
            ? `(${telefone.slice(0,2)}) ${telefone.slice(2,6)}-${telefone.slice(6)}`
            : telefone;

        // mostra botão deletar só se for o dono
        const ehDono = doacao.donor?._id && token;
        const btnDeletar = ehDono ? `
            <button class="btn-deletar" data-id="${doacao._id}"> Remover</button>
        ` : '';

        const card = document.createElement('div');
        card.className = 'card-produto';
        card.innerHTML = `
            <img src="${imagemUrl}" alt="${doacao.title}">
            <h3>${doacao.title}</h3>
            <p class="categoria">${categoriaLabel}</p>
            <p class="endereco">📍 ${cidade}</p>
            ${doador   ? `<p class="doador">👤 ${doador}</p>`         : ''}
            ${telefone ? `<p class="telefone">📞 ${telFormatado}</p>` : ''}
            ${btnDeletar}
        `;
        containerResultados.appendChild(card);
    });

    // evento de deletar
    document.querySelectorAll('.btn-deletar').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja remover esta doação?')) return;

            const id = btn.dataset.id;
            try {
                const res = await fetch(`http://localhost:3000/api/donations/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const json = await res.json();
                if (json.success) {
                    btn.closest('.card-produto').remove();
                } else {
                    alert(`Erro: ${json.message}`);
                }
            } catch (erro) {
                alert('Não foi possível conectar ao servidor.');
            }
        });
    });
}