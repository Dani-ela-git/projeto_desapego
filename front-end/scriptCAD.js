class Endereco {
    constructor(rua, numero, bairro, complemento, cidade, estado, cep) {
        this.rua = rua;
        this.numero = numero;
        this.bairro = bairro;
        this.complemento = complemento;
        this.cidade = cidade;
        this.estado = estado;
        this.cep = cep;
    }

    //validando cep
    static validaCEP(cep) {
        const regexCEP = /^\d{6}-?\d{2}$/;
        return regexCEP.test(cep);
    }
    static validaTexto(texto) {
        const regexTexto = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;
        return regexTexto.test(texto) && texto.trim().split(/\s+/).length >= 2;
    }

}
class Produto {
    constructor(titulo, descricao, imgs, usuario) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.imagnes = imgs;
        this.usuario = usuario;
    }

    static validaTitulo(titulo) {
        // Título: min 5 caracteres nao sendo num
        return titulo.trim().length >= 5 && /[A-Za-zÀ-ÿ]/.test(titulo);
    }
    static validaDescricao(descricao) {
        // descricao minima
        return descricao.trim().length >= 20;
    }
}

class Usuario {
    constructor(nome, cpf, endereco) {
        this.nome = nome;
        this.cpf = cpf;
        this.endereco = endereco;
    }

    //validando os campos 
    static validaNome(nome) {
        const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;
        return regexNome.test(nome) && nome.trim().split(/\s+/).length >= 2;
    }
    static validaCPF(cpf) {
        const regexCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        return regexCPF.test(cpf);
    }

    static validaIdade(idade) {//limita para maiores de 18 e mneores que 99 anos
        const regexIdade = /^(1[8-9]|[2-9]\d)$/;
        return regexIdade.test(idade);
    }

}

//EVENTOs - escuta
const flagNome = document.getElementById('nome');
if (flagNome) {
    flagNome.addEventListener('focusout', function () {

        if (!Usuario.validaNome(this.value)) {
            document.getElementById('alertaNome').textContent = 'Nome Inválido!'
        }
        else {
            document.getElementById('alertaNome').textContent = ''
        }

    });
}
const flagCPF = document.getElementById('cpf');
if (flagCPF) {
    flagCPF.addEventListener('focusout', function () {
        if (!Usuario.validaCPF(this.value)) {
            document.getElementById('alertaCpf').textContent = 'CPF inválido! Use o formato: 000.000.000-00.'
        } else {
            document.getElementById('alertaCpf').textContent = ''
        }
    });
}
const flagCEP = document.getElementById('cep');
if (flagCEP) {
    flagCEP.addEventListener('focusout', function () {
        if (!Endereco.validaCEP(this.value)) {
            document.getElementById('alertaCEP').textContent = 'CEP inválido! Use o formato: 00000-00.'
        } else {
            document.getElementById('alertaCEP').textContent = ''
        }
    });
}
const flagDescri = document.getElementById('descricao');
if (flagDescri) {

    flagDescri.addEventListener('focusout', function () {
        if (!Endereco.validaTexto(this.value)) {
            document.getElementById('alertaDescricao').textContent = 'Adicione mais detalhes sobre o produto!'
        } else {
            document.getElementById('alertaDescricao').textContent = ''
        }
    });
}
const flagCadUser = document.getElementById('cadUser');
if (flagCadUser) {
    flagCadUser.addEventListener('click', async function (event) { 
        event.preventDefault();

        // 1. Captura os valores que realmente existem no seu HTML
        const nomeValue = document.getElementById('nome').value;
        const cpfValue = document.getElementById('cpf').value;
        const cepValue = document.getElementById('cep').value;
        const idadeValue = document.getElementById('idade').value;
        const inputTelefone = document.getElementById('telefone');
        const telefoneValue = inputTelefone ? inputTelefone.value.trim() : "";

        // 2. Executa as validações do seu Front
        const isNomeOk = Usuario.validaNome(nomeValue);
        const isCpfOk = Usuario.validaCPF(cpfValue);
        const isIdadeOk = Usuario.validaIdade(idadeValue);
        const isCepOk = Endereco.validaCEP(cepValue);

        if (!telefoneValue || telefoneValue.replace(/[^\d]/g, '').length < 10) {
            alert("Por favor, digite um telefone válido com DDD (apenas números ou formato padrão).");
            return;
        }

        if (isNomeOk && isCpfOk && isIdadeOk && isCepOk) {
            
            // Instancia as suas classes do front
            const end = new Endereco(
                document.getElementById('rua').value,
                document.getElementById('numero').value,
                document.getElementById('bairro').value,
                document.getElementById('complemento').value,
                document.getElementById('cidade').value,
                document.getElementById('estado').value,
                cepValue
            );

            const user = new Usuario(nomeValue, cpfValue, end);

            // 3. ENVIANDO PARA O MONGO
            try {
                const resposta = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: user.nome,
                        cpf: cpfValue,
                        password: cpfValue,
                        phone: String(telefoneValue).replace(/[^\d]/g, ''), 
                        age: parseInt(idadeValue),
                        location: {
                            address: {
                                street: user.endereco.rua,
                                number: user.endereco.numero,
                                neighborhood: user.endereco.bairro,
                                complement: user.endereco.complemento,
                                city: user.endereco.cidade,
                                state: user.endereco.estado,
                                zipCode: user.endereco.cep
                            },
                            coordinates: [-47.89, -22.00]
                        }
                    })
                });

                const dadosDoServidor = await resposta.json();

                if (resposta.ok && dadosDoServidor.success) {
                    // Feedback visual de sucesso na tela
                    const msgSucesso = document.getElementById('sucesso');
                    msgSucesso.textContent = `Sucesso: ${dadosDoServidor.message}`;
                    msgSucesso.style.color = 'green';
                    
                    // Salva o token gerado para sessões futuras
                    localStorage.setItem('token', dadosDoServidor.token);
                    
                    // Limpa o formulário
                    document.querySelector('form').reset();
                } else {
                    if (dadosDoServidor.errors) {
                        const errosTratados = dadosDoServidor.errors.map(err => err.msg).join('\n');
                        alert(`Validação do banco recusou:\n${errosTratados}`);
                    } else {
                        alert(`Erro: ${dadosDoServidor.message}`);
                    }
                }

            } catch (erroConexao) {
                console.error("Erro de rede:", erroConexao);
                alert("Não foi possível conectar ao back-end. Ele está rodando?");
            }

        } else {
            alert("Por favor, corrija os campos antes de enviar!");
        }
    });
}
const flagCadProd = document.getElementById('cadProd');
if (flagCadProd) {
    // Adicionamos o 'async' para conseguir usar o await no envio do produto
    flagCadProd.addEventListener('click', async function (event) {
        event.preventDefault()

        // Usuário
        const nomeValue = document.getElementById('nome').value;
        const cpfValue = document.getElementById('cpf').value;

        // descricao
        const titValue = document.getElementById('titulo').value
        const descValue = document.getElementById('descricao').value

        // endereco
        const ruaValue = document.getElementById('rua').value;
        const numValue = document.getElementById('numero').value;
        const bairroValue = document.getElementById('bairro').value;
        const cityValue = document.getElementById('cidade').value;
        const compValue = document.getElementById('complemento').value;
        const cepValue = document.getElementById('cep').value;
        const estadoValue = document.getElementById('estado').value;

        // validação por metodos
        const isNomeOk = Usuario.validaNome(nomeValue);
        const isCpfOk = Usuario.validaCPF(cpfValue);
        const isCepOk = Endereco.validaCEP(cepValue);
        const isTituloOk = Produto.validaTitulo(titValue);
        const isDescOk = Produto.validaDescricao(descValue);

        if (isNomeOk && isCpfOk && isCepOk && isTituloOk && isDescOk) {

            const end = new Endereco(ruaValue, numValue, bairroValue, compValue, cityValue, estadoValue, cepValue);
            const user = new Usuario(nomeValue, cpfValue, end);

            // 1. CAPTURA DAS IMAGENS: Buscando os previews em Base64 que estão na tela
            const fotosEmBase64 = [];
            document.querySelectorAll('.upload-label img').forEach(img => {
                // Se a imagem tem um atributo 'src' e não está com a classe 'hidden'
                if (img.src && !img.classList.contains('hidden')) {
                    fotosEmBase64.push(img.src); // Salva o texto Base64 da imagem
                }
            });

            // Cria o objeto localmente
            const novoProduto = new Produto(titValue, descValue, fotosEmBase64, user);
            console.log("SUCESSO! Produto pronto para o envio:", novoProduto);

            // 2. ENVIANDO PARA O SEU BACK-END (MONGO)
            try {
                // Altere a URL abaixo para a sua rota exata de cadastro de produtos (Ex: /api/products ou /api/donations)
                const resposta = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Se o seu back-end exigir login para postar produto, enviamos o token salvo no cadastro
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    },
                    body: JSON.stringify({
                        title: novoProduto.titulo,
                        description: novoProduto.descricao,
                        images: novoProduto.imagnes, // Envia o array de strings Base64 das fotos
                        donorCpf: String(user.cpf).replace(/[^\d]/g, '') // Vincula o produto ao CPF do dono
                    })
                });

                const dadosDoServidor = await resposta.json();

                if (resposta.ok) {
                    // Feedback visual
                    const msgSucesso = document.getElementById('sucesso');
                    msgSucesso.textContent = 'Anúncio publicado com sucesso no MongoDB!';
                    msgSucesso.style.color = 'green';
                    
                    // Limpa o formulário e os previews de imagem
                    document.querySelector('form').reset();
                    document.querySelectorAll('.upload-label img').forEach(img => img.classList.add('hidden'));
                    document.querySelectorAll('.upload-label span').forEach(span => span.classList.remove('hidden'));
                } else {
                    alert(`Erro do servidor ao publicar produto: ${dadosDoServidor.message}`);
                }

            } catch (error) {
                console.error("Erro de rede no produto:", error);
                alert("Não foi possível conectar ao servidor para enviar o produto.");
            }

        } else {
            alert("Por favor, verifique os campos em vermelho ou com erro.");
        }
    });
}

const flagLogin = document.getElementById('login');
if (flagLogin) {
    flagLogin.addEventListener('click', async function (event) {
        event.preventDefault();

        // 1. Captura o CPF digitado na tela
        const cpfValue = document.getElementById('cpf').value;
        const isCpfOk = Usuario.validaCPF(cpfValue);

        if (isCpfOk) {
            // Criamos a senha baseada no CPF limpo (apenas números), que é como o seu back-end gera no cadastro
            const senhaPadrao = String(cpfValue).replace(/[^\d]/g, '');

            // 2. ENVIANDO REQUISIÇÃO DE LOGIN
            try {
                const resposta = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cpf: cpfValue,      
                        password: cpfValue 
                    })
                });

                const dadosDoServidor = await resposta.json();

                if (resposta.ok && dadosDoServidor.success) {
                    const msgSucesso = document.getElementById('sucesso');
                    msgSucesso.textContent = `Seja bem-vindo(a), ${dadosDoServidor.user.name}!`;
                    msgSucesso.style.color = 'green';

                    localStorage.setItem('token', dadosDoServidor.token);
                    localStorage.setItem('userCpf', dadosDoServidor.user.cpf);

                    setTimeout(() => {
                        window.location.href = "index.html"; 
                    }, 2000);

                } else {
                    alert(`Erro no Login: ${dadosDoServidor.message || 'CPF ou dados incorretos.'}`);
                }

            } catch (erroConexao) {
                console.error("Erro ao conectar no login:", erroConexao);
                alert("Não foi possível conectar ao servidor.");
            }

        } else {
            alert("Por favor, digite um CPF válido (formato 000.000.000-00) antes de tentar entrar!");
        }
    });
}
// Seleciona todos os inputs de arquivo
const inputs = document.querySelectorAll('.input-file');

inputs.forEach((input, index) => {
    input.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                // Seleciona a imagem de preview correspondente
                const imgPrev = document.querySelector(`#img-prev-${index + 1}`);
                const icon = input.previousElementSibling; // O <span> do ícone

                imgPrev.src = event.target.result;
                imgPrev.classList.remove('hidden');
                if (icon) icon.classList.add('hidden');
            }

            reader.readAsDataURL(file);
        }
    });
});