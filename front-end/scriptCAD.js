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
    flagCadProd.addEventListener('click', async function (event) {
        event.preventDefault();

        const nomeValue = document.getElementById('nome').value;
        const cpfValue = document.getElementById('cpf').value;
        const titValue = document.getElementById('titulo').value;
        const descValue = document.getElementById('descricao').value;
        const categoriaValue = document.getElementById('categoria').value;
        const ruaValue = document.getElementById('rua').value;
        const numValue = document.getElementById('numero').value;
        const bairroValue = document.getElementById('bairro').value;
        const cityValue = document.getElementById('cidade').value;
        const compValue = document.getElementById('complemento').value;
        const cepValue = document.getElementById('cep').value;
        const estadoValue = document.getElementById('estado').value;
        const distanciaValue = document.getElementById('distancia')?.value || 10;

        const isNomeOk = Usuario.validaNome(nomeValue);
        const isCpfOk = Usuario.validaCPF(cpfValue);
        const isCepOk = Endereco.validaCEP(cepValue);
        const isTituloOk = Produto.validaTitulo(titValue);
        const isDescOk = Produto.validaDescricao(descValue);
        const isCategoriaOk = categoriaValue !== "";

        if (!isCategoriaOk) {
            alert("Por favor, selecione uma categoria.");
            return;
        }

        if (isNomeOk && isCpfOk && isCepOk && isTituloOk && isDescOk) {

            const end = new Endereco(ruaValue, numValue, bairroValue, compValue, cityValue, estadoValue, cepValue);
            const user = new Usuario(nomeValue, cpfValue, end);



            // coordenadas por cidade
            const coordenadas = {
                'sao paulo': { lat: -23.5505, lon: -46.6333 },
                'curitiba': { lat: -25.4284, lon: -49.2731 },
                'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
                'belo horizonte': { lat: -19.9208, lon: -43.9378 },
                'salvador': { lat: -12.9714, lon: -38.5108 },
                'fortaleza': { lat: -3.7172, lon: -38.5433 },
                'manaus': { lat: -3.1019, lon: -60.0250 },
                'porto alegre': { lat: -30.0346, lon: -51.2177 },
                'recife': { lat: -8.0476, lon: -34.8770 },
                'brasilia': { lat: -15.7801, lon: -47.9292 }
            };

            // normaliza: remove acento e coloca minúsculo para não depender da digitação exata
            const cityNorm = cityValue.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            const coord = coordenadas[cityNorm] || { lat: -23.5505, lon: -46.6333 };
            try {
                // monta FormData para o Multer conseguir processar os arquivos
                const formData = new FormData();
                formData.append('title', titValue);
                formData.append('description', descValue);
                formData.append('category', categoriaValue);
                formData.append('distanceLimit', parseInt(distanciaValue));
                formData.append('latitude', coord.lat);
                formData.append('longitude', coord.lon);
                formData.append('location[address][street]', end.rua);
                formData.append('location[address][number]', end.numero);
                formData.append('location[address][neighborhood]', end.bairro);
                formData.append('location[address][complement]', end.complemento);
                formData.append('location[address][city]', end.cidade);
                formData.append('location[address][state]', end.estado);
                formData.append('location[address][zipCode]', end.cep);

                // adiciona os arquivos reais, não o Base64
                document.querySelectorAll('.input-file').forEach(input => {
                    if (input.files[0]) {
                        formData.append('images', input.files[0]);
                    }
                });

                const resposta = await fetch('http://localhost:3000/api/donations', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                const dadosDoServidor = await resposta.json();

                if (resposta.ok && dadosDoServidor.success) {
                    const msgSucesso = document.getElementById('sucesso');
                    msgSucesso.textContent = 'Doação publicada com sucesso!';
                    msgSucesso.style.color = 'green';

                    document.querySelector('form').reset();
                    document.querySelectorAll('.upload-label img').forEach(img => img.classList.add('hidden'));
                    document.querySelectorAll('.upload-label span').forEach(span => span.classList.remove('hidden'));
                } else {
                    alert(`Erro: ${dadosDoServidor.message || JSON.stringify(dadosDoServidor.errors)}`);
                }

            } catch (error) {
                console.error("Erro de rede:", error);
                alert("Não foi possível conectar ao servidor. Ele está rodando?");
            }

        } else {
            alert("Por favor, verifique os campos antes de enviar.");
        }
    });
}

const flagLogin = document.getElementById('login');
if (flagLogin) {
    flagLogin.addEventListener('click', async function (event) {
        event.preventDefault();

        const cpfValue = document.getElementById('cpf').value.trim();
        const isCpfOk = Usuario.validaCPF(cpfValue);

        if (isCpfOk) {
            // Como o cadastro usou o CPF formatado como senha, enviamos ele idêntico aqui:
            const dadosLogin = {
                cpf: cpfValue,      // '452.097.008-36' -> Para a busca com regex do findByCPF
                password: cpfValue  // '452.097.008-36' -> A string exata que gerou a hash do banco
            };

            try {
                const resposta = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosLogin)
                });

                const dadosDoServidor = await resposta.json();

                if (resposta.ok && dadosDoServidor.success) {
                    const msgSucesso = document.getElementById('sucesso');
                    msgSucesso.textContent = `Seja bem-vindo(a), ${dadosDoServidor.user.name}!`;
                    msgSucesso.style.color = 'green';

                    // Salva a sessão localmente
                    localStorage.setItem('token', dadosDoServidor.token);
                    localStorage.setItem('userCpf', dadosDoServidor.user.cpf);
                    localStorage.setItem('userName', dadosDoServidor.user.name); // <- adiciona o nome

                    setTimeout(() => {
                        window.location.href = "decisao.html"; // <- muda o destino
                    }, 2000);

                } else {
                    alert(`Erro no Login: ${dadosDoServidor.message}`);
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