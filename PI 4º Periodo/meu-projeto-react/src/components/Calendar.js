import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ onDateSelect, selectedDate, disabledDates = [], compact = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(selectedDate ? new Date(selectedDate) : null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Desabilitar datas passadas
    if (date < today) return true;
    
    // Desabilitar datas específicas (feriados, dias de folga, etc.)
    const dateString = date.toISOString().split('T')[0];
    return disabledDates.includes(dateString);
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDay) return false;
    return date.toDateString() === selectedDay.toDateString();
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      setSelectedDay(date);
      onDateSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
    onDateSelect(today);
  };

  useEffect(() => {
    if (selectedDate) {
      setSelectedDay(new Date(selectedDate));
      setCurrentDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`calendar-container ${compact ? 'calendar-compact' : ''}`}>
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn" 
          onClick={goToPreviousMonth}
          aria-label="Mês anterior"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="calendar-title">
          <h3>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        </div>
        
        <button 
          className="calendar-nav-btn" 
          onClick={goToNextMonth}
          aria-label="Próximo mês"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="calendar-weekdays">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, index) => (
          <button
            key={index}
            className={`calendar-day ${
              !date ? 'calendar-day-empty' : ''
            } ${
              isDateDisabled(date) ? 'calendar-day-disabled' : ''
            } ${
              isDateSelected(date) ? 'calendar-day-selected' : ''
            } ${
              date && date.getDay() === 0 ? 'calendar-day-sunday' : ''
            }`}
            onClick={() => handleDateClick(date)}
            disabled={isDateDisabled(date)}
          >
            {date && date.getDate()}
          </button>
        ))}
      </div>

      {!compact && (
        <div className="calendar-footer">
          <button 
            className="calendar-today-btn"
            onClick={goToToday}
          >
            Hoje
          </button>
          
          {selectedDay && (
            <div className="calendar-selected-info">
              <span>Data selecionada:</span>
              <strong>{selectedDay.toLocaleDateString('pt-BR')}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
