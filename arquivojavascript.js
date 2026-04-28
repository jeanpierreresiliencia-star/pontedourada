// ===== CREDENCIAIS =====
const usuarios = [
    { 
        id: 1, 
        nome: "Administrador", 
        login: "admin", 
        senha: "admin", 
        tipo: "Gestão", 
        permissoes: ["produtos", "servicos", "agendamento", "fornecedores", "profissionais", "cliente"] 
    },
    { 
        id: 2, 
        nome: "Operacional", 
        login: "operacional", 
        senha: "opec2026", 
        tipo: "Operacional", 
        permissoes: ["servicos", "agendamento", "cliente"] 
    }
];

// ===== CONFIGURAÇÃO DOS MENUS =====
const menusConfig = {
    produtos: { nome: "Produtos", pagina: "produtos.html", descricao: "Cadastro de produtos", permissao: ["Gestão"] },
    servicos: { nome: "Serviços", pagina: "serviços.html", descricao: "Cadastro de serviços", permissao: ["Gestão", "Operacional"] },
    agendamento: { nome: "Agendamento", pagina: "agendamento.html", descricao: "Gerenciar agendamento", permissao: ["Gestão", "Operacional"] },
    fornecedores: { nome: "Fornecedores", pagina: "fornecedores.html", descricao: "Cadastro de fornecedores", permissao: ["Gestão"] },
    profissionais: { nome: "Profissionais", pagina: "profissionais.html", descricao: "Cadastro de profissionais", permissao: ["Gestão"] },
    cliente: { nome: "cliente", pagina: "cliente.html", descricao: "Cadastro de cliente", permissao: ["Gestão", "Operacional"] }
};

let usuarioAtual = null;

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
function exibirMensagem(tipo, mensagem) {
    const errorDiv = document.getElementById('msg-error');
    const successDiv = document.getElementById('msg-success');
    
    if (errorDiv && successDiv) {
        if (tipo === 'erro') {
            errorDiv.textContent = mensagem;
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
            setTimeout(() => errorDiv.style.display = 'none', 3000);
        } else {
            successDiv.textContent = mensagem;
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            setTimeout(() => successDiv.style.display = 'none', 2000);
        }
    }
}

function fazerLogin(login, senha) {
    const usuario = usuarios.find(u => u.login === login);
    
    if (!usuario) {
        exibirMensagem('erro', 'Login inválido!');
        document.getElementById('senha').value = '';
        return false;
    }
    
    if (usuario.senha !== senha) {
        exibirMensagem('erro', 'Senha inválida!');
        document.getElementById('senha').value = '';
        return false;
    }
    
    exibirMensagem('sucesso', 'Bem-vindo(a) ' + usuario.nome + '!');
    usuarioAtual = usuario;
    
    // Salva usuário no sessionStorage
    sessionStorage.setItem('usuarioAtual', JSON.stringify(usuario));
    
    setTimeout(() => {
        window.location.href = 'principal.html';
    }, 1000);
    
    return true;
}

function verificarSessao() {
    const stored = sessionStorage.getItem('usuarioAtual');
    if (stored) {
        usuarioAtual = JSON.parse(stored);
        return true;
    }
    return false;
}

function sair() {
    sessionStorage.removeItem('usuarioAtual');
    window.location.href = 'index.html';
}

function voltar() {
    window.location.href = 'principal.html';
}

function carregarMenus() {
    const gridMenus = document.getElementById('grid-menus');
    if (!gridMenus) return;
    
    gridMenus.innerHTML = '';
    
    for (const [key, menu] of Object.entries(menusConfig)) {
        const temPermissao = usuarioAtual && usuarioAtual.permissoes.includes(key);
        
        const card = document.createElement('div');
        card.className = 'card-menu' + (temPermissao ? '' : ' disabled');
        if (temPermissao) {
            card.onclick = () => window.location.href = menu.pagina;
        }
        
        card.innerHTML = `
            <h3>${menu.nome}</h3>
            <p>${menu.descricao}</p>
            ${!temPermissao ? '<span class="badge-permissao">Sem acesso</span>' : ''}
        `;
        gridMenus.appendChild(card);
    }
}

function carregarInfoUsuario() {
    const stored = sessionStorage.getItem('usuarioAtual');
    if (stored) {
        usuarioAtual = JSON.parse(stored);
        const cargoSpan = document.getElementById('cargo-usuario');
        const nomeSpan = document.getElementById('nome-usuario');
        if (cargoSpan) cargoSpan.textContent = usuarioAtual.tipo;
        if (nomeSpan) nomeSpan.textContent = usuarioAtual.nome;
    } else if (window.location.pathname.includes('principal.html')) {
        window.location.href = 'index.html';
    }
}

function salvarFormulario(event, tipo) {
    event.preventDefault();
    const nomes = { 
        produtos: 'produtos', 
        servicos: 'serviços', 
        agendamento: 'agendamento', 
        fornecedores: 'fornecedores', 
        profissionais: 'profissionais', 
        cliente: 'cliente' 
    };
    
    const msgDiv = document.getElementById('mensagem-form');
    if (msgDiv) {
        msgDiv.textContent = nomes[tipo] + ' salvo com sucesso!';
        msgDiv.className = 'mensagem-area success';
        setTimeout(() => {
            msgDiv.style.display = 'none';
            msgDiv.className = 'mensagem-area';
        }, 3000);
    }
    
    event.target.reset();
}

// ===== CONFIGURAÇÃO DE CADA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    // Página de login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            fazerLogin(
                document.getElementById('login').value,
                document.getElementById('senha').value
            );
        });
    }
    
    // Página principal
    if (document.getElementById('grid-menus')) {
        if (!verificarSessao()) {
            window.location.href = 'index.html';
        } else {
            carregarInfoUsuario();
            carregarMenus();
        }
    }
    
    // Páginas de formulário
    const forms = ['produtos', 'serviços', 'agendamento', 'fornecedores', 'profissionais', 'cliente'];
    forms.forEach(tipo => {
        const form = document.getElementById(`form-${tipo}`);
        if (form) {
            form.addEventListener('submit', (e) => salvarFormulario(e, tipo));
        }
    });
    
    // Verificar sessão nas páginas de formulário
    if (window.location.pathname.includes('.html') && 
        !window.location.pathname.includes('index.html') && 
        !window.location.pathname.includes('principal.html')) {
        if (!verificarSessao()) {
            window.location.href = 'index.html';
        } else {
            carregarInfoUsuario();
        }
    }
});