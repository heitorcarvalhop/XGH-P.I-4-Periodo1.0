import React, { useState, useEffect } from 'react';
import './Appointments.css';
import { appointmentService } from '../services/api';

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
    
    // Dados mock para desenvolvimento (sempre disponíveis)
    const mockData = [
      {
        id: 1,
        barbershopName: 'Barbearia Estilo',
        barbershopAddress: 'Av. T-63, 1234 - Setor Bueno',
        service: 'Corte + Barba',
        date: '2025-10-25',
        time: '14:30',
        duration: 45,
        price: 50.00,
        status: 'confirmed',
        barberName: 'João Silva',
        barbershopPhone: '(62) 99999-9999'
      },
      {
        id: 2,
        barbershopName: 'Barba & Estilo',
        barbershopAddress: 'Rua 10, 250 - Centro',
        service: 'Corte de Cabelo',
        date: '2025-10-22',
        time: '10:00',
        duration: 30,
        price: 35.00,
        status: 'completed',
        barberName: 'Pedro Santos',
        barbershopPhone: '(62) 98888-8888'
      },
      {
        id: 3,
        barbershopName: 'Barbearia Premium',
        barbershopAddress: 'Av. 85, 500 - Setor Marista',
        service: 'Tratamento Capilar',
        date: '2025-10-28',
        time: '16:00',
        duration: 60,
        price: 80.00,
        status: 'confirmed',
        barberName: 'Carlos Mendes',
        barbershopPhone: '(62) 97777-7777'
      },
      {
        id: 4,
        barbershopName: 'Barbearia Clássica',
        barbershopAddress: 'Rua 7, 789 - Setor Oeste',
        service: 'Barba',
        date: '2025-10-20',
        time: '15:00',
        duration: 20,
        price: 25.00,
        status: 'cancelled',
        barberName: 'Marcos Lima',
        barbershopPhone: '(62) 95555-5555'
      },
      {
        id: 5,
        barbershopName: 'The Barber Shop',
        barbershopAddress: 'Av. Goiás, 456 - Setor Central',
        service: 'Corte + Coloração',
        date: '2025-10-30',
        time: '11:00',
        duration: 90,
        price: 75.00,
        status: 'confirmed',
        barberName: 'Ricardo Costa',
        barbershopPhone: '(62) 94444-4444'
      },
      {
        id: 6,
        barbershopName: 'Elite Barber',
        barbershopAddress: 'Av. T-4, 890 - Setor Bueno',
        service: 'Spa Completo',
        date: '2025-11-02',
        time: '18:00',
        duration: 120,
        price: 150.00,
        status: 'confirmed',
        barberName: 'Fernando Alves',
        barbershopPhone: '(62) 92222-2222'
      },
      {
        id: 7,
        barbershopName: 'Cortes & Barbas',
        barbershopAddress: 'Rua 5, 100 - Setor Sul',
        service: 'Corte Simples',
        date: '2025-10-18',
        time: '09:30',
        duration: 25,
        price: 30.00,
        status: 'completed',
        barberName: 'Paulo Rocha',
        barbershopPhone: '(62) 96666-6666'
      },
      {
        id: 8,
        barbershopName: 'Barbearia Moderna',
        barbershopAddress: 'Rua 15, 321 - Jardim América',
        service: 'Corte + Barba',
        date: '2025-10-26',
        time: '13:00',
        duration: 40,
        price: 45.00,
        status: 'confirmed',
        barberName: 'Lucas Martins',
        barbershopPhone: '(62) 93333-3333'
      }
    ];
    
    // Tentar buscar da API, mas sempre usar mocks se falhar ou estiver vazio
    try {
      const data = await appointmentService.getClientAppointments(user.id);
      const appointmentsList = data.appointments || data || [];
      
      if (appointmentsList.length > 0) {
        console.log('✅ Agendamentos carregados da API:', appointmentsList.length);
        setAppointments(appointmentsList);
      } else {
        console.log('⚠️ API sem dados, usando mocks de agendamentos.');
        setAppointments(mockData);
      }
    } catch (error) {
      console.log('❌ Erro na API de agendamentos, usando mocks:', error.message);
      setAppointments(mockData);
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
    
    if (date && barbershopId) {
      try {
        const data = await appointmentService.getAvailableSlots(barbershopId, date);
        setAvailableSlots(data.availableSlots || data || []);
      } catch (error) {
        console.error('Erro ao buscar horários disponíveis:', error);
        // Usar horários padrão se a API falhar
        setAvailableSlots([
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
          '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
          '17:00', '17:30', '18:00', '18:30', '19:00'
        ]);
      }
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const isUpcoming = (date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') return apt.status === 'confirmed' && isUpcoming(apt.date);
    if (filterStatus === 'past') return apt.status === 'completed' || !isUpcoming(apt.date);
    if (filterStatus === 'cancelled') return apt.status === 'cancelled';
    return true;
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

  const formatPrice = (price) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) {
    return (
      <div className="appointments-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="appointments-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao carregar agendamentos</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchAppointments}>
            🔄 Tentar Novamente
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
        >
          Todos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterStatus('upcoming')}
        >
          Próximos
        </button>
        <button
          className={`filter-btn ${filterStatus === 'past' ? 'active' : ''}`}
          onClick={() => setFilterStatus('past')}
        >
          Realizados
        </button>
        <button
          className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelados
        </button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="appointments-list">
        {filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
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
                      <span className="detail-icon">✂️</span>
                      <span className="detail-value">{appointment.barberName}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-value">Amanhã</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">⏰</span>
                      <span className="detail-value">{appointment.time}</span>
                    </div>
                  </div>

                  {/* Footer com preço e ações */}
                  <div className="appointment-footer">
                    <div className="appointment-price">{formatPrice(appointment.price)}</div>
                    
                    <div className="appointment-actions">
                      <button
                        className="btn-warning"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetails(true);
                        }}
                      >
                        Ver detalhes
                      </button>

                      {appointment.status === 'confirmed' && isUpcoming(appointment.date) && (
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
                      )}
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
                <h3>🏪 Barbearia</h3>
                <p className="detail-title">{selectedAppointment.barbershopName}</p>
                <p className="detail-subtitle">📍 {selectedAppointment.barbershopAddress}</p>
                <p className="detail-subtitle">📞 {selectedAppointment.barbershopPhone}</p>
              </div>

              <div className="detail-section">
                <h3>✂️ Serviço</h3>
                <p className="detail-title">{selectedAppointment.service}</p>
                <p className="detail-subtitle">⏱️ Duração: {selectedAppointment.duration} minutos</p>
                <p className="detail-subtitle">💰 Valor: {formatPrice(selectedAppointment.price)}</p>
              </div>

              <div className="detail-section">
                <h3>📅 Data e Horário</h3>
                <p className="detail-title">{formatDate(selectedAppointment.date)}</p>
                <p className="detail-subtitle">⏰ {selectedAppointment.time}</p>
              </div>

              <div className="detail-section">
                <h3>👤 Barbeiro</h3>
                <p className="detail-title">{selectedAppointment.barberName}</p>
              </div>

              <div className="detail-section">
                <h3>📊 Status</h3>
                <span className={getStatusClass(selectedAppointment.status)}>
                  {getStatusLabel(selectedAppointment.status)}
                </span>
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
                <p>📅 {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')} às {selectedAppointment.time}</p>
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
                  disabled={!newDate}
                >
                  <option value="">
                    {!newDate ? 'Selecione uma data primeiro' : 'Selecione um horário'}
                  </option>
                  {availableSlots.length > 0 ? (
                    availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))
                  ) : newDate && (
                    <>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                    </>
                  )}
                </select>
                {newDate && availableSlots.length === 0 && (
                  <p style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>
                    ⏳ Carregando horários disponíveis...
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

