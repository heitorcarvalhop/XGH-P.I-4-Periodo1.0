// Configuração da API
export const API_CONFIG = {
  // URL base da API Spring Boot
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  
  // Timeout para requisições (em milissegundos)
  TIMEOUT: 10000,
  
  // Endpoints da API
  ENDPOINTS: {
    // Autenticação
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    
    // Usuários
    USERS: '/users',
    USER_BY_ID: (id) => `/users/${id}`,
    REGISTER: '/users/register',
    UPDATE_USER: (id) => `/users/${id}`,
    DELETE_USER: (id) => `/users/${id}`,
    
    // Validação
    VALIDATE_CPF: '/validation/cpf',
    VALIDATE_EMAIL: '/validation/email',
    
    // Barbearia (exemplos de endpoints futuros)
    BARBERSHOP: '/barbershop',
    APPOINTMENTS: '/appointments',
    SERVICES: '/services'
  },
  
  // Códigos de status HTTP
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  }
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  SERVER_ERROR: 'Erro interno do servidor.',
  UNAUTHORIZED: 'Credenciais inválidas.',
  FORBIDDEN: 'Acesso negado.',
  NOT_FOUND: 'Recurso não encontrado.',
  CONFLICT: 'Email já cadastrado.',
  VALIDATION_ERROR: 'Dados de validação inválidos.',
  UNEXPECTED_ERROR: 'Erro inesperado.'
};
