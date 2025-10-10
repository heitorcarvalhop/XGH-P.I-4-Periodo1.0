import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação (se existir)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Serviços da API

/**
 * Serviço de Autenticação
 */
export const authService = {
  // Login do usuário
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Salvar token e dados do usuário no localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Logout do usuário
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar dados locais independente do resultado da API
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Obter dados do usuário logado
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

/**
 * Serviço de Usuários
 */
export const userService = {
  // Cadastrar novo usuário
  async register(userData) {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Buscar usuário por ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Atualizar dados do usuário
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Deletar usuário
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Listar todos os usuários (admin)
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
};

/**
 * Serviço de Validação
 */
export const validationService = {
  // Validar CPF
  async validateCPF(cpf) {
    try {
      const response = await api.post('/validation/cpf', { cpf });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Validar email
  async validateEmail(email) {
    try {
      const response = await api.post('/validation/email', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
};

/**
 * Função para tratar erros da API
 */
function handleError(error) {
  if (error.response) {
    // Erro da API (status 4xx ou 5xx)
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new Error(data.message || 'Dados inválidos');
      case 401:
        return new Error('Credenciais inválidas');
      case 403:
        return new Error('Acesso negado');
      case 404:
        return new Error('Recurso não encontrado');
      case 409:
        return new Error('Email já cadastrado');
      case 422:
        return new Error(data.message || 'Dados de validação inválidos');
      case 500:
        return new Error('Erro interno do servidor');
      default:
        return new Error(data.message || 'Erro na comunicação com o servidor');
    }
  } else if (error.request) {
    // Erro de rede
    return new Error('Erro de conexão. Verifique sua internet.');
  } else {
    // Outros erros
    return new Error('Erro inesperado');
  }
}

// Adicionar handleError aos serviços
authService.handleError = handleError;
userService.handleError = handleError;
validationService.handleError = handleError;

export default api;
