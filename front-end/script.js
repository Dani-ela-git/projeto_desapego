// arrumando a header para subir ao ser acionado o scroll
let lastScrolltop = 0;
const header = document.querySelector('.header');

// Filtrar em tempo real apenas se os inputs realmente existirem na página atual
if (inputNome) {
    inputNome.addEventListener('input', filtrarProdutos);
}
if (inputEndereco) {
    inputEndereco.addEventListener('input', filtrarProdutos);
}

// Inicializar o sistema apenas se o container de resultados existir
if (containerResultados) {
    carregarProdutos();
}

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



// gambiaeea
// var global para guardar todos os produtos do JSON
let todosOsProdutos = [];
// Nova variável global para controlar qual categoria está ativa no momento
let categoriaAtiva = ""; 

const inputNome = document.getElementById('nome-produto');          // nome do produto
const selectCategoria = document.getElementById('dropdownMenu');     // O container/botão do seu dropdown
const inputEndereco = document.getElementById('input-endereco');    // endereço
const botaoBuscar = document.getElementById('botao-buscar');        // buscar
const containerResultados = document.getElementById('resultados');  // visor dos resultados

// carrega o arquivo JSON
async function carregarProdutos() {
  try {
    const resposta = await fetch('mock.json'); // Lendo o seu arquivo mock.json
    todosOsProdutos = await resposta.json();
    
    // mostra todos os produtos assim que a página carregar
    renderizarProdutos(todosOsProdutos);
  } catch (erro) {
    console.error("Erro ao carregar os dados dos produtos:", erro);
  }
}

// ESTA FUNÇÃO SERÁ CHAMADA PELO ONCLICK DOS SEUS LINKS <a>
function selecionarCategoriaViaMenu(nomeDaCategoria) {
  categoriaAtiva = nomeDaCategoria; // Atualiza a categoria global com o que foi clicado

  // Opcional: Atualiza o texto do botão principal do dropdown para o usuário ver o que selecionou
  const btnTexto = document.querySelector('.Categoria span');
  if (btnTexto) {
    btnTexto.innerText = nomeDaCategoria === "" ? "Categoria" : nomeDaCategoria;
  }

  // Dispara o filtro imediatamente após a escolha
  filtrarProdutos();
}

// filtra os dados com base nos inputs da tela
function filtrarProdutos() {
  const buscaNome = inputNome.value.toLowerCase();
  // Agora lemos a nossa variável controlada pelo clique, não mais o ".value" que dava erro
  const buscaCategoria = categoriaAtiva; 
  const buscaEndereco = inputEndereco.value.toLowerCase();

  const produtosFiltrados = todosOsProdutos.filter(produto => {
    // Verifica se o nome do produto contém o que foi digitado
    const bateNome = produto.nome.toLowerCase().includes(buscaNome);
    
    // Se não selecionou categoria (vazio), ignora o filtro. Se selecionou, precisa ser igual.
    const bateCategoria = buscaCategoria === "" || produto.categoria === buscaCategoria;
    
    // Verifica se o endereço contém o termo digitado
    const bateEndereco = produto.endereco.toLowerCase().includes(buscaEndereco);

    // O produto só aparece se passar nos 3 filtros ao mesmo tempo
    return bateNome && bateCategoria && bateEndereco;
  });

  // Atualiza a tela com o resultado do filtro
  renderizarProdutos(produtosFiltrados);
}

// exibe os produtos na tela 
function renderizarProdutos(lista) {
  // Limpa os resultados anteriores
  containerResultados.innerHTML = "";

  // Se a busca não retornar nada, aplica a estratégia de "Busca Vazia"
  if (lista.length === 0) {
    containerResultados.innerHTML = `
      <div class="sem-resultados">
        <p>Nenhum produto encontrado para essa combinação de filtros.</p>
        <small>Tente mudar a categoria ou digitar outro termo!</small>
      </div>
    `;
    return;
  }

  // Se houver resultados, cria o HTML de cada um deles
  lista.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card-produto'
    card.innerHTML = `
    <img src="${produto.img}" alt="Imagem do produto ${produto.nome}" class="imagem-produto">
    <h3>${produto.nome}</h3>
    <p class="categoria">🏷️ ${produto.categoria}</p>
    <p class="endereco">📍 ${produto.endereco}</p>
    
  `;
    containerResultados.appendChild(card);
  });
}

// Se o usuário clicar no botão da lupa, também roda o filtro
if (botaoBuscar) {
  botaoBuscar.addEventListener('click', (e) => {
    e.preventDefault(); // Evita que o formulário recarregue a página
    filtrarProdutos();
  });
}

// Filtrar em tempo real enquanto o usuário digita nos campos de texto
inputNome.addEventListener('input', filtrarProdutos);
inputEndereco.addEventListener('input', filtrarProdutos);

// Inicializar o sistema ao carregar a página
carregarProdutos();