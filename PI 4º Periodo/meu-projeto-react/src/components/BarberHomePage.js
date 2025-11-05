import React, { useState, useEffect } from 'react';
import './BarberHomePage.css';
import Profile from './Profile';
import { barbershopService } from '../services/api';

const BarberHomePage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [barbershop, setBarbershop] = useState(null);
  const [isLoadingBarbershop, setIsLoadingBarbershop] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Buscar dados da barbearia
  useEffect(() => {
    const fetchBarbershopData = async () => {
      if (user && user.barbershopId) {
        setIsLoadingBarbershop(true);
        try {
          const data = await barbershopService.getBarbershopById(user.barbershopId);
          setBarbershop(data);
        } catch (error) {
          console.error('Erro ao buscar dados da barbearia:', error);
        } finally {
          setIsLoadingBarbershop(false);
        }
      }
    };

    fetchBarbershopData();
  }, [user]);

  // Controlar dropdown do usuário
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event) => {
      const userMenu = document.querySelector('.user-menu');
      if (userMenu && !userMenu.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    requestAnimationFrame(() => {
      document.addEventListener('click', handleClickOutside);
    });

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const navigationItems = [
    { id: 'home', icon: '🏠', label: 'Início' },
    { id: 'appointments', icon: '📅', label: 'Agendamentos' },
    { id: 'barbershop', icon: '✂️', label: 'Minha Barbearia' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ];

  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
  };

  const getInitials = (name) => {
    if (!name) return 'B';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="barber-home-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-container">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">✂️</span>
              <span className="logo-text">BarberHub</span>
            </div>
            <div className="barber-badge">Barbeiro</div>
          </div>
          
          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Info da Barbearia na Sidebar */}
          {barbershop && (
            <div className="sidebar-barbershop-info">
              <div className="barbershop-badge">
                <div className="barbershop-icon">✂️</div>
                <div className="barbershop-details">
                  <div className="barbershop-name">{barbershop.name}</div>
                  <div className="barbershop-status">● Ativo</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Área Principal */}
      <div className="main-content">
        {/* Header */}
        <div className="main-header">
          <div className="header-title">
            <h1>
              {activeTab === 'home' && '🏠 Dashboard'}
              {activeTab === 'appointments' && '📅 Agendamentos'}
              {activeTab === 'barbershop' && '✂️ Minha Barbearia'}
              {activeTab === 'profile' && '👤 Perfil'}
            </h1>
          </div>
          
          <div className="header-actions">
            <div className={`user-menu ${isDropdownOpen ? 'active' : ''}`}>
              <div className="user-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span>{getInitials(user?.name)}</span>
              </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-name">{user?.name || 'Barbeiro'}</span>
                  <span className="user-type">Barbeiro</span>
                </div>
                <button 
                  className="profile-btn" 
                  onClick={() => {
                    setActiveTab('profile');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="profile-icon">👤</span>
                  Meu Perfil
                </button>
                <button 
                  className="logout-btn" 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                >
                  <span className="logout-icon">🚪</span>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="content-area">
          {activeTab === 'home' && (
            <div className="dashboard">
              {/* Cards de Estatísticas */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <div className="stat-label">Agendamentos Hoje</div>
                    <div className="stat-value">{todayAppointments.length}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✂️</div>
                  <div className="stat-content">
                    <div className="stat-label">Total Este Mês</div>
                    <div className="stat-value">-</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <div className="stat-label">Avaliação Média</div>
                    <div className="stat-value">-</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-label">Receita Mensal</div>
                    <div className="stat-value">-</div>
                  </div>
                </div>
              </div>

              {/* Agendamentos de Hoje */}
              <div className="today-section">
                <h2>📅 Agendamentos de Hoje</h2>
                <div className="appointments-list">
                  {todayAppointments.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <p>Nenhum agendamento para hoje</p>
                    </div>
                  ) : (
                    todayAppointments.map((apt) => (
                      <div key={apt.id} className="appointment-card">
                        <div className="appointment-time">{apt.time}</div>
                        <div className="appointment-details">
                          <div className="appointment-client">{apt.clientName}</div>
                          <div className="appointment-service">{apt.service}</div>
                        </div>
                        <div className="appointment-status">{apt.status}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Info da Barbearia */}
              {barbershop && (
                <div className="barbershop-section">
                  <h2>✂️ Sua Barbearia</h2>
                  <div className="barbershop-card">
                    <div className="barbershop-header">
                      <h3>{barbershop.name}</h3>
                      <span className="barbershop-status-badge">Ativo</span>
                    </div>
                    <div className="barbershop-info-grid">
                      <div className="info-item">
                        <span className="info-icon">📍</span>
                        <div className="info-content">
                          <div className="info-label">Endereço</div>
                          <div className="info-value">{barbershop.address || 'Não informado'}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">📞</span>
                        <div className="info-content">
                          <div className="info-label">Telefone</div>
                          <div className="info-value">{barbershop.phone || 'Não informado'}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">⭐</span>
                        <div className="info-content">
                          <div className="info-label">Avaliação</div>
                          <div className="info-value">{barbershop.rating || '-'} ⭐</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="coming-soon">
              <div className="coming-soon-content">
                <div className="coming-soon-icon">📅</div>
                <h2>Gerenciamento de Agendamentos</h2>
                <p>Em breve você poderá visualizar e gerenciar todos os seus agendamentos aqui!</p>
              </div>
            </div>
          )}

          {activeTab === 'barbershop' && (
            <div className="barbershop-details">
              {isLoadingBarbershop ? (
                <div className="loading-state">
                  <div className="loading-spinner">⏳</div>
                  <p>Carregando informações da barbearia...</p>
                </div>
              ) : barbershop ? (
                <div className="barbershop-full-info">
                  <div className="barbershop-header-section">
                    <h1>{barbershop.name}</h1>
                    <span className="status-badge active">● Ativo</span>
                  </div>

                  <div className="info-sections">
                    <div className="info-section">
                      <h3>📍 Localização</h3>
                      <p>{barbershop.address || 'Endereço não cadastrado'}</p>
                      {barbershop.cep && <p className="text-muted">CEP: {barbershop.cep}</p>}
                    </div>

                    <div className="info-section">
                      <h3>📞 Contato</h3>
                      <p>{barbershop.phone || 'Telefone não cadastrado'}</p>
                      {barbershop.email && <p className="text-muted">{barbershop.email}</p>}
                    </div>

                    <div className="info-section">
                      <h3>⏰ Horário de Funcionamento</h3>
                      <p>{barbershop.openingHours || 'Não informado'}</p>
                    </div>

                    <div className="info-section">
                      <h3>⭐ Avaliações</h3>
                      <div className="rating-display">
                        <span className="rating-value">{barbershop.rating || 'N/A'}</span>
                        <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">⚠️</div>
                  <h3>Barbearia não encontrada</h3>
                  <p>Não foi possível carregar as informações da sua barbearia.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <Profile 
              user={user} 
              barbershop={barbershop}
              onUpdateUser={(updatedUser) => {
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }} 
              onLogout={onLogout} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BarberHomePage;

