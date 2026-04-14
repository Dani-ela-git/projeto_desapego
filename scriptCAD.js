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
        const regexCEP = /^\d{5}-?\d{3}$/;
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
    flagCadUser.addEventListener('click', function (event) {
        event.preventDefault()

        const nomeValue = document.getElementById('nome').value
        const cpfValue = document.getElementById('cpf').value
        const cepValue = document.getElementById('cep').value;
        const idadeValue = document.getElementById('idade').value;

        const isNomeOk = Usuario.validaNome(nomeValue);
        const isCpfOk = Usuario.validaCPF(cpfValue);
        const isIdadeOk = Usuario.validaIdade(idadeValue);
        const isCepOk = Endereco.validaCEP(cepValue);

        if (isNomeOk && isCpfOk && isIdadeOk && isCepOk) {
            // Criando os objetos após validação bem-sucedida
            const end = new Endereco(
                document.getElementById('rua').value,
                document.getElementById('numero').value,
                document.getElementById('bairro').value,
                document.getElementById('complemento').value,
                document.getElementById('cidade').value,
                document.getElementById('estado').value,
                cepValue
            );

            const user = new Usuario(
                nomeValue,
                cpfValue,
                end
            );

            console.log("Objeto Usuário pronto para envio:", user);
            // Feedback visual
            const msgSucesso = document.getElementById('sucesso');
            msgSucesso.textContent = 'Formulário enviado com sucesso!';
            msgSucesso.style.color = 'green';
        } else {
            alert("Corrija os campos antes de enviar!");
        }
    });
}
const flagCadProd = document.getElementById('cadProd');
if (flagCadProd) {
    flagCadProd.addEventListener('click', function (event) {
        event.preventDefault()

        // Usuário
        const nomeValue = document.getElementById('nome').value;
        const cpfValue = document.getElementById('cpf').value;

        //descricao
        const titValue = document.getElementById('titulo').value
        const descValue = document.getElementById('descricao').value

        //endereco
        const ruaValue = document.getElementById('rua').value;
        const numValue = document.getElementById('numero').value;
        const bairroValue = document.getElementById('bairro').value;
        const cityValue = document.getElementById('cidade').value;
        const compValue = document.getElementById('complemento').value;
        const cepValue = document.getElementById('cep').value;
        const estadoValue = document.getElementById('estado').value;

        //validação por metodos
        const isNomeOk = Usuario.validaNome(nomeValue);
        const isCpfOk = Usuario.validaCPF(cpfValue);
        const isCepOk = Endereco.validaCEP(cepValue);
        const isTituloOk = Produto.validaTitulo(titValue);
        const isDescOk = Produto.validaDescricao(descValue);

        if (isNomeOk && isCpfOk && isCepOk && isTituloOk && isDescOk) {

            //cria o endereco
            const end = new Endereco(ruaValue, numValue, bairroValue, compValue, cityValue, estadoValue, cepValue);

            //vincula ao usuario
            const user = new Usuario(nomeValue, cpfValue, end);

            //armazena as imagens - (Transformando a lista de inputs em um array de arquivos)
            const fotosValidas = [];
            document.querySelectorAll('.input-file').forEach(input => {
                if (input.files[0]) fotosValidas.push(input.files[0]);
            });

            //vincula as infos à um Produto
            const novoProduto = new Produto(titValue, descValue, fotosValidas, user);

            console.log("SUCESSO! Produto pronto para o banco de dados:", novoProduto);

            // Feedback visual
            const msgSucesso = document.getElementById('sucesso');
            msgSucesso.textContent = 'Anúncio publicado com sucesso!';
            msgSucesso.style.color = 'green';

        } else {
            alert("Por favor, verifique os campos em vermelho ou com erro.");
        }
    });
}
const flagLogin = document.getElementById('login');
if (flagLogin) {
    flagLogin.addEventListener('click', function (event) {
        event.preventDefault()

        const cpfValue = document.getElementById('cpf').value;
        const isCpfOk = Usuario.validaCPF(cpfValue);

        if (isCpfOk) {
            console.log("Cfp foi verificado");
            // Feedback visual
            const msgSucesso = document.getElementById('sucesso');
            msgSucesso.textContent = 'CFP Validado!';
            msgSucesso.style.color = 'green';
        } else {
            alert("Corrija os campos antes de enviar!");
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