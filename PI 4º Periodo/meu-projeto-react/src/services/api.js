import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Log para debug
console.log('[API] Configuração da API:');
console.log('[API] URL Base:', API_BASE_URL);
console.log('[API] Variável de ambiente:', process.env.REACT_APP_API_URL || 'não definida');
console.log('[API] Se o backend estiver em outra porta, crie um arquivo .env com:');
console.log('[API] REACT_APP_API_URL=http://localhost:PORTA');

// Teste de conectividade ao iniciar
fetch(`${API_BASE_URL}/api/barbershops`)
  .then(response => {
    if (response.ok) {
      console.log('[API] Backend conectado com sucesso!');
      console.log('[API] URL:', `${API_BASE_URL}`);
    } else {
      console.warn('[API] Backend respondeu mas com erro:', response.status);
    }
  })
  .catch(error => {
    console.error('[API] ERRO: Não foi possível conectar ao backend!');
    console.error('[API] URL testada:', `${API_BASE_URL}/api/barbershops`);
    console.error('[API] Verifique:');
    console.error('[API]   1. Backend está rodando?');
    console.error('[API]   2. Backend está na porta 8080?');
    console.error('[API]   3. Firewall bloqueando?');
    console.error('[API] Erro:', error.message);
  });

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
      console.log('[API] Resposta bem-sucedida:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('[ERROR] Erro na requisição:', {
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
      
      console.log('[INFO] Cadastrando cliente com dados:', payload);
      console.log('[API] URL:', `${API_BASE_URL}/clients/register`);
      
      const response = await api.post('/clients/register', payload);
      
      console.log('[OK] Cliente cadastrado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ERROR] Erro ao cadastrar cliente:', {
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
      
      console.log('[INFO] Cadastrando barbeiro com dados:', payload);
      console.log('[API] URL:', `${API_BASE_URL}/barbers/register`);
      
      const response = await api.post('/barbers/register', payload);
      
      console.log('[OK] Barbeiro cadastrado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ERROR] Erro ao cadastrar barbeiro:', {
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
      console.log('[API] Atualizando usuário:', {
        id: id,
        url: `${API_BASE_URL}/api/users/${id}`,
        data: userData,
        dataJSON: JSON.stringify(userData, null, 2)
      });
      
      console.log('[API] Body da requisição (JSON):', JSON.stringify(userData, null, 2));
      
      const response = await api.put(`/api/users/${id}`, userData);
      
      console.log('[API] Resposta da atualização:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('[API] Erro ao atualizar usuário:', {
        id: id,
        url: `${API_BASE_URL}/api/users/${id}`,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
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
      const response = await api.get('/users'); // Sem /api/ conforme documentação backend
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
      
      console.log('[WEB] Buscando barbearias na URL:', `${API_BASE_URL}${url}`);
      console.log('[AUTH] Token no localStorage:', localStorage.getItem('authToken') ? 'Existe' : 'Não existe');
      
      const response = await api.get(url);
      
      console.log('[OK] Status da resposta:', response.status);
      console.log('[DATA] Resposta do servidor:', response.data);
      console.log('[DATA] Tipo de resposta:', typeof response.data);
      console.log('[INFO] Tem barbershops?', response.data?.barbershops ? 'Sim' : 'Não');
      
      return response.data;
    } catch (error) {
      console.error('[ERROR] Erro detalhado na requisição:', {
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
      console.log('[DEBUG] Buscando barbeiro ID:', barberId);
      
      // Primeiro busca informações do barbeiro (inclui barbershopId)
      const barberResponse = await api.get(`/barbers/${barberId}`); // Sem /api/ conforme documentação backend
      console.log('[RECEIVE] Resposta do barbeiro:', barberResponse.data);
      
      const barbershopId = barberResponse.data.barbershopId;
      
      if (!barbershopId) {
        console.warn('[WARN] Barbeiro não tem barbershopId associado');
        throw new Error('Barbeiro não está vinculado a nenhuma barbearia');
      }
      
      console.log('[DEBUG] Buscando barbearia ID:', barbershopId);
      
      // Depois busca dados completos da barbearia
      const barbershopResponse = await api.get(`/api/barbershops/${barbershopId}`);
      console.log('[RECEIVE] Resposta da barbearia:', barbershopResponse.data);
      
      return barbershopResponse.data;
    } catch (error) {
      console.error('[ERROR] Erro em getBarbershopByBarberId:', error);
      throw this.handleError(error);
    }
  }
};

/**
 * Serviço de Agendamentos
 */
export const appointmentService = {
  // Listar agendamentos do cliente logado
  async getClientAppointments(clientId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros de data
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.onlyUpcoming) params.append('onlyUpcoming', 'true');
      
      const queryString = params.toString();
      const url = queryString 
        ? `/api/appointments/client/${clientId}?${queryString}` 
        : `/api/appointments/client/${clientId}`;
      
      const response = await api.get(url);
      
      // Filtrar no frontend se o backend não suportar filtros
      let appointments = response.data.appointments || response.data || [];
      
      if (filters.onlyUpcoming) {
        appointments = this.filterUpcomingAppointments(appointments);
      }
      
      if (filters.startDate || filters.endDate) {
        appointments = this.filterByDateRange(appointments, filters.startDate, filters.endDate);
      }
      
      return appointments;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Listar agendamentos de uma barbearia
  async getBarbershopAppointments(barbershopId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Adicionar filtros de data
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.onlyUpcoming) params.append('onlyUpcoming', 'true');
      
      const queryString = params.toString();
      const url = queryString 
        ? `/api/appointments/barbershop/${barbershopId}?${queryString}` 
        : `/api/appointments/barbershop/${barbershopId}`;
      
      const response = await api.get(url);
      
      // Filtrar no frontend se o backend não suportar filtros
      let appointments = response.data.appointments || response.data || [];
      
      if (filters.onlyUpcoming) {
        appointments = this.filterUpcomingAppointments(appointments);
      }
      
      if (filters.startDate || filters.endDate) {
        appointments = this.filterByDateRange(appointments, filters.startDate, filters.endDate);
      }
      
      return appointments;
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
      console.log(`[UPDATE] Reagendando ID ${id}:`, newDateTime);
      const response = await api.put(`/api/appointments/${id}/reschedule`, newDateTime);
      console.log(`[OK] Resposta reagendamento:`, response.data);
      // Backend retorna: { message: "...", appointment: {...} }
      return response.data.appointment || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Cancelar agendamento
  async cancelAppointment(id) {
    try {
      console.log(`[UPDATE] Cancelando agendamento ID ${id} via API...`);
      console.log(`[API] URL: ${API_BASE_URL}/api/appointments/${id}/cancel`);
      
      const response = await api.put(`/api/appointments/${id}/cancel`);
      
      console.log(`[OK] Resposta do backend ao cancelar:`, response.data);
      
      // Backend retorna: { message: "...", appointment: {...} }
      // Retornar o appointment atualizado
      return response.data.appointment || response.data;
    } catch (error) {
      console.error(`[ERROR] Erro ao cancelar agendamento ${id}:`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw this.handleError(error);
    }
  },

  // Confirmar agendamento (barbeiro)
  async confirmAppointment(id) {
    try {
      console.log(`[OK] Confirmando agendamento ID ${id}...`);
      const response = await api.put(`/api/appointments/${id}/confirm`);
      console.log(`[OK] Resposta confirmação:`, response.data);
      // Backend retorna: { message: "...", appointment: {...} }
      return response.data.appointment || response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Marcar como concluído (barbeiro)
  async completeAppointment(id) {
    try {
      console.log(`[OK] Marcando agendamento ID ${id} como concluído...`);
      const response = await api.put(`/api/appointments/${id}/complete`);
      console.log(`[OK] Resposta conclusão:`, response.data);
      // Backend retorna: { message: "...", appointment: {...} }
      return response.data.appointment || response.data;
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
  },

  // === FUNÇÕES AUXILIARES PARA SINCRONIZAÇÃO DE DATAS ===

  /**
   * Filtra apenas agendamentos futuros (a partir de hoje)
   */
  filterUpcomingAppointments(appointments) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate >= today && apt.status !== 'cancelled';
    });
  },

  /**
   * Filtra agendamentos por intervalo de datas
   */
  filterByDateRange(appointments, startDate, endDate) {
    return appointments.filter(apt => {
      const appointmentDate = new Date(apt.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (start && end) {
        return appointmentDate >= start && appointmentDate <= end;
      } else if (start) {
        return appointmentDate >= start;
      } else if (end) {
        return appointmentDate <= end;
      }
      
      return true;
    });
  },

  /**
   * Busca agendamentos apenas de hoje
   */
  async getTodayAppointments(clientId, isBarber = false) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filters = {
        startDate: today,
        endDate: today
      };
      
      if (isBarber) {
        return await this.getBarbershopAppointments(clientId, filters);
      } else {
        return await this.getClientAppointments(clientId, filters);
      }
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Verifica se um agendamento já passou
   */
  isPastAppointment(appointmentDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today;
  },

  /**
   * Verifica se um agendamento é hoje
   */
  isTodayAppointment(appointmentDate) {
    const today = new Date().toISOString().split('T')[0];
    const aptDate = new Date(appointmentDate).toISOString().split('T')[0];
    return aptDate === today;
  },

  /**
   * Formata data para o padrão do backend (YYYY-MM-DD)
   */
  formatDateForAPI(date) {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return new Date(date).toISOString().split('T')[0];
  },

  /**
   * Converte LocalTime do Java para string HH:MM
   * LocalTime pode vir como: "14:30:00", [14, 30, 0], {hour: 14, minute: 30, second: 0}
   */
  parseLocalTime(time) {
    if (!time) return null;
    
    console.log('[TIME] Parseando time:', time, 'tipo:', typeof time);
    
    // Se já é string (ex: "14:30" ou "14:30:00")
    if (typeof time === 'string') {
      return time.substring(0, 5); // Pegar apenas HH:MM
    }
    
    // Se é array [14, 30, 0] ou [14, 30]
    if (Array.isArray(time)) {
      const hours = String(time[0]).padStart(2, '0');
      const minutes = String(time[1]).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Se é objeto {hour: 14, minute: 30, second: 0}
    if (typeof time === 'object') {
      const hours = String(time.hour).padStart(2, '0');
      const minutes = String(time.minute).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Fallback: converter para string
    return String(time).substring(0, 5);
  },

  /**
   * Verifica se o agendamento já passou da data/hora atual
   */
  isExpiredAppointment(appointment) {
    try {
      const now = new Date();
      
      console.log('[DEBUG] Verificando agendamento:', {
        id: appointment.id,
        clientName: appointment.clientName,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        agora: now.toISOString()
      });
      
      // Verificar se tem data e hora
      if (!appointment.date || !appointment.time) {
        console.warn('[WARN] Agendamento sem data ou hora:', appointment);
        return false;
      }
      
      // Converter LocalTime para string HH:MM
      const timeString = this.parseLocalTime(appointment.time);
      
      if (!timeString) {
        console.error('[ERROR] Não foi possível converter time:', appointment.time);
        return false;
      }
      
      console.log('[OK] Time parseado:', timeString);
      
      // Extrair horas e minutos
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Criar data/hora do agendamento
      // LocalDate vem como "2025-12-09" (ISO format)
      const appointmentDateTime = new Date(appointment.date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      console.log('[TIME] Data/hora montada:', {
        iso: appointmentDateTime.toISOString(),
        local: appointmentDateTime.toLocaleString('pt-BR')
      });
      
      // Comparar
      const isExpired = appointmentDateTime < now;
      const diffMinutes = Math.round((now - appointmentDateTime) / 1000 / 60);
      
      console.log('[TIME] Resultado verificação:', {
        dataHoraAgendamento: appointmentDateTime.toISOString(),
        agora: now.toISOString(),
        expirado: isExpired,
        diferenca: `${diffMinutes} minutos ${isExpired ? 'ATRASADO' : 'restante'}`
      });
      
      return isExpired;
    } catch (error) {
      console.error('[ERROR] Erro ao verificar expiração do agendamento:', error);
      console.error('[ERROR] Stack:', error.stack);
      console.error('[ERROR] Dados do agendamento:', appointment);
      return false;
    }
  },

  /**
   * Cancela automaticamente agendamentos que já passaram
   */
  async cancelExpiredAppointments(appointments) {
    console.log('[DEBUG] Iniciando verificação de agendamentos expirados...');
    console.log(`[DATA] Total de agendamentos: ${appointments.length}`);
    
    const cancelPromises = [];
    const expiredIds = [];
    
    for (const appointment of appointments) {
      // Verificar se está pendente ou confirmado e se já passou
      const statusesParaCancelar = ['pending', 'confirmed', 'scheduled', 'PENDING', 'CONFIRMED', 'SCHEDULED'];
      const isPending = statusesParaCancelar.includes(appointment.status);
      
      console.log(`[INFO] Agendamento ID ${appointment.id}:`, {
        status: appointment.status,
        isPending: isPending,
        date: appointment.date,
        time: appointment.time
      });
      
      if (isPending) {
        const isExpired = this.isExpiredAppointment(appointment);
        
        if (isExpired) {
          console.log(`[TIME] AGENDAMENTO EXPIRADO ENCONTRADO!`, {
            id: appointment.id,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status
          });
          
          expiredIds.push(appointment.id);
          
          // Cancelar o agendamento via API
          const cancelPromise = this.cancelAppointment(appointment.id)
            .then((updatedAppointment) => {
              console.log(`[OK] Agendamento ${appointment.id} cancelado no backend!`, updatedAppointment);
              // Retornar o agendamento atualizado do backend
              return updatedAppointment;
            })
            .catch(error => {
              console.error(`[ERROR] ERRO ao cancelar agendamento ${appointment.id} no backend:`, error.message);
              // Cancelar localmente mesmo se falhar no backend (para mostrar na tela)
              console.warn(`[WARN] Cancelando localmente agendamento ${appointment.id} para exibição`);
              return { ...appointment, status: 'cancelled' };
            });
          
          cancelPromises.push({ id: appointment.id, promise: cancelPromise });
        }
      }
    }
    
    // Aguardar todos os cancelamentos
    if (cancelPromises.length > 0) {
      console.log(`[UPDATE] Processando ${cancelPromises.length} agendamentos expirados...`);
      
      const results = await Promise.all(cancelPromises.map(cp => cp.promise));
      
      console.log('[DATA] Resultados dos cancelamentos:', results);
      
      // Atualizar os agendamentos com os dados do backend
      const updatedAppointments = appointments.map(apt => {
        // Verificar se este agendamento foi cancelado
        const cancelIndex = cancelPromises.findIndex(cp => cp.id === apt.id);
        
        if (cancelIndex !== -1) {
          // Usar os dados atualizados do backend
          const updatedData = results[cancelIndex];
          console.log(`[UPDATE] Atualizando agendamento ${apt.id} com dados do backend:`, updatedData);
          return updatedData;
        }
        
        return apt;
      });
      
      console.log(`[OK] ${results.length} agendamento(s) cancelado(s) com sucesso!`);
      console.log('[DATA] Lista final de agendamentos:', updatedAppointments);
      
      return updatedAppointments;
    }
    
    console.log('[INFO] Nenhum agendamento expirado encontrado');
    return appointments;
  },

  /**
   * Busca agendamentos e cancela automaticamente os expirados
   */
  async getClientAppointmentsWithAutoCancel(clientId, filters = {}) {
    try {
      let appointments = await this.getClientAppointments(clientId, filters);
      
      // Array ou objeto com appointments
      const appointmentsArray = appointments.appointments || appointments || [];
      
      // Cancelar expirados
      const updated = await this.cancelExpiredAppointments(appointmentsArray);
      
      // Retornar no mesmo formato que veio
      if (appointments.appointments) {
        return { ...appointments, appointments: updated };
      }
      return updated;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Busca agendamentos da barbearia e cancela automaticamente os expirados
   */
  async getBarbershopAppointmentsWithAutoCancel(barbershopId, filters = {}) {
    try {
      let appointments = await this.getBarbershopAppointments(barbershopId, filters);
      
      // Array ou objeto com appointments
      const appointmentsArray = appointments.appointments || appointments || [];
      
      // Cancelar expirados
      const updated = await this.cancelExpiredAppointments(appointmentsArray);
      
      // Retornar no mesmo formato que veio
      if (appointments.appointments) {
        return { ...appointments, appointments: updated };
      }
      return updated;
    } catch (error) {
      throw this.handleError(error);
    }
  }
};

/**
 * Função para tratar erros da API
 */
function handleError(error) {
  console.log('[DEBUG] Tipo de erro:', {
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
        console.error('[ERROR] ERRO 403: O backend está bloqueando o acesso a este endpoint.');
        console.error('[INFO] SOLUÇÃO: Configure o endpoint como público no Spring Security.');
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
    console.error('[ERROR] Backend não respondeu');
    console.error('[DEBUG] Detalhes da requisição:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      code: error.code
    });
    
    if (error.code === 'ERR_NETWORK') {
      console.error('[INFO] Possíveis causas:');
      console.error('   1. Backend não está rodando');
      console.error('   2. Backend não permite CORS (bloqueou a requisição)');
      console.error('   3. Firewall/Antivírus bloqueando');
      return new Error('Erro de conexão. Verifique se o backend está rodando e configurado para aceitar CORS.');
    }
    
    return new Error('Backend não disponível. Verifique se está rodando.');
  } else {
    // Outros erros
    console.error('[ERROR] Erro inesperado:', error.message);
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
