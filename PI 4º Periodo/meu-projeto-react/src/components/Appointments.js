import React, { useState, useEffect } from 'react';
import './Appointments.css';
import { appointmentService } from '../services/api';
import { 
  Calendar, Clock, DollarSign, Scissors, MapPin, 
  Store, User, RefreshCw, AlertCircle, Loader,
  CheckCircle, XCircle, Hourglass, Circle, Phone
} from 'lucide-react';

// Importar imagens das barbearias
import Barbearia1 from '../images/Barbearia1.jpg';
import Barbearia2 from '../images/Barbearia2.jpg';
import Barbearia3 from '../images/Barbearia3.webp';
import Barbearia4 from '../images/Barbearia4.jpg';

const Appointments = ({ user }) => {
  // Mapeamento de nomes de barbearias para suas imagens
  const barbershopImages = {
    'Barbearia Estilo': Barbearia1,
    'Barba & Estilo': Barbearia2,
    'Barbearia Premium': Barbearia3,
    'Cortes & Barbas': Barbearia4,
    'Barbearia Clássica': Barbearia1,
    'The Barber Shop': Barbearia2,
    'Elite Barber': Barbearia4,
    'Barbearia Moderna': Barbearia3
  };
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, past, cancelled
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState(null);

  // Buscar agendamentos da API
  useEffect(() => {
    if (user && user.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando agendamentos do backend para o usuário:', user.id);
      console.log('[Appointments] Data/Hora atual:', new Date().toISOString());
      
      // Usar a função que cancela automaticamente agendamentos expirados
      const data = await appointmentService.getClientAppointmentsWithAutoCancel(user.id);
      let appointmentsList = data.appointments || data || [];
      
      console.log('📦 Dados recebidos do backend:', appointmentsList);
      
      // Garantir que agendamentos expirados apareçam como cancelados na tela
      // mesmo se o backend falhar em atualizar
      appointmentsList = appointmentsList.map(apt => {
        const statusesAtivos = ['pending', 'confirmed', 'scheduled', 'PENDING', 'CONFIRMED', 'SCHEDULED'];
        
        if (statusesAtivos.includes(apt.status)) {
          const isExpired = appointmentService.isExpiredAppointment(apt);
          
          if (isExpired) {
            console.warn(`[Appointments] Forçando cancelamento visual do agendamento ${apt.id}`);
            return { ...apt, status: 'cancelled', cancelledReason: 'Expirado' };
          }
        }
        
        return apt;
      });
      
      if (appointmentsList.length > 0) {
        console.log('✅ Agendamentos carregados:', appointmentsList.length);
        
        // Contar status
        const statusCount = appointmentsList.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log('[Appointments] Status dos agendamentos:', statusCount);
        
        setAppointments(appointmentsList);
      } else {
        console.log('[Appointments] Nenhum agendamento encontrado');
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos:', error.message);
      
      // Definir mensagem de erro apropriada
      let errorMsg = 'Erro ao carregar agendamentos.';
      if (error.message.includes('Backend não disponível') || error.message.includes('Erro de conexão')) {
        errorMsg = 'Servidor indisponível. Verifique se o backend está rodando em http://localhost:8080';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(appointmentId);
      
      // Atualizar localmente
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ));
      
      alert('Agendamento cancelado com sucesso!');
      setShowDetails(false);
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert(error.message || 'Erro ao cancelar agendamento. Tente novamente.');
    }
  };

  const handleReschedule = async (appointmentId) => {
    if (!newDate || !newTime) {
      alert('Por favor, selecione data e horário');
      return;
    }

    try {
      await appointmentService.rescheduleAppointment(appointmentId, {
        date: newDate,
        time: newTime
      });
      
      // Atualizar localmente
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt
      ));
      
      alert('Agendamento reagendado com sucesso!');
      setShowReschedule(false);
      setShowDetails(false);
      setNewDate('');
      setNewTime('');
      setAvailableSlots([]);
    } catch (error) {
      console.error('Erro ao reagendar:', error);
      alert(error.message || 'Erro ao reagendar. Tente novamente.');
    }
  };

  // Buscar horários disponíveis quando selecionar uma data
  const handleDateChange = async (date, barbershopId) => {
    setNewDate(date);
    setAvailableSlots([]);
    
    if (date && barbershopId) {
      try {
        console.log('🔍 Buscando horários disponíveis para:', { barbershopId, date });
        const data = await appointmentService.getAvailableSlots(barbershopId, date);
        const slots = data.availableSlots || data || [];
        
        console.log('✅ Horários disponíveis:', slots);
        setAvailableSlots(slots);
        
        if (slots.length === 0) {
          console.warn('[Appointments] Nenhum horário disponível para esta data');
          alert('Não há horários disponíveis para esta data. Por favor, selecione outra data.');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar horários disponíveis:', error);
        alert('Erro ao buscar horários disponíveis. Por favor, tente novamente.');
        setAvailableSlots([]);
      }
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído',
      scheduled: 'Agendado',
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      COMPLETED: 'Concluído',
      SCHEDULED: 'Agendado'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    switch (statusLower) {
      case 'confirmed':
        return <CheckCircle size={20} color="#10b981" />;
      case 'completed':
        return <CheckCircle size={20} color="#3b82f6" />;
      case 'cancelled':
        return <XCircle size={20} color="#ef4444" />;
      case 'pending':
        return <Hourglass size={20} color="#f59e0b" />;
      case 'scheduled':
        return <Circle size={20} color="#6366f1" />;
      default:
        return <AlertCircle size={20} color="#6b7280" />;
    }
  };

  const getStatusStyle = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    const styles = {
      confirmed: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#10b981',
        color: '#10b981',
        icon: <CheckCircle size={18} color="#10b981" />
      },
      completed: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        color: '#3b82f6',
        icon: <CheckCircle size={18} color="#3b82f6" />
      },
      cancelled: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: '#ef4444',
        color: '#ef4444',
        icon: <XCircle size={18} color="#ef4444" />
      },
      pending: {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: '#f59e0b',
        color: '#f59e0b',
        icon: <Hourglass size={18} color="#f59e0b" />
      },
      scheduled: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: '#6366f1',
        color: '#6366f1',
        icon: <Circle size={18} color="#6366f1" />
      }
    };
    
    return styles[statusLower] || {
      backgroundColor: 'rgba(107, 114, 128, 0.15)',
      borderColor: '#6b7280',
      color: '#6b7280',
      icon: <AlertCircle size={18} color="#6b7280" />
    };
  };

  const isUpcoming = (date, time) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Se tem hora, considerar também
    if (time) {
      const timeString = typeof time === 'string' 
        ? time.substring(0, 5)
        : Array.isArray(time)
          ? `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`
          : time?.hour !== undefined
            ? `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
            : null;
      
      if (timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);
        return appointmentDate >= new Date();
      }
    }
    
    return appointmentDate >= today;
  };

  const isPast = (date, time) => {
    return !isUpcoming(date, time);
  };

  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    return status.toString().toLowerCase();
  };

  const filteredAppointments = appointments.filter(apt => {
    const status = normalizeStatus(apt.status);
    
    switch (filterStatus) {
      case 'all':
        return true;
      
      case 'upcoming':
        // Próximos: confirmados ou agendados que ainda não passaram
        return (status === 'confirmed' || status === 'scheduled' || status === 'pending') 
          && isUpcoming(apt.date, apt.time);
      
      case 'cancelled':
        // Cancelados: apenas status cancelled
        return status === 'cancelled';
      
      case 'pending':
        // Pendentes: apenas status pending
        return status === 'pending';
      
      case 'confirmed':
        // Confirmados: apenas status confirmed
        return status === 'confirmed';
      
      case 'completed':
        // Concluídos: status completed OU qualquer agendamento que já passou (exceto cancelados)
        return status === 'completed' || (isPast(apt.date, apt.time) && status !== 'cancelled');
      
      default:
        return true;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  /**
   * Formata a data de forma inteligente:
   * - "Hoje" se for hoje
   * - "Amanhã" se for amanhã
   * - "Ontem" se for ontem (já passou)
   * - Data formatada se for outro dia
   */
  const formatDateSmart = (dateString) => {
    const appointmentDate = new Date(dateString);
    const today = new Date();
    
    // Zerar horas para comparação de datas
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = appointmentDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Amanhã';
    } else if (diffDays === -1) {
      return 'Ontem';
    } else if (diffDays < -1) {
      // Data já passou (mais de 1 dia atrás)
      return `${Math.abs(diffDays)} dias atrás`;
    } else if (diffDays > 1 && diffDays <= 7) {
      // Próximos dias da semana
      return appointmentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    } else {
      // Outras datas
      return appointmentDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

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

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return (
      <div className="appointments-container">
        <div className="loading-state">
          <div className="loading-spinner"><Loader size={48} className="spinning" /></div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="appointments-container">
        <div className="error-state">
          <div className="error-icon"><AlertCircle size={64} color="#ff6b6b" /></div>
          <h3>Erro ao carregar agendamentos</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchAppointments}>
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <div>
          <h1>Meus Agendamentos</h1>
          <p className="appointments-subtitle">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'agendamento' : 'agendamentos'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="appointments-filters">
        <button
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
          title="Todos os agendamentos"
        >
          <Circle size={16} style={{ marginRight: '6px' }} />
          Todos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterStatus('upcoming')}
          title="Agendamentos futuros confirmados"
        >
          <Calendar size={16} style={{ marginRight: '6px' }} />
          Próximos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
          title="Agendamentos pendentes"
        >
          <Hourglass size={16} style={{ marginRight: '6px' }} />
          Pendentes
        </button>
        <button
          className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('confirmed')}
          title="Agendamentos confirmados"
        >
          <CheckCircle size={16} style={{ marginRight: '6px' }} />
          Confirmados
        </button>
        <button
          className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
          title="Agendamentos concluídos ou que já passaram"
        >
          <CheckCircle size={16} style={{ marginRight: '6px' }} />
          Concluídos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
          title="Agendamentos cancelados"
        >
          <XCircle size={16} style={{ marginRight: '6px' }} />
          Cancelados
        </button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Calendar size={64} color="#ccc" /></div>
            <h3>Nenhum agendamento encontrado</h3>
            <p>Você ainda não tem agendamentos {filterStatus !== 'all' && `nesta categoria`}.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              {/* Status Badge no canto superior direito */}
              <span className={getStatusClass(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </span>

              {/* Container principal com imagem e conteúdo */}
              <div className="appointment-main-content">
                {/* Imagem da barbearia */}
                <div className="appointment-image">
                  <img 
                    src={barbershopImages[appointment.barbershopName] || Barbearia1}
                    alt={appointment.barbershopName}
                    className="barbershop-image"
                  />
                </div>

                {/* Conteúdo do card */}
                <div className="appointment-content">
                  {/* Nome da barbearia e serviço */}
                  <div className="appointment-header-info">
                    <h3>{appointment.barbershopName}</h3>
                    <p className="appointment-service">{appointment.service}</p>
                  </div>

                  {/* Detalhes em linha (barbeiro, data, hora) */}
                  <div className="appointment-details-preview">
                    <div className="detail-item">
                      <span className="detail-icon"><Scissors size={16} /></span>
                      <span className="detail-value">{appointment.barberName}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon"><Calendar size={16} /></span>
                      <span className="detail-value">{formatDateSmart(appointment.date)}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon"><Clock size={16} /></span>
                      <span className="detail-value">{formatTime(appointment.time)}</span>
                    </div>
                  </div>

                  {/* Footer com preço e ações */}
                  <div className="appointment-footer">
                    <div className="appointment-price">{formatPrice(appointment.price)}</div>
                    
                    <div className="appointment-actions">
                      <button
                        className="btn-warning"
                        onClick={() => {
                          console.log('[Appointments] Abrindo detalhes do agendamento:', appointment);
                          console.log('[Appointments] Status do agendamento:', appointment.status);
                          setSelectedAppointment(appointment);
                          setShowDetails(true);
                        }}
                      >
                        Ver detalhes
                      </button>

                      {(() => {
                        const status = normalizeStatus(appointment.status);
                        const canReagendar = (status === 'confirmed' || status === 'scheduled' || status === 'pending') 
                          && isUpcoming(appointment.date, appointment.time);
                        
                        return canReagendar && (
                          <>
                            <button
                              className="btn-secondary"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowReschedule(true);
                              }}
                            >
                              Reagendar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancelar
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetails && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Agendamento</h2>
              <button className="modal-close" onClick={() => setShowDetails(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3><Store size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Barbearia</h3>
                <p className="detail-title">{selectedAppointment.barbershopName}</p>
                <p className="detail-subtitle"><MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {selectedAppointment.barbershopAddress}</p>
                <p className="detail-subtitle"><Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {selectedAppointment.barbershopPhone}</p>
              </div>

              <div className="detail-section">
                <h3><Scissors size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Serviço</h3>
                <p className="detail-title">{selectedAppointment.service}</p>
                <p className="detail-subtitle"><Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Duração: {selectedAppointment.duration} minutos</p>
                <p className="detail-subtitle"><DollarSign size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Valor: {formatPrice(selectedAppointment.price)}</p>
              </div>

              <div className="detail-section">
                <h3><Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Data e Horário</h3>
                <p className="detail-title">{formatDate(selectedAppointment.date)}</p>
                <p className="detail-subtitle"><Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {formatTime(selectedAppointment.time)}</p>
              </div>

              <div className="detail-section">
                <h3><User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Barbeiro</h3>
                <p className="detail-title">{selectedAppointment.barberName}</p>
              </div>

              <div className="detail-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <AlertCircle size={18} style={{ marginRight: '4px' }} />
                  <span>Status do Agendamento</span>
                </h3>
                {(() => {
                  const status = selectedAppointment?.status || 'pending';
                  const statusStyle = getStatusStyle(status);
                  
                  return (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '16px 20px',
                      borderRadius: '10px',
                      backgroundColor: statusStyle.backgroundColor,
                      border: `2px solid ${statusStyle.borderColor}`,
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: statusStyle.borderColor + '20',
                        flexShrink: 0
                      }}>
                        {statusStyle.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '16px',
                          fontWeight: '700',
                          color: statusStyle.color,
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {getStatusLabel(status)}
                        </div>
                        <div style={{ 
                          fontSize: '12px',
                          color: '#aaa',
                          fontStyle: 'italic'
                        }}>
                          Status atual do agendamento
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetails(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reagendamento */}
      {showReschedule && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowReschedule(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reagendar Atendimento</h2>
              <button className="modal-close" onClick={() => setShowReschedule(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="reschedule-info">
                <h4>{selectedAppointment.barbershopName}</h4>
                <p>{selectedAppointment.service}</p>
              </div>

              <div className="current-schedule">
                <p><strong>Agendamento Atual:</strong></p>
                <p>
                  <Calendar size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} às {formatTime(selectedAppointment.time)}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="newDate">Nova Data</label>
                <input
                  type="date"
                  id="newDate"
                  className="form-input"
                  value={newDate}
                  onChange={(e) => handleDateChange(e.target.value, selectedAppointment.barbershopId)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newTime">Novo Horário</label>
                <select
                  id="newTime"
                  className="form-input"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  disabled={!newDate || availableSlots.length === 0}
                >
                  <option value="">
                    {!newDate 
                      ? 'Selecione uma data primeiro' 
                      : availableSlots.length === 0 
                      ? 'Nenhum horário disponível' 
                      : 'Selecione um horário'}
                  </option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {newDate && availableSlots.length === 0 && (
                  <p style={{ color: '#888', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} />
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowReschedule(false);
                  setNewDate('');
                  setNewTime('');
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={() => handleReschedule(selectedAppointment.id)}
              >
                Confirmar Reagendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

