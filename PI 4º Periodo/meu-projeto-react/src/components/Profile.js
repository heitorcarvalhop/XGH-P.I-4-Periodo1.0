import React, { useState, useEffect } from 'react';
import './Profile.css';
import { userService } from '../services/api';

const Profile = ({ user, barbershop, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        cpf: user.cpf || '',
        birthDate: user.birthDate || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    // Validar senha se estiver alterando
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Digite a senha atual para alterar a senha');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('A nova senha deve ter no mínimo 6 caracteres');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Preparar dados para envio
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        birthDate: formData.birthDate
      };

      // Adicionar senha se estiver alterando
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Chamar API
      const updatedUser = await userService.updateUser(user.id, updateData);

      // Atualizar usuário no contexto
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(error.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      cpf: user.cpf || '',
      birthDate: user.birthDate || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setError(null);
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const getUserTypeLabel = () => {
    if (user.userType === 'barber' || user.userType === 'BARBER') {
      return 'Barbeiro';
    }
    return 'Cliente';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            <span>{getInitials(user?.name)}</span>
          </div>
          <div className="profile-header-info">
            <h1>{user?.name || 'Usuário'}</h1>
            <p className="profile-type">{getUserTypeLabel()}</p>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>
        {!isEditing && (
          <div className="profile-header-actions">
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              ✏️ Editar Perfil
            </button>
            <button className="btn-logout" onClick={onLogout}>
              🚪 Sair
            </button>
          </div>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Conteúdo */}
      <div className="profile-content">
        {/* Informações Pessoais */}
        <div className="profile-section">
          <div className="section-header">
            <h2>👤 Informações Pessoais</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                />
              ) : (
                <div className="form-value">{formData.name || '-'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                />
              ) : (
                <div className="form-value">{formData.email || '-'}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              {isEditing ? (
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              ) : (
                <div className="form-value">{formData.phone || '-'}</div>
              )}
            </div>

            {(user.userType === 'barber' || user.userType === 'BARBER') && (
              <>
                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      className="form-input"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  ) : (
                    <div className="form-value">{formData.cpf || '-'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">Data de Nascimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      className="form-input"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="form-value">
                      {formData.birthDate 
                        ? new Date(formData.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Informações da Barbearia (apenas para barbeiros) */}
        {(user.userType === 'barber' || user.userType === 'BARBER') && barbershop && !isEditing && (
          <div className="profile-section barbershop-section-profile">
            <div className="section-header">
              <h2>✂️ Sua Barbearia</h2>
            </div>

            <div className="barbershop-card-profile">
              <div className="barbershop-info-item">
                <div className="info-icon-profile">🏪</div>
                <div className="info-text">
                  <div className="info-label-profile">Nome</div>
                  <div className="info-value-profile">{barbershop.name}</div>
                </div>
              </div>

              <div className="barbershop-info-item">
                <div className="info-icon-profile">📍</div>
                <div className="info-text">
                  <div className="info-label-profile">Endereço</div>
                  <div className="info-value-profile">
                    {barbershop.address || 'Não informado'}
                  </div>
                </div>
              </div>

              {barbershop.phone && (
                <div className="barbershop-info-item">
                  <div className="info-icon-profile">📞</div>
                  <div className="info-text">
                    <div className="info-label-profile">Telefone</div>
                    <div className="info-value-profile">{barbershop.phone}</div>
                  </div>
                </div>
              )}

              {barbershop.cep && (
                <div className="barbershop-info-item">
                  <div className="info-icon-profile">📮</div>
                  <div className="info-text">
                    <div className="info-label-profile">CEP</div>
                    <div className="info-value-profile">{barbershop.cep}</div>
                  </div>
                </div>
              )}

              {barbershop.rating && (
                <div className="barbershop-info-item">
                  <div className="info-icon-profile">⭐</div>
                  <div className="info-text">
                    <div className="info-label-profile">Avaliação</div>
                    <div className="info-value-profile">{barbershop.rating} ⭐</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alterar Senha */}
        {isEditing && (
          <div className="profile-section">
            <div className="section-header">
              <h2>🔒 Alterar Senha</h2>
              <p className="section-subtitle">Deixe em branco se não quiser alterar</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="currentPassword">Senha Atual</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className="form-input"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-input"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {isEditing && (
          <div className="profile-actions">
            <button 
              className="btn-secondary" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </div>

      {/* Estatísticas do Usuário */}
      {!isEditing && (
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-label">Membro desde</div>
              <div className="stat-value">
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  : 'Indisponível'
                }
              </div>
            </div>
          </div>

          {(user.userType === 'client' || user.userType === 'CLIENT') && (
            <div className="stat-card">
              <div className="stat-icon">✂️</div>
              <div className="stat-info">
                <div className="stat-label">Total de Agendamentos</div>
                <div className="stat-value">-</div>
              </div>
            </div>
          )}

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-label">Avaliação Média</div>
              <div className="stat-value">-</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

