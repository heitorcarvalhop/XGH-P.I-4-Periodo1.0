import React, { useState } from 'react';
import Calendar from './Calendar';
import './Booking.css';

const Booking = ({ barbershop, user, onBookingComplete, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]); // Array para múltiplos serviços
  const [isLoading, setIsLoading] = useState(false);

  // Mapeamento completo de todos os serviços disponíveis
  const allServicesMap = {
    'Corte': { id: 'corte', name: 'Corte de Cabelo', duration: 30, price: 35 },
    'Barba': { id: 'barba', name: 'Barba', duration: 20, price: 25 },
    'Sobrancelha': { id: 'sobrancelha', name: 'Sobrancelha', duration: 15, price: 15 },
    'Escova': { id: 'escova', name: 'Escova', duration: 25, price: 20 },
    'Tratamento Capilar': { id: 'tratamento', name: 'Tratamento Capilar', duration: 40, price: 45 },
    'Massagem': { id: 'massagem', name: 'Massagem', duration: 30, price: 30 },
    'Coloração': { id: 'coloracao', name: 'Coloração', duration: 60, price: 60 },
    'Spa': { id: 'spa', name: 'Spa Capilar', duration: 90, price: 100 }
  };

  // Filtrar apenas os serviços que a barbearia oferece
  const services = barbershop?.services 
    ? barbershop.services
        .map(serviceName => allServicesMap[serviceName])
        .filter(service => service !== undefined) // Remover serviços não mapeados
    : [];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  // Datas desabilitadas (exemplo: domingos e feriados)
  const disabledDates = [
    // Adicione aqui as datas que devem ser desabilitadas
    // Formato: 'YYYY-MM-DD'
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  // Função para selecionar/desselecionar serviços
  const toggleServiceSelection = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        // Remove se já estiver selecionado
        return prev.filter(id => id !== serviceId);
      } else {
        // Adiciona se não estiver selecionado
        return [...prev, serviceId];
      }
    });
  };

  // Calcular duração total dos serviços selecionados
  const getTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  // Calcular preço total dos serviços selecionados
  const getTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  // Obter lista de serviços selecionados
  const getSelectedServicesList = () => {
    return selectedServices.map(serviceId => 
      services.find(s => s.id === serviceId)
    ).filter(s => s !== undefined);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      alert('Por favor, selecione data, horário e pelo menos um serviço');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedServicesData = getSelectedServicesList();
      
      const bookingData = {
        barbershop: {
          id: barbershop?.id,
          name: barbershop?.name,
          address: barbershop?.address,
          phone: barbershop?.phone
        },
        customer: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          phone: user?.phone
        },
        date: selectedDate,
        time: selectedTime,
        services: selectedServicesData, // Array de serviços
        totalDuration: getTotalDuration(),
        total: getTotalPrice(),
        status: 'pending'
      };

      console.log('Agendamento criado:', bookingData);
      onBookingComplete(bookingData);
    } catch (error) {
      console.error('Erro ao fazer agendamento:', error);
      alert('Erro ao fazer agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        <div className="booking-header">
          <button 
            className="back-button"
            onClick={onCancel}
            title="Voltar"
          >
            <svg className="back-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2>Agendar Horário</h2>
          <p>{barbershop?.name ? `${barbershop.name}` : 'Escolha a data e horário para seu atendimento'}</p>
        </div>

        <div className="booking-content">
          {/* Seleção de Serviço */}
          <div className="booking-section">
            <h3>1. Escolha os Serviços</h3>
            <p className="section-hint">Você pode selecionar múltiplos serviços</p>
            {services.length > 0 ? (
              <div className="services-grid">
                {services.map((service) => (
                  <button
                    key={service.id}
                    className={`service-card ${
                      selectedServices.includes(service.id) ? 'service-card-selected' : ''
                    }`}
                    onClick={() => toggleServiceSelection(service.id)}
                  >
                    <div className="service-card-checkbox">
                      {selectedServices.includes(service.id) && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <h4>{service.name}</h4>
                    <p className="service-duration">{service.duration} min</p>
                    <p className="service-price">R$ {service.price}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-services-message">
                <p>Esta barbearia ainda não cadastrou seus serviços.</p>
              </div>
            )}
          </div>

          {/* Calendário */}
          <div className="booking-section">
            <h3>2. Escolha a Data</h3>
            <Calendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              disabledDates={disabledDates}
            />
          </div>

          {/* Seleção de Horário */}
          {selectedDate && (
            <div className="booking-section">
              <h3>3. Escolha o Horário</h3>
              <div className="time-slots">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className={`time-slot ${
                      selectedTime === time ? 'time-slot-selected' : ''
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resumo do Agendamento */}
          {selectedDate && selectedTime && selectedServices.length > 0 && (
            <div className="booking-summary">
              <h3>Resumo do Agendamento</h3>
              <div className="summary-details">
                <div className="summary-item">
                  <span>Data:</span>
                  <strong>{selectedDate.toLocaleDateString('pt-BR')}</strong>
                </div>
                <div className="summary-item">
                  <span>Horário:</span>
                  <strong>{selectedTime}</strong>
                </div>
                <div className="summary-item">
                  <span>Serviços:</span>
                  <div className="services-summary">
                    {getSelectedServicesList().map((service, index) => (
                      <div key={index} className="service-summary-item">
                        <span>• {service.name}</span>
                        <span>R$ {service.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="summary-item">
                  <span>Duração Total:</span>
                  <strong>{getTotalDuration()} minutos</strong>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <strong>R$ {getTotalPrice()}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="booking-actions">
            <button 
              className="btn-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary"
              onClick={handleBooking}
              disabled={!selectedDate || !selectedTime || selectedServices.length === 0 || isLoading}
            >
              {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
