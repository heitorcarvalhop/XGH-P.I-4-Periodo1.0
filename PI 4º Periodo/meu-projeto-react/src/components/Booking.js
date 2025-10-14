import React, { useState } from 'react';
import Calendar from './Calendar';
import './Booking.css';

const Booking = ({ onBookingComplete, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const services = [
    { id: 'corte', name: 'Corte de Cabelo', duration: 30, price: 25 },
    { id: 'barba', name: 'Barba', duration: 20, price: 15 },
    { id: 'corte-barba', name: 'Corte + Barba', duration: 45, price: 35 },
    { id: 'tratamento', name: 'Tratamento Capilar', duration: 40, price: 30 },
    { id: 'noivo', name: 'Dia do Noivo', duration: 90, price: 80 }
  ];

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

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      alert('Por favor, selecione data, horário e serviço');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        service: services.find(s => s.id === selectedService),
        total: services.find(s => s.id === selectedService).price
      };

      onBookingComplete(bookingData);
    } catch (error) {
      console.error('Erro ao fazer agendamento:', error);
      alert('Erro ao fazer agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedService = () => {
    return services.find(s => s.id === selectedService);
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
          <p>Escolha a data e horário para seu atendimento</p>
        </div>

        <div className="booking-content">
          {/* Seleção de Serviço */}
          <div className="booking-section">
            <h3>1. Escolha o Serviço</h3>
            <div className="services-grid">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`service-card ${
                    selectedService === service.id ? 'service-card-selected' : ''
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <h4>{service.name}</h4>
                  <p className="service-duration">{service.duration} min</p>
                  <p className="service-price">R$ {service.price}</p>
                </button>
              ))}
            </div>
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
          {selectedDate && selectedTime && selectedService && (
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
                  <span>Serviço:</span>
                  <strong>{getSelectedService().name}</strong>
                </div>
                <div className="summary-item">
                  <span>Duração:</span>
                  <strong>{getSelectedService().duration} minutos</strong>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <strong>R$ {getSelectedService().price}</strong>
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
              disabled={!selectedDate || !selectedTime || !selectedService || isLoading}
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
