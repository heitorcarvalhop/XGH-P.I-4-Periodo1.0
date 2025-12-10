import React, { useState, useEffect } from 'react';
import './BarberHomePage.css';
import Profile from './Profile';
import BarbershopProfile from './BarbershopProfile';
import { barbershopService, appointmentService } from '../services/api';
import { 
  BarChart3, DollarSign, Users, Calendar, 
  Clock, TrendingUp, LogOut, User, 
  Scissors, ChevronRight, ChevronLeft, Store
} from 'lucide-react';

const BarberHomePage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [barbershop, setBarbershop] = useState(null);
  const [isLoadingBarbershop, setIsLoadingBarbershop] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // ✅ Para forçar recarregamento

  // Função para forçar atualização das estatísticas
  const refreshStatistics = () => {
    console.log('🔄 Forçando atualização das estatísticas...');
    setRefreshKey(prev => prev + 1);
  };

  // Buscar dados da barbearia
  useEffect(() => {
    const fetchBarbershopData = async () => {
      if (!user || !user.id) {
        setIsLoadingBarbershop(false);
        return;
      }
      
      setIsLoadingBarbershop(true);
      try {
        let data;
        
        // Se o usuário tem barbershopId, buscar diretamente
        if (user.barbershopId) {
          console.log('🏪 Buscando barbearia pelo ID:', user.barbershopId);
          data = await barbershopService.getBarbershopById(user.barbershopId);
        } else {
          // Se não tem barbershopId, buscar pela relação barbeiro-barbearia
          console.log('🏪 Buscando barbearia do barbeiro:', user.id);
          data = await barbershopService.getBarbershopByBarberId(user.id);
        }
        
        setBarbershop(data.barbershop || data);
        console.log('✅ Dados da barbearia recebidos:', data.barbershop || data);
      } catch (error) {
        console.error('❌ Erro ao buscar dados da barbearia:', error?.message || error);
        console.error('💡 Verifique se o barbeiro está associado a uma barbearia no backend');
        setBarbershop(null);
      } finally {
        setIsLoadingBarbershop(false);
      }
    };

    fetchBarbershopData();
  }, [user?.id, user?.barbershopId]);

  // Buscar estatísticas da barbearia
  useEffect(() => {
    const fetchStatistics = async () => {
      // Aguardar até que a barbearia seja carregada
      if (!barbershop || !barbershop.id) {
        console.warn('⚠️ Aguardando dados da barbearia...');
        setStatistics({
          totalRevenue: 0,
          avgClientsPerDay: 0,
          avgRevenuePerDay: 0,
          monthAppointments: 0,
          todayAppointments: 0,
          todayClients: 0, // ✅ NOVO
          totalAppointments: 0
        });
        setIsLoadingStats(false);
        return;
      }
      
      setIsLoadingStats(true);
      try {
        console.log('📊 Buscando agendamentos para barbershopId:', barbershop.id);
        
        // Buscar agendamentos da barbearia
        const appointmentsData = await appointmentService.getBarbershopAppointments(barbershop.id);
        console.log('📥 Dados brutos recebidos do backend:', appointmentsData);
        
        const appointments = appointmentsData.appointments || appointmentsData || [];
        
        console.log('✅ Agendamentos processados:', appointments.length);
        console.log('📋 Estrutura do primeiro agendamento:', appointments[0]);
        
        // Calcular estatísticas
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        console.log('📅 Data atual:', {
          today: now.toISOString().split('T')[0],
          mes: currentMonth + 1,
          ano: currentYear
        });
        
        // Filtrar agendamentos do mês atual
        const monthAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          const isSameMonth = aptDate.getMonth() === currentMonth && 
                              aptDate.getFullYear() === currentYear;
          const isNotCancelled = apt.status !== 'cancelled';
          
          if (isSameMonth && isNotCancelled) {
            console.log('✅ Agendamento do mês:', {
              id: apt.id,
              date: apt.date,
              status: apt.status
            });
          }
          
          return isSameMonth && isNotCancelled;
        });
        
        console.log(`📊 Agendamentos do mês (${currentMonth + 1}/${currentYear}):`, monthAppointments.length);
        
        // Calcular lucro total do mês
        const totalRevenue = monthAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
        
        // Calcular média de clientes por dia (dias úteis do mês)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const avgClientsPerDay = monthAppointments.length / daysInMonth;
        
        // Calcular lucro médio diário
        const avgRevenuePerDay = totalRevenue / daysInMonth;
        
        // Agendamentos de hoje
        const today = now.toISOString().split('T')[0];
        console.log('🔍 Buscando agendamentos para hoje:', today);
        
        const todayAppointments = appointments.filter(apt => {
          const aptDate = typeof apt.date === 'string' ? apt.date.split('T')[0] : apt.date;
          const isToday = aptDate === today;
          const isNotCancelled = apt.status !== 'cancelled';
          
          if (isToday) {
            console.log('📍 Agendamento de hoje encontrado:', {
              id: apt.id,
              date: apt.date,
              aptDate: aptDate,
              today: today,
              status: apt.status,
              clientId: apt.clientId,
              clientName: apt.clientName
            });
          }
          
          return isToday && isNotCancelled;
        });
        
        console.log(`✅ Total de agendamentos HOJE: ${todayAppointments.length}`);
        
        // ✅ Contar clientes únicos de hoje
        const clientIds = todayAppointments.map(apt => apt.clientId || apt.customer?.id).filter(id => id);
        console.log('👥 IDs dos clientes de hoje:', clientIds);
        
        const uniqueClientsToday = new Set(clientIds).size;
        console.log(`✅ Total de clientes ÚNICOS hoje: ${uniqueClientsToday}`);
        
        console.log('📊 Estatísticas calculadas:', {
          agendamentosHoje: todayAppointments.length,
          clientesUnicosHoje: uniqueClientsToday,
          agendamentosMes: monthAppointments.length,
          receitaMes: totalRevenue
        });
        
        setStatistics({
          totalRevenue,
          avgClientsPerDay,
          avgRevenuePerDay,
          monthAppointments: monthAppointments.length,
          todayAppointments: todayAppointments.length,
          todayClients: uniqueClientsToday, // ✅ NOVO: Clientes únicos de hoje
          totalAppointments: appointments.length
        });
        
      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error.message);
        // Definir estatísticas zeradas em caso de erro
        setStatistics({
          totalRevenue: 0,
          avgClientsPerDay: 0,
          avgRevenuePerDay: 0,
          monthAppointments: 0,
          todayAppointments: 0,
          todayClients: 0, // ✅ NOVO
          totalAppointments: 0
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStatistics();
  }, [barbershop, refreshKey]); // ✅ Recarregar quando refreshKey mudar

  // Buscar barbeiros cadastrados (simulado por enquanto)
  useEffect(() => {
    const fetchBarbers = async () => {
      if (!user) return;
      
      try {
        // TODO: Implementar endpoint no backend
        // const barbershopId = user.barbershopId || user.id;
        // const data = await barbershopService.getBarbers(barbershopId);
        // setBarbers(data.barbers || []);
        
        // Por enquanto, usando dados do usuário logado
        setBarbers([
          { 
            id: user.id, 
            name: user.name, 
            status: 'active', 
            appointments: statistics?.todayAppointments || 0 
          }
        ]);
      } catch (error) {
        console.error('Erro ao buscar barbeiros:', error);
        setBarbers([]);
      }
    };

    if (statistics) {
      fetchBarbers();
    }
  }, [user?.id, statistics?.todayAppointments]); // Dependências específicas

  // Buscar agendamentos do dia selecionado
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  
  useEffect(() => {
    const fetchDaySchedule = async () => {
      const barbershopId = user?.barbershopId || user?.id;
      
      if (!user || !barbershopId || !selectedDate) {
        setTodayAppointments([]);
        setAvailableSlots([]);
        return;
      }
      
      try {
        // Buscar agendamentos do dia selecionado (com cancelamento automático de expirados)
        console.log('📅 Buscando agendamentos para:', { barbershopId, date: selectedDate });
        const appointmentsData = await appointmentService.getBarbershopAppointmentsWithAutoCancel(barbershopId);
        const allAppointments = appointmentsData.appointments || appointmentsData || [];
        
        // Filtrar apenas do dia selecionado
        const dayApts = allAppointments.filter(apt => apt.date === selectedDate);
        setTodayAppointments(dayApts);
        console.log('✅ Agendamentos do dia:', dayApts.length);
        
        // Contar quantos foram cancelados automaticamente
        const autoCancelled = dayApts.filter(apt => 
          apt.status === 'cancelled' && 
          appointmentService.isExpiredAppointment(apt)
        ).length;
        
        if (autoCancelled > 0) {
          console.log(`🔄 ${autoCancelled} agendamento(s) expirado(s) cancelado(s) automaticamente`);
        }
        
        // Buscar horários disponíveis também
        const slotsData = await appointmentService.getAvailableSlots(barbershopId, selectedDate);
        const slots = slotsData.availableSlots || slotsData || [];
        setAvailableSlots(slots);
        console.log('✅ Horários disponíveis:', slots.length);
        
      } catch (error) {
        console.error('❌ Erro ao buscar agenda do dia:', error.message);
        setTodayAppointments([]);
        setAvailableSlots([]);
      }
    };

    fetchDaySchedule();
  }, [user?.id, user?.barbershopId, selectedDate]); // Incluir selectedDate nas dependências
  
  // Funções para navegar entre dias
  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };
  
  // Verificar se a data selecionada é hoje
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  /**
   * Formata o horário (LocalTime) para exibição
   * Lida com diferentes formatos: string, array, objeto
   */
  const formatTime = (time) => {
    if (!time) return '--:--';
    
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
    if (typeof time === 'object' && time.hour !== undefined) {
      const hours = String(time.hour).padStart(2, '0');
      const minutes = String(time.minute).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Fallback
    return String(time);
  };

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
    { id: 'home', icon: BarChart3, label: 'Dashboard' },
    { id: 'appointments', icon: Calendar, label: 'Agendamentos' },
    { id: 'barbers', icon: Users, label: 'Barbeiros' },
    { id: 'barbershop-profile', icon: Store, label: 'Barbearia' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.id)}
                >
                  <span className="nav-icon">
                    <IconComponent size={20} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
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
              {activeTab === 'home' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={28} color="#d4af37" />
                  Dashboard
                  <button 
                    onClick={refreshStatistics}
                    style={{
                      marginLeft: '15px',
                      padding: '8px 15px',
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid #d4af37',
                      borderRadius: '5px',
                      color: '#d4af37',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.3)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(212, 175, 55, 0.2)'}
                    title="Atualizar estatísticas"
                  >
                    🔄 Atualizar
                  </button>
                </span>
              )}
              {activeTab === 'appointments' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={28} color="#d4af37" />
                  Agendamentos
                </span>
              )}
              {activeTab === 'barbers' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={28} color="#d4af37" />
                  Barbeiros
                </span>
              )}
              {activeTab === 'barbershop-profile' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Store size={28} color="#d4af37" />
                  Barbearia
                </span>
              )}
              {activeTab === 'profile' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={28} color="#d4af37" />
                  Perfil
                </span>
              )}
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
                  <User size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
                  Meu Perfil
                </button>
                <button 
                  className="logout-btn" 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
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
              {isLoadingStats ? (
                <div className="loading-state">
                  <div className="loading-spinner">⏳</div>
                  <p>Carregando estatísticas...</p>
                </div>
              ) : (
                <>
                  {/* Cards de Estatísticas Principais */}
                  <div className="stats-grid">
                    <div className="stat-card highlight">
                      <div className="stat-header">
                        <div className="stat-icon-wrapper">
                          <DollarSign size={24} color="#d4af37" />
                        </div>
                        <TrendingUp size={16} color="#4ade80" />
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Lucro Total (Mês)</div>
                        <div className="stat-value">{formatCurrency(statistics?.totalRevenue || 0)}</div>
                        <div className="stat-info">
                          {statistics?.monthAppointments || 0} agendamentos
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-header">
                        <div className="stat-icon-wrapper">
                          <TrendingUp size={24} color="#d4af37" />
                        </div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Lucro Médio Diário</div>
                        <div className="stat-value">{formatCurrency(statistics?.avgRevenuePerDay || 0)}</div>
                        <div className="stat-info">
                          Baseado no mês atual
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-header">
                        <div className="stat-icon-wrapper">
                          <Users size={24} color="#d4af37" />
                        </div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Média de Clientes/Dia</div>
                        <div className="stat-value">{(statistics?.avgClientsPerDay || 0).toFixed(1)}</div>
                        <div className="stat-info">
                          {statistics?.todayClients || 0} cliente{(statistics?.todayClients || 0) !== 1 ? 's' : ''} hoje
                        </div>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-header">
                        <div className="stat-icon-wrapper">
                          <Calendar size={24} color="#d4af37" />
                        </div>
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Agendamentos Hoje</div>
                        <div className="stat-value">{statistics?.todayAppointments || 0}</div>
                        <div className="stat-info">
                          {statistics?.monthAppointments || 0} no mês
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção de Agenda Completa do Dia */}
                  <div className="section-card schedule-card">
                    <div className="section-header">
                      <div className="section-title">
                        <Calendar size={22} color="#d4af37" />
                        <h2>Agenda</h2>
                      </div>
                    </div>
                    
                    {/* Navegador de Data */}
                    <div className="date-navigator">
                      <div className="date-controls">
                        <button 
                          className="date-nav-btn" 
                          onClick={goToPreviousDay}
                          title="Dia Anterior"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        
                        <div className="date-display">
                          <input 
                            type="date" 
                            className="date-picker"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                          <div className="date-info">
                            <span className="date-text">
                              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            {isToday && <span className="today-badge">Hoje</span>}
                          </div>
                        </div>
                        
                        <button 
                          className="date-nav-btn" 
                          onClick={goToNextDay}
                          title="Próximo Dia"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      
                      {!isToday && (
                        <button className="today-btn" onClick={goToToday}>
                          <Calendar size={16} />
                          Voltar para Hoje
                        </button>
                      )}
                      
                      <div className="schedule-badges">
                        <span className="badge-info">
                          {todayAppointments.length} agendados
                        </span>
                        <span className="badge-success">
                          {availableSlots.length} livres
                        </span>
                      </div>
                    </div>
                    
                    <div className="schedule-container">
                      {todayAppointments.length === 0 && availableSlots.length === 0 ? (
                        <div className="empty-schedule">
                          <Calendar size={64} color="#666" />
                          <h3>Sem Agendamentos</h3>
                          <p>Nenhum agendamento para hoje</p>
                          <span className="empty-subtitle">Sua agenda está livre</span>
                        </div>
                      ) : (
                        <div className="daily-schedule">
                          {/* Agendamentos Confirmados */}
                          {todayAppointments.length > 0 && (
                            <div className="schedule-section">
                              <h3 className="schedule-section-title">
                                <Users size={18} color="#d4af37" />
                                Agendamentos Confirmados ({todayAppointments.length})
                              </h3>
                              <div className="appointments-timeline">
                                {todayAppointments
                                  .sort((a, b) => formatTime(a.time).localeCompare(formatTime(b.time)))
                                  .map((apt) => (
                                  <div key={apt.id} className="appointment-slot">
                                    <div className="appointment-time-badge">
                                      <Clock size={16} />
                                      {formatTime(apt.time)}
                                    </div>
                                    <div className="appointment-details">
                                      <div className="appointment-client-name">
                                        <User size={16} color="#d4af37" />
                                        {apt.clientName || 'Cliente'}
                                      </div>
                                      <div className="appointment-service-info">
                                        <Scissors size={14} />
                                        {apt.service || 'Serviço'}
                                        {apt.price && (
                                          <span className="appointment-price">
                                            • {formatCurrency(apt.price)}
                                          </span>
                                        )}
                                      </div>
                                      {apt.barberName && (
                                        <div className="appointment-barber">
                                          <Scissors size={12} />
                                          {apt.barberName}
                                        </div>
                                      )}
                                    </div>
                                    <div className={`appointment-status-badge ${apt.status}`}>
                                      {apt.status === 'confirmed' && '✓ Confirmado'}
                                      {apt.status === 'pending' && '⏳ Pendente'}
                                      {apt.status === 'completed' && '✓ Concluído'}
                                      {apt.status === 'cancelled' && '✗ Cancelado'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Horários Disponíveis */}
                          {availableSlots.length > 0 && (
                            <div className="schedule-section">
                              <h3 className="schedule-section-title">
                                <Clock size={18} color="#4ade80" />
                                Horários Disponíveis ({availableSlots.length})
                              </h3>
                              <div className="available-slots-grid">
                                {availableSlots.map((slot, index) => (
                                  <div key={index} className="available-slot-badge">
                                    <Clock size={14} />
                                    {slot}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Resumo */}
                    {(todayAppointments.length > 0 || availableSlots.length > 0) && (
                      <div className="schedule-summary">
                        <div className="summary-item">
                          <div className="summary-icon occupied">
                            <Users size={16} />
                          </div>
                          <div className="summary-text">
                            <span className="summary-number">{todayAppointments.length}</span>
                            <span className="summary-label">Agendamentos</span>
                          </div>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                          <div className="summary-icon available">
                            <Clock size={16} />
                          </div>
                          <div className="summary-text">
                            <span className="summary-number">{availableSlots.length}</span>
                            <span className="summary-label">Horários Livres</span>
                          </div>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                          <div className="summary-icon revenue">
                            <DollarSign size={16} />
                          </div>
                          <div className="summary-text">
                            <span className="summary-number">
                              {formatCurrency(
                                todayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0)
                              )}
                            </span>
                            <span className="summary-label">Receita Prevista</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seção de Barbeiros Cadastrados */}
                  <div className="section-card">
                    <div className="section-header">
                      <div className="section-title">
                        <Scissors size={22} color="#d4af37" />
                        <h2>Barbeiros Cadastrados</h2>
                      </div>
                      <span className="badge">{barbers.length} ativo(s)</span>
                    </div>
                    <div className="barbers-list">
                      {barbers.length === 0 ? (
                        <div className="empty-state">
                          <Users size={48} color="#666" />
                          <p>Nenhum barbeiro cadastrado</p>
                        </div>
                      ) : (
                        barbers.map((barber) => (
                          <div key={barber.id} className="barber-item">
                            <div className="barber-avatar">
                              <Scissors size={20} color="#d4af37" />
                            </div>
                            <div className="barber-info">
                              <div className="barber-name">{barber.name}</div>
                              <div className="barber-stats">
                                <span className="stat-badge">
                                  <Calendar size={12} />
                                  {barber.appointments || 0} agendamentos hoje
                                </span>
                                <span className={`status-badge ${barber.status}`}>
                                  ● {barber.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={20} color="#666" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="coming-soon">
              <div className="coming-soon-content">
                <Calendar size={64} color="#d4af37" />
                <h2>Gerenciamento de Agendamentos</h2>
                <p>Em breve você poderá visualizar e gerenciar todos os seus agendamentos aqui!</p>
              </div>
            </div>
          )}

          {activeTab === 'barbers' && (
            <div className="barbers-page">
              {/* Header da Página */}
              <div className="page-header-barbers">
                <div className="header-content">
                  <div className="page-title-section">
                    <div className="title-icon">
                      <Scissors size={32} color="#d4af37" />
                    </div>
                    <div>
                      <h1>Equipe de Barbeiros</h1>
                      <p className="page-subtitle">Gerencie sua equipe e acompanhe o desempenho</p>
                    </div>
                  </div>
                  <button className="btn-add-barber">
                    <Users size={20} />
                    <span>Adicionar Barbeiro</span>
                  </button>
                </div>
                
                {/* Estatísticas da Equipe */}
                {barbers.length > 0 && (
                  <div className="team-stats">
                    <div className="team-stat-card">
                      <div className="stat-icon team">
                        <Users size={24} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{barbers.length}</span>
                        <span className="stat-label">Barbeiros</span>
                      </div>
                    </div>
                    <div className="team-stat-card">
                      <div className="stat-icon active">
                        <Clock size={24} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">
                          {barbers.filter(b => b.status === 'active').length}
                        </span>
                        <span className="stat-label">Ativos Hoje</span>
                      </div>
                    </div>
                    <div className="team-stat-card">
                      <div className="stat-icon appointments">
                        <Calendar size={24} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">
                          {barbers.reduce((sum, b) => sum + (b.appointments || 0), 0)}
                        </span>
                        <span className="stat-label">Agendamentos Hoje</span>
                      </div>
                    </div>
                    <div className="team-stat-card">
                      <div className="stat-icon revenue">
                        <TrendingUp size={24} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{statistics?.avgClientsPerDay || 0}</span>
                        <span className="stat-label">Média de Clientes</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid de Barbeiros */}
              <div className="barbers-grid-modern">
                {barbers.length === 0 ? (
                  <div className="empty-state-barbers">
                    <div className="empty-icon-wrapper">
                      <Scissors size={80} color="#d4af37" />
                    </div>
                    <h3>Nenhum barbeiro na equipe</h3>
                    <p>Comece adicionando o primeiro barbeiro à sua barbearia</p>
                    <button className="btn-add-barber">
                      <Users size={20} />
                      <span>Adicionar Primeiro Barbeiro</span>
                    </button>
                  </div>
                ) : (
                  barbers.map((barber, index) => (
                    <div key={barber.id} className="barber-card-pro" style={{ animationDelay: `${index * 0.1}s` }}>
                      {/* Status Badge */}
                      <div className={`barber-status-badge ${barber.status}`}>
                        <span className="status-dot"></span>
                        {barber.status === 'active' ? 'Ativo' : 'Inativo'}
                      </div>
                      
                      {/* Avatar e Background */}
                      <div className="barber-card-bg">
                        <div className="barber-avatar-pro">
                          <Scissors size={40} color="#d4af37" />
                        </div>
                      </div>
                      
                      {/* Informações Principais */}
                      <div className="barber-main-info">
                        <h3 className="barber-name-pro">{barber.name}</h3>
                        <span className="barber-role">Barbeiro Profissional</span>
                      </div>
                      
                      {/* Estatísticas do Barbeiro */}
                      <div className="barber-performance">
                        <div className="performance-item">
                          <div className="performance-icon">
                            <Calendar size={18} />
                          </div>
                          <div className="performance-data">
                            <span className="performance-value">{barber.appointments || 0}</span>
                            <span className="performance-label">Hoje</span>
                          </div>
                        </div>
                        
                        <div className="performance-divider"></div>
                        
                        <div className="performance-item">
                          <div className="performance-icon">
                            <Users size={18} />
                          </div>
                          <div className="performance-data">
                            <span className="performance-value">{statistics?.monthAppointments || 0}</span>
                            <span className="performance-label">Este Mês</span>
                          </div>
                        </div>
                        
                        <div className="performance-divider"></div>
                        
                        <div className="performance-item">
                          <div className="performance-icon">
                            <TrendingUp size={18} />
                          </div>
                          <div className="performance-data">
                            <span className="performance-value">4.8</span>
                            <span className="performance-label">Avaliação</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="barber-card-actions">
                        <button className="btn-action-view">
                          <User size={16} />
                          Ver Perfil
                        </button>
                        <button className="btn-action-schedule">
                          <Calendar size={16} />
                          Agenda
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'barbershop-profile' && (
            <BarbershopProfile 
              barbershop={barbershop}
              onUpdate={(updatedBarbershop) => {
                console.log('✅ Barbearia atualizada:', updatedBarbershop);
                setBarbershop(updatedBarbershop);
                // Aqui você pode adicionar lógica adicional, como atualizar localStorage
                // ou fazer uma chamada para a API
              }}
            />
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

