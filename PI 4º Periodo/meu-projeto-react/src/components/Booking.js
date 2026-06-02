import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import './Booking.css';
import { appointmentService } from '../services/api';

const Booking = ({ barbershop, user, onBookingComplete, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]); // Horários disponíveis do backend
  const [isLoadingSlots, setIsLoadingSlots] = useState(false); // Loading dos horários

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
        .map(service => {
          // Extrair o nome do serviço (pode ser string ou objeto)
          const serviceName = typeof service === 'string' ? service : service?.name || '';
          
          // Se o serviço vier como objeto do backend com price/duration, usar esses dados
          if (typeof service === 'object' && service?.name) {
            return {
              id: service.id || serviceName.toLowerCase(),
              name: service.name,
              duration: service.duration || allServicesMap[service.name]?.duration || 30,
              price: service.price || allServicesMap[service.name]?.price || 0
            };
          }
          
          // Caso contrário, buscar no mapa de serviços
          return allServicesMap[serviceName];
        })
        .filter(service => service !== undefined) // Remover serviços não mapeados
    : [];

  // Buscar horários disponíveis do backend quando uma data for selecionada
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !barbershop?.id) {
        setTimeSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      
      try {
        // Formatar data para o formato esperado pelo backend (YYYY-MM-DD)
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        console.log('📅 Buscando horários disponíveis para:', {
          barbershopId: barbershop.id,
          date: formattedDate
        });

        const response = await appointmentService.getAvailableSlots(
          barbershop.id,
          formattedDate,
          getServiceDuration() || 30
        );

        console.log('✅ Horários recebidos do backend:', response);

        // Extrair os horários da resposta
        // O backend pode retornar { availableSlots: [...] } ou apenas [...]
        const slots = response.availableSlots || response.slots || response || [];
        
        setTimeSlots(slots);

        if (slots.length === 0) {
          console.warn('⚠️ Nenhum horário disponível para esta data');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar horários disponíveis:', error);
        
        // Mostrar mensagem de erro específica
        const errorMessage = error.message || 'Erro ao buscar horários disponíveis';
        
        if (errorMessage.includes('Backend não disponível') || errorMessage.includes('não disponível')) {
          console.error('Backend não está disponível. Usando horários padrão como fallback.');
          // Fallback: usar horários padrão se o backend não estiver disponível
          setTimeSlots([
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
            '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30', '19:00'
          ]);
        } else {
          setTimeSlots([]);
        }
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, barbershop, selectedServices]);

  // Datas desabilitadas (exemplo: domingos e feriados)
  const disabledDates = [
    // Adicione aqui as datas que devem ser desabilitadas
    // Formato: 'YYYY-MM-DD'
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleServiceSelection = (service) => {
    setSelectedServices((currentServices) => {
      const isSelected = currentServices.some((selected) => selected.id === service.id);
      return isSelected
        ? currentServices.filter((selected) => selected.id !== service.id)
        : [...currentServices, service];
    });
    setSelectedTime('');
  };

  const getServiceDuration = () => {
    return selectedServices.reduce((total, service) => total + Number(service.duration || 0), 0);
  };

  const getServicePrice = () => {
    return selectedServices.reduce((total, service) => total + Number(service.price || 0), 0);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      alert('Por favor, selecione data, horário e pelo menos um serviço');
      return;
    }

    setIsLoading(true);
    
    try {
      // Formatar data para o formato esperado pelo backend (YYYY-MM-DD)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const serviceIds = selectedServices.map((service) => Number(service.id));
      
      const appointmentData = {
        clientId: user?.id,
        barbershopId: barbershop?.id,
        barberId: 1, // ID fixo do barbeiro por enquanto (ajustar conforme necessário)
        serviceId: serviceIds[0],
        serviceIds,
        date: formattedDate,
        time: selectedTime
      };

      console.log('📤 Enviando agendamento para o backend:', appointmentData);
      console.log('📋 Serviços selecionados:', selectedServices);
      
      // Chamar API real
      const response = await appointmentService.createAppointment(appointmentData);
      
      console.log('✅ Agendamento salvo no backend:', response);
      
      // Preparar dados completos para o callback (com informações locais)
      const bookingData = {
        id: response.id || response.appointment?.id,
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
        date: formattedDate,
        time: selectedTime,
        service: selectedServices.map((service) => service.name).join(' + '),
        services: selectedServices.map((service) => service.name),
        duration: getServiceDuration(),
        total: getServicePrice(),
        status: response.status || 'pending'
      };

      onBookingComplete(bookingData);
    } catch (error) {
      console.error('❌ Erro ao fazer agendamento:', error);
      
      // Mostrar mensagem de erro específica
      const errorMessage = error.message || 'Erro ao fazer agendamento. Tente novamente.';
      
      if (errorMessage.includes('Backend não disponível') || errorMessage.includes('não disponível')) {
        alert('Backend não está disponível. Verifique se o servidor está rodando em http://localhost:8080');
      } else {
        alert(`Erro ao fazer agendamento: ${errorMessage}`);
      }
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
            <h3>1. Escolha o Serviço</h3>
            <p className="section-hint">Selecione um ou mais serviços para o atendimento</p>
            {services.length > 0 ? (
              <div className="services-grid">
                {services.map((service) => (
                  <button
                    key={service.id}
                    className={`service-card ${
                      selectedServices.some((selected) => selected.id === service.id) ? 'service-card-selected' : ''
                    }`}
                    onClick={() => handleServiceSelection(service)}
                  >
                    <div className="service-card-checkbox">
                      {selectedServices.some((selected) => selected.id === service.id) && (
                        <div className="radio-dot"></div>
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
              
              {isLoadingSlots ? (
                <div className="loading-slots">
                  <div className="spinner"></div>
                  <p>Carregando horários disponíveis...</p>
                </div>
              ) : timeSlots.length > 0 ? (
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
              ) : (
                <div className="no-slots-message">
                  <p>⚠️ Nenhum horário disponível para esta data.</p>
                  <p className="hint-text">Por favor, selecione outra data.</p>
                </div>
              )}
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
                  <strong>{selectedServices.map((service) => service.name).join(' + ')}</strong>
                </div>
                <div className="summary-item">
                  <span>Duração:</span>
                  <strong>{getServiceDuration()} minutos</strong>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <strong>R$ {getServicePrice()}</strong>
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
