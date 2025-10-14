import React, { useState } from 'react';
import './TimeModal.css';

const TimeModal = ({ isOpen, onClose, selectedDate, selectedService, onBookingComplete }) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  const services = [
    { id: 'corte', name: 'Corte de Cabelo', duration: 30, price: 25 },
    { id: 'barba', name: 'Barba', duration: 20, price: 15 },
    { id: 'corte-barba', name: 'Corte + Barba', duration: 45, price: 35 },
    { id: 'tratamento', name: 'Tratamento Capilar', duration: 40, price: 30 },
    { id: 'noivo', name: 'Dia do Noivo', duration: 90, price: 80 }
  ];

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleBooking = async () => {
    if (!selectedTime || !selectedService) {
      alert('Por favor, selecione um horário e serviço');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const service = services.find(s => s.id === selectedService);
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        service: service,
        total: service.price
      };

      onBookingComplete(bookingData);
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Horários Disponíveis</h3>
          <p>{selectedDate?.toLocaleDateString('pt-BR')}</p>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="time-slots-grid">
            {timeSlots.map((time) => (
              <button
                key={time}
                className={`time-slot ${
                  selectedTime === time ? 'time-slot-selected' : ''
                }`}
                onClick={() => handleTimeClick(time)}
              >
                {time}
              </button>
            ))}
          </div>

          {selectedTime && selectedService && (
            <div className="booking-summary">
              <h4>Resumo do Agendamento</h4>
              <div className="summary-details">
                <div className="summary-item">
                  <span>Data:</span>
                  <strong>{selectedDate?.toLocaleDateString('pt-BR')}</strong>
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
                  <strong>{getSelectedService().duration} min</strong>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <strong>R$ {getSelectedService().price}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirm"
            onClick={handleBooking}
            disabled={!selectedTime || !selectedService || isLoading}
          >
            {isLoading ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeModal;
