import React, { useState } from 'react';
import './Login.css';
import { authService, barbershopService } from '../services/api';

const Login = ({ onSwitchToRegister, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client' // 'client' ou 'barber'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
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
      console.log('🔐 Tentando fazer login com:', { email: formData.email, userType: formData.userType });
      const response = await authService.login(formData);
      
      console.log('✅ Login bem-sucedido!', response);
      
      // Sucesso no login - usar dados reais da API
      let userData = response.user || response;
      
      // Se for barbeiro e não tem barbershopId, buscar do endpoint
      if (formData.userType === 'barber' && userData.id && !userData.barbershopId) {
        try {
          console.log('🔍 Buscando barbershopId para barbeiro:', userData.id);
          const barberData = await barbershopService.getBarbershopByBarberId(userData.id);
          if (barberData && barberData.id) {
            userData.barbershopId = barberData.id;
            console.log('✅ barbershopId encontrado:', barberData.id);
          }
        } catch (err) {
          console.warn('⚠️ Não foi possível buscar barbershopId:', err.message);
        }
      }
      
      // Garantir que salvamos no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      onLogin(userData);
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Mostrar mensagem de erro específica
      let errorMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (error.message.includes('Credenciais inválidas')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message.includes('Backend não disponível') || error.message.includes('Erro de conexão')) {
        errorMessage = 'Servidor indisponível. Verifique se o backend está rodando em http://localhost:8080';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // NÃO fazer login automático com dados mock
      // O usuário precisa ver o erro real
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Lado Esquerdo - Fundo de Tijolos */}
      <div className="login-left">
        <div className="login-brand">
          <h1>BarberShop</h1>
          <p>Estilo & Tradição</p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="login-right">
        <div className="login-card">

          <div className="login-content">
            {/* Seleção de Tipo de Usuário */}
            <div className="user-type-tabs">
              <button
                type="button"
                className={`user-type-tab ${formData.userType === 'client' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'client' }))}
                disabled={isLoading}
              >
                <span>Sou Cliente</span>
              </button>
              <button
                type="button"
                className={`user-type-tab ${formData.userType === 'barber' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'barber' }))}
                disabled={isLoading}
              >
                <span>Sou Barbeiro</span>
              </button>
            </div>

            <div className="login-text">
              <h2>Bem-vindo de volta</h2>
              <p>Entre na sua conta para continuar</p>
            </div>
            
            <form onSubmit={handleSubmit} className="login-form">
              {apiError && (
                <div className="api-error">
                  {apiError}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
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

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Sua senha"
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="forgot-password">
                <button type="button" className="forgot-link">
                  Esqueceu a senha?
                </button>
              </div>

              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="login-footer">
              <button 
                type="button" 
                className="register-button"
                onClick={onSwitchToRegister}
              >
                Criar nova conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
