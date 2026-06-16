// front-end/api.js
// Funções para se comunicar com o back-end

const API_BASE = window.location.origin + '/api';

/**
 * Faz uma requisição para a API
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
}

// Funções específicas
const API = {
    // Autenticação
    auth: {
        register: (userData) => apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        
        login: (credentials) => apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        
        checkCPF: (cpf) => apiRequest('/auth/check-cpf', {
            method: 'POST',
            body: JSON.stringify({ cpf })
        })
    },
    
    // Doações
    donations: {
        create: (formData) => {
            // Para upload de imagens, não pode usar JSON
            const token = localStorage.getItem('token');
            return fetch(`${API_BASE}/donations`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: formData
            }).then(res => res.json());
        },
        
        nearby: (lat, lon, maxDistance = 10) => 
            apiRequest(`/donations/nearby?lat=${lat}&lon=${lon}&maxDistance=${maxDistance}`),
        
        search: (params) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/donations/search?${query}`);
        }
    },
    
    // Usuário
    user: {
        profile: () => apiRequest('/users/profile'),
        update: (data) => apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }
};

// Exportar para uso global
window.API = API;