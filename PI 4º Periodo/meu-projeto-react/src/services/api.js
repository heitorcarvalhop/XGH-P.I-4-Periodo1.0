import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Log para debug
console.log('🔧 Configuração da API:');
console.log('   URL Base:', API_BASE_URL);
console.log('   Variável de ambiente:', process.env.REACT_APP_API_URL || 'não definida');
console.log('💡 Se o backend estiver em outra porta, crie um arquivo .env com:');
console.log('   REACT_APP_API_URL=http://localhost:PORTA');

// Criar instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Desabilitar credenciais para evitar problemas de CORS
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
    console.log('✅ Resposta bem-sucedida:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('❌ Erro na requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      tipo: error.code
    });
    
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
      // Preparar dados para envio (apenas email e senha são necessários para login)
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };
      
      const response = await api.post('/api/auth/login', loginData);
      
      // Salvar token e dados do usuário no localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userType', response.data.userType);
        localStorage.setItem('user', JSON.stringify(response.data.userData));
      }
      
      return {
        token: response.data.token,
        userType: response.data.userType,
        user: response.data.userData
      };
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
      localStorage.removeItem('userType');
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
  // Cadastrar novo cliente
  async registerClient(clientData) {
    try {
      const payload = {
        name: clientData.fullName || clientData.name,
        email: clientData.email,
        password: clientData.password
      };
      
      console.log('📝 Cadastrando cliente com dados:', payload);
      console.log('📍 URL:', `${API_BASE_URL}/clients/register`);
      
      const response = await api.post('/clients/register', payload);
      
      console.log('✅ Cliente cadastrado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao cadastrar cliente:', {
        status: error.response?.status,
        mensagem: error.response?.data?.message || error.message,
        dados: error.response?.data
      });
      throw this.handleError(error);
    }
  },

  // Cadastrar novo barbeiro
  async registerBarber(barberData) {
    try {
      const payload = {
        name: barberData.fullName || barberData.name,
        cpf: barberData.cpf,
        birthDate: barberData.birthDate,
        phone: barberData.phone,
        email: barberData.email,
        password: barberData.password,
        barbershopId: parseInt(barberData.barbershop || barberData.barbershopId) || 1
      };
      
      console.log('📝 Cadastrando barbeiro com dados:', payload);
      console.log('📍 URL:', `${API_BASE_URL}/barbers/register`);
      
      const response = await api.post('/barbers/register', payload);
      
      console.log('✅ Barbeiro cadastrado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao cadastrar barbeiro:', {
        status: error.response?.status,
        mensagem: error.response?.data?.message || error.message,
        dados: error.response?.data
      });
      throw this.handleError(error);
    }
  },

  // Função auxiliar para registro baseado no tipo de usuário
  async register(userData) {
    try {
      if (userData.userType === 'client') {
        return await this.registerClient(userData);
      } else if (userData.userType === 'barber') {
        return await this.registerBarber(userData);
      } else {
        throw new Error('Tipo de usuário inválido');
      }
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Buscar usuário por ID
  async getUserById(id) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Atualizar dados do usuário
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Deletar usuário
  async deleteUser(id) {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Listar todos os usuários (admin)
  async getAllUsers() {
    try {
      const response = await api.get('/api/users');
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
      const response = await api.post('/api/validation/cpf', { value: cpf });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Validar email
  async validateEmail(email) {
    try {
      const response = await api.post('/api/validation/email', { value: email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
};

/**
 * Serviço de Barbearias
 */
export const barbershopService = {
  // Listar todas as barbearias
  async getAllBarbershops(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.latitude) params.append('latitude', filters.latitude);
      if (filters.longitude) params.append('longitude', filters.longitude);
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = queryString ? `/api/barbershops?${queryString}` : '/api/barbershops';
      
      console.log('🌐 Buscando barbearias na URL:', `${API_BASE_URL}${url}`);
      console.log('🔑 Token no localStorage:', localStorage.getItem('authToken') ? 'Existe' : 'Não existe');
      
      const response = await api.get(url);
      
      console.log('✅ Status da resposta:', response.status);
      console.log('📦 Resposta do servidor:', response.data);
      console.log('📊 Tipo de resposta:', typeof response.data);
      console.log('📋 Tem barbershops?', response.data?.barbershops ? 'Sim' : 'Não');
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro detalhado na requisição:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      throw this.handleError(error);
    }
  },

  // Buscar barbearia por ID
  async getBarbershopById(id) {
    try {
      const response = await api.get(`/api/barbershops/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Adicionar serviço a uma barbearia
  async addService(barbershopId, serviceData) {
    try {
      const response = await api.post(`/api/barbershops/${barbershopId}/services`, serviceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Atualizar dados da barbearia
  async updateBarbershop(id, barbershopData) {
    try {
      const response = await api.put(`/api/barbershops/${id}`, barbershopData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Buscar barbearia pelo ID do barbeiro
  async getBarbershopByBarberId(barberId) {
    try {
      console.log('🔍 Buscando barbeiro ID:', barberId);
      
      // Primeiro busca informações do barbeiro (inclui barbershopId)
      const barberResponse = await api.get(`/api/barbers/${barberId}`);
      console.log('📥 Resposta do barbeiro:', barberResponse.data);
      
      const barbershopId = barberResponse.data.barbershopId;
      
      if (!barbershopId) {
        console.warn('⚠️ Barbeiro não tem barbershopId associado');
        throw new Error('Barbeiro não está vinculado a nenhuma barbearia');
      }
      
      console.log('🔍 Buscando barbearia ID:', barbershopId);
      
      // Depois busca dados completos da barbearia
      const barbershopResponse = await api.get(`/api/barbershops/${barbershopId}`);
      console.log('📥 Resposta da barbearia:', barbershopResponse.data);
      
      return barbershopResponse.data;
    } catch (error) {
      console.error('❌ Erro em getBarbershopByBarberId:', error);
      throw this.handleError(error);
    }
  }
};

/**
 * Serviço de Agendamentos
 */
export const appointmentService = {
  // Listar agendamentos do cliente logado
  async getClientAppointments(clientId) {
    try {
      const response = await api.get(`/api/appointments/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Listar agendamentos de uma barbearia
  async getBarbershopAppointments(barbershopId) {
    try {
      const response = await api.get(`/api/appointments/barbershop/${barbershopId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Buscar agendamento por ID
  async getAppointmentById(id) {
    try {
      const response = await api.get(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Criar novo agendamento
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Reagendar agendamento
  async rescheduleAppointment(id, newDateTime) {
    try {
      const response = await api.put(`/api/appointments/${id}/reschedule`, newDateTime);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Cancelar agendamento
  async cancelAppointment(id) {
    try {
      const response = await api.put(`/api/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Confirmar agendamento (barbeiro)
  async confirmAppointment(id) {
    try {
      const response = await api.put(`/api/appointments/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Marcar como concluído (barbeiro)
  async completeAppointment(id) {
    try {
      const response = await api.put(`/api/appointments/${id}/complete`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Buscar horários disponíveis
  async getAvailableSlots(barbershopId, date) {
    try {
      const response = await api.get(`/api/appointments/available-slots`, {
        params: { barbershopId, date }
      });
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
  console.log('🔍 Tipo de erro:', {
    temResponse: !!error.response,
    temRequest: !!error.request,
    message: error.message,
    erro: error
  });

  if (error.response) {
    // Erro da API (status 4xx ou 5xx)
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new Error(data.message || 'Dados inválidos');
      case 401:
        return new Error('Credenciais inválidas');
      case 403:
        console.error('❌ ERRO 403: O backend está bloqueando o acesso a este endpoint.');
        console.error('💡 SOLUÇÃO: Configure o endpoint como público no Spring Security.');
        return new Error('Acesso negado pelo servidor. Configure o endpoint como público no backend.');
      case 404:
        return new Error('Recurso não encontrado');
      case 409:
        return new Error(data.message || 'Email já cadastrado');
      case 422:
        return new Error(data.message || 'Dados de validação inválidos');
      case 500:
        return new Error('Erro interno do servidor');
      default:
        return new Error(data.message || 'Erro na comunicação com o servidor');
    }
  } else if (error.request) {
    // Erro de rede (sem resposta do servidor)
    console.error('❌ Backend não respondeu');
    console.error('🔍 Detalhes da requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      code: error.code
    });
    
    if (error.code === 'ERR_NETWORK') {
      console.error('💡 Possíveis causas:');
      console.error('   1. Backend não está rodando');
      console.error('   2. Backend não permite CORS (bloqueou a requisição)');
      console.error('   3. Firewall/Antivírus bloqueando');
      return new Error('Erro de conexão. Verifique se o backend está rodando e configurado para aceitar CORS.');
    }
    
    return new Error('Backend não disponível. Verifique se está rodando.');
  } else {
    // Outros erros
    console.error('❌ Erro inesperado:', error.message);
    return new Error(error.message || 'Erro inesperado');
  }
}

// Adicionar handleError aos serviços
authService.handleError = handleError;
userService.handleError = handleError;
validationService.handleError = handleError;
barbershopService.handleError = handleError;
appointmentService.handleError = handleError;

export default api;
