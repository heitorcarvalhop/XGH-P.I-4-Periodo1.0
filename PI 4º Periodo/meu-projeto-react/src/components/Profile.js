import React, { useState, useEffect } from 'react';
import './Profile.css';
import { userService } from '../services/api';
import { 
  Edit, LogOut, AlertTriangle, CheckCircle, User as UserIcon, 
  Scissors, Store, MapPin, Phone, Mail, Star, Calendar 
} from 'lucide-react';

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
    birthDate: ''
  });

  // Funções de formatação (definidas antes do useEffect que as usa)
  const formatCPF = (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value) => {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Remove formatação do telefone (apenas números)
  const unformatPhone = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  };

  // Remove formatação do CPF (apenas números)
  const unformatCPF = (value) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  };

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      console.log('[Profile] Carregando dados do usuário:', {
        userId: user.id,
        phone: user.phone,
        phoneType: typeof user.phone,
        phoneIsNull: user.phone === null,
        phoneIsEmpty: user.phone === ''
      });
      
      // Formatar telefone e CPF ao carregar (backend retorna sem formatação)
      // Se telefone não for null/undefined/vazio, formatar
      let phoneFormatted = '';
      if (user.phone && user.phone !== null && user.phone !== '') {
        phoneFormatted = formatPhone(user.phone);
        console.log('[Profile] Telefone formatado:', {
          original: user.phone,
          formatted: phoneFormatted
        });
      }
      
      const cpfFormatted = user.cpf ? formatCPF(user.cpf) : '';
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: phoneFormatted,
        cpf: cpfFormatted,
        birthDate: user.birthDate || ''
      });
      
      console.log('[Profile] formData atualizado:', {
        phone: phoneFormatted,
        cpf: cpfFormatted
      });
    }
  }, [user, user?.id, user?.phone]); // Incluir user.phone para detectar mudanças no telefone

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

    setIsLoading(true);

    try {
      // Preparar dados para envio (remover formatação de telefone e CPF)
      const phoneUnformatted = unformatPhone(formData.phone);
      const cpfUnformatted = unformatCPF(formData.cpf);
      
      // Preparar dados para envio
      // Sempre enviar telefone (mesmo que vazio) para garantir que o backend receba
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: phoneUnformatted || '' // Sempre enviar telefone (string vazia se não tiver)
      };
      
      // Adicionar CPF e birthDate apenas se for barbeiro
      if (user.userType === 'barber' || user.userType === 'BARBER') {
        updateData.cpf = cpfUnformatted || '';
        updateData.birthDate = formData.birthDate || null;
      }

      console.log('[Profile] Dados antes de enviar:', {
        userId: user.id,
        userType: user.userType,
        formDataOriginal: {
          phone: formData.phone,
          cpf: formData.cpf,
          birthDate: formData.birthDate
        },
        phoneUnformatted: phoneUnformatted,
        cpfUnformatted: cpfUnformatted,
        updateData: updateData,
        updateDataJSON: JSON.stringify(updateData)
      });

      // Chamar API
      console.log('[Profile] Chamando userService.updateUser...');
      const updatedUser = await userService.updateUser(user.id, updateData);
      console.log('[Profile] Resposta recebida do backend:', updatedUser);

      // Atualizar formData com os dados retornados (formatar telefone e CPF)
      let phoneFormatted = '';
      if (updatedUser.phone && updatedUser.phone !== null && updatedUser.phone !== '') {
        phoneFormatted = formatPhone(updatedUser.phone);
        console.log('[Profile] Telefone atualizado e formatado:', {
          original: updatedUser.phone,
          formatted: phoneFormatted
        });
      } else {
        console.log('[Profile] Telefone ainda é null ou vazio na resposta');
      }
      
      const cpfFormatted = updatedUser.cpf ? formatCPF(updatedUser.cpf) : '';
      
      const newFormData = {
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        phone: phoneFormatted,
        cpf: cpfFormatted,
        birthDate: updatedUser.birthDate || ''
      };
      
      console.log('[Profile] Atualizando formData com:', newFormData);
      setFormData(newFormData);

      // Atualizar usuário no contexto (isso vai disparar o useEffect)
      if (onUpdateUser) {
        console.log('[Profile] Atualizando contexto do usuário com:', updatedUser);
        onUpdateUser(updatedUser);
      }

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
    // Restaurar dados originais (formatar telefone e CPF)
    const phoneFormatted = user.phone ? formatPhone(user.phone) : '';
    const cpfFormatted = user.cpf ? formatCPF(user.cpf) : '';
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: phoneFormatted,
      cpf: cpfFormatted,
      birthDate: user.birthDate || ''
    });
    setIsEditing(false);
    setError(null);
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
              <Edit size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
              Editar Perfil
            </button>
            <button className="btn-logout" onClick={onLogout}>
              <LogOut size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} strokeWidth={2} className="alert-icon" />
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} strokeWidth={2} className="alert-icon" />
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Conteúdo */}
      <div className="profile-content">
        {/* Informações Pessoais */}
        <div className="profile-section">
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserIcon size={24} strokeWidth={2} />
              Informações Pessoais
            </h2>
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scissors size={24} strokeWidth={2} />
                Sua Barbearia
              </h2>
            </div>

            <div className="barbershop-card-profile">
              <div className="barbershop-info-item">
                <div className="info-icon-profile">
                  <Store size={20} strokeWidth={2} color="#d4af37" />
                </div>
                <div className="info-text">
                  <div className="info-label-profile">Nome</div>
                  <div className="info-value-profile">{barbershop.name}</div>
                </div>
              </div>

              <div className="barbershop-info-item">
                <div className="info-icon-profile">
                  <MapPin size={20} strokeWidth={2} color="#d4af37" />
                </div>
                <div className="info-text">
                  <div className="info-label-profile">Endereço</div>
                  <div className="info-value-profile">
                    {barbershop.address || 'Não informado'}
                  </div>
                </div>
              </div>

              {barbershop.phone && (
                <div className="barbershop-info-item">
                  <div className="info-icon-profile">
                    <Phone size={20} strokeWidth={2} color="#d4af37" />
                  </div>
                  <div className="info-text">
                    <div className="info-label-profile">Telefone</div>
                    <div className="info-value-profile">{barbershop.phone}</div>
                  </div>
                </div>
              )}

              {barbershop.cep && (
                <div className="barbershop-info-item">
                  <div className="info-icon-profile">
                    <Mail size={20} strokeWidth={2} color="#d4af37" />
                  </div>
                  <div className="info-text">
                    <div className="info-label-profile">CEP</div>
                    <div className="info-value-profile">{barbershop.cep}</div>
                  </div>
                </div>
              )}

              {barbershop.rating && (
                <div className="barbershop-info-item">
                  <div className="info-icon-profile">
                    <Star size={20} strokeWidth={2} color="#d4af37" fill="#d4af37" />
                  </div>
                  <div className="info-text">
                    <div className="info-label-profile">Avaliação</div>
                    <div className="info-value-profile">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {barbershop.rating}
                        <Star size={16} strokeWidth={2} color="#d4af37" fill="#d4af37" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="stat-icon">
              <Calendar size={32} strokeWidth={2} color="#d4af37" />
            </div>
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
              <div className="stat-icon">
                <Scissors size={32} strokeWidth={2} color="#d4af37" />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total de Agendamentos</div>
                <div className="stat-value">-</div>
              </div>
            </div>
          )}

          <div className="stat-card">
            <div className="stat-icon">
              <Star size={32} strokeWidth={2} color="#d4af37" fill="#d4af37" />
            </div>
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

