// front-end/api-config.js
// Configuração da API para o front-end

const API_CONFIG = {
    // URL base da API
    baseURL: window.location.origin + '/api',
    
    // Endpoints
    endpoints: {
        auth: {
            register: '/auth/register',
            login: '/auth/login',
            checkCPF: '/auth/check-cpf'
        },
        donations: {
            create: '/donations',
            nearby: '/donations/nearby',
            search: '/donations/search'
        },
        users: {
            profile: '/users/profile'
        }
    }
};

// Exportar para uso
window.API_CONFIG = API_CONFIG;