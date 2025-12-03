import React, { useState, useEffect } from 'react';
import './Register.css';
import { userService, validationService, barbershopService } from '../services/api';

const Register = ({ onSwitchToLogin, onRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'client', // 'client' ou 'barber'
    // Campos específicos do barbeiro
    cpf: '',
    birthDate: '',
    barbershop: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [barbershops, setBarbershops] = useState([]);
  const [isLoadingBarbershops, setIsLoadingBarbershops] = useState(false);
  const [barbershopsError, setBarbershopsError] = useState(null);

  // Buscar barbearias disponíveis
  useEffect(() => {
    const fetchBarbershops = async () => {
      setIsLoadingBarbershops(true);
      setBarbershopsError(null);
      try {
        console.log('🔍 Iniciando busca de barbearias...');
        const response = await barbershopService.getAllBarbershops();
        console.log('📥 Resposta completa do backend:', response);
        
        const barbershopsList = response.barbershops || response || [];
        console.log('📋 Lista de barbearias processada:', barbershopsList);
        console.log('🔢 Quantidade de barbearias:', barbershopsList.length);
        
        setBarbershops(Array.isArray(barbershopsList) ? barbershopsList : []);
        console.log('✅ Barbearias carregadas com sucesso');
      } catch (error) {
        console.error('❌ Erro ao buscar barbearias:', error);
        console.error('❌ Mensagem de erro:', error.message);
        console.error('❌ Detalhes do erro:', error);
        
        // Detectar tipo de erro
        if (error.message.includes('Acesso negado') || error.message.includes('403')) {
          setBarbershopsError('forbidden');
        } else if (error.message.includes('Backend não disponível')) {
          setBarbershopsError('offline');
        } else {
          setBarbershopsError('generic');
        }
        
        setBarbershops([]);
      } finally {
        setIsLoadingBarbershops(false);
      }
    };

    fetchBarbershops();
  }, []);

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para formatar telefone
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Função para gerar nome de usuário a partir do nome completo
  const generateUsername = (fullName) => {
    if (!fullName || fullName.trim().length === 0) return '';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].toLowerCase();
    } else {
      const firstName = names[0];
      const lastName = names[names.length - 1];
      return `${firstName} ${lastName}`.toLowerCase();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplicar formatação específica
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: formattedValue
      };
      
      // Gerar nome de usuário automaticamente quando o nome completo for alterado
      if (name === 'fullName') {
        newData.name = generateUsername(formattedValue);
      }
      
      return newData;
    });
    
    // Limpar erros quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpar erro da API
    if (apiError) {
      setApiError('');
    }
  };


  const validateForm = () => {
    const newErrors = {};

    // Validação do email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação da senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Validação do nome completo
    if (!formData.fullName) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 5) {
      newErrors.fullName = 'Nome completo deve ter pelo menos 5 caracteres';
    }

    // Validações específicas para barbeiros
    if (formData.userType === 'barber') {

      // CPF
      if (!formData.cpf) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      }

      // Data de nascimento
      if (!formData.birthDate) {
        newErrors.birthDate = 'Data de nascimento é obrigatória';
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.birthDate = 'Você deve ter pelo menos 18 anos';
        }
      }

      // Barbearia
      if (!formData.barbershop) {
        newErrors.barbershop = 'Selecione uma barbearia';
      }

      // Telefone
      if (!formData.phone) {
        newErrors.phone = 'Telefone é obrigatório';
      } else if (formData.phone.replace(/\D/g, '').length < 10) {
        newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      // Preparar dados para envio (remover confirmação de senha)
      const { confirmPassword, ...userData } = formData;
      
      const response = await userService.register(userData);
      
      // Sucesso no cadastro
      onRegister(response);
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setApiError(error.message || 'Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <button 
            className="back-button"
            onClick={onSwitchToLogin}
            title="Voltar ao login"
          >
            <svg className="back-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2>BarberShop</h2>
          <p>Crie sua conta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {apiError && (
            <div className="api-error">
              {apiError}
            </div>
          )}
          
          {/* Seleção de Tipo de Usuário */}
          <div className="form-group">
            <label>Como você quer se cadastrar?</label>
            <div className="user-type-selection">
              <button
                type="button"
                className={`user-type-btn ${formData.userType === 'client' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'client' }))}
                disabled={isLoading}
              >
                <span className="user-type-icon">👤</span>
                <span>Cliente</span>
                <small>Agendar horários</small>
              </button>
              <button
                type="button"
                className={`user-type-btn ${formData.userType === 'barber' ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'barber' }))}
                disabled={isLoading}
              >
                <span className="user-type-icon">✂️</span>
                <span>Barbeiro</span>
                <small>Gerenciar barbearia</small>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Nome completo *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            {formData.name && (
              <small className="username-preview">
                Nome de usuário: {formData.name}
              </small>
            )}
          </div>

          {/* Campos específicos para barbeiros */}
          {formData.userType === 'barber' && (
            <>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cpf">CPF *</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className={errors.cpf ? 'error' : ''}
                    placeholder="000.000.000-00"
                    maxLength="14"
                    disabled={isLoading}
                  />
                  {errors.cpf && <span className="error-message">{errors.cpf}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">Data de nascimento *</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={errors.birthDate ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="barbershop">Barbearia onde trabalha *</label>
                <select
                  id="barbershop"
                  name="barbershop"
                  value={formData.barbershop}
                  onChange={handleChange}
                  className={errors.barbershop ? 'error' : ''}
                  disabled={isLoading || isLoadingBarbershops}
                >
                  <option value="">
                    {isLoadingBarbershops ? 'Carregando barbearias...' : 'Selecione uma barbearia'}
                  </option>
                  {barbershops.map(barbershop => (
                    <option key={barbershop.id} value={barbershop.id}>
                      {barbershop.name}
                    </option>
                  ))}
                </select>
                {errors.barbershop && <span className="error-message">{errors.barbershop}</span>}
                {!isLoadingBarbershops && barbershops.length === 0 && (
                  <small className="info-message" style={{ color: '#f44336', marginTop: '5px', display: 'block', fontSize: '13px', lineHeight: '1.4' }}>
                    {barbershopsError === 'forbidden' && (
                      <>
                        ⚠️ <strong>Erro de configuração do backend:</strong><br/>
                        O endpoint /api/barbershops está bloqueado (403 Forbidden).<br/>
                        Configure-o como público no Spring Security.
                      </>
                    )}
                    {barbershopsError === 'offline' && (
                      <>
                        ⚠️ <strong>Backend não disponível:</strong><br/>
                        Verifique se o servidor está rodando na porta 8080.
                      </>
                    )}
                    {barbershopsError === 'generic' && (
                      <>
                        ⚠️ Erro ao carregar barbearias.<br/>
                        Entre em contato com o administrador.
                      </>
                    )}
                    {!barbershopsError && (
                      <>
                        ⚠️ Nenhuma barbearia cadastrada no sistema.<br/>
                        Entre em contato com o administrador.
                      </>
                    )}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefone *</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="(00) 00000-0000"
                  maxLength="15"
                  disabled={isLoading}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Digite a senha novamente"
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : `Cadastrar como ${formData.userType === 'client' ? 'Cliente' : 'Barbeiro'}`}
          </button>
        </form>

        <div className="register-footer">
          <div className="footer-section">
            <p>Já tem uma conta?</p>
            <button 
              type="button" 
              className="switch-button"
              onClick={onSwitchToLogin}
            >
              Faça login aqui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
