import React, { useState } from 'react';
import './HomePage.css';
import Navbar from './Navbar';
import Calendar from './Calendar';
import TimeModal from './TimeModal';

const HomePage = ({ onLogin, onRegister, user, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const services = [
    { id: 'corte', name: 'Corte de Cabelo', duration: 30, price: 25 },
    { id: 'barba', name: 'Barba', duration: 20, price: 15 },
    { id: 'corte-barba', name: 'Corte + Barba', duration: 45, price: 35 },
    { id: 'tratamento', name: 'Tratamento Capilar', duration: 40, price: 30 },
    { id: 'noivo', name: 'Dia do Noivo', duration: 90, price: 80 }
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsTimeModalOpen(true);
  };

  const handleBookingComplete = (bookingData) => {
    console.log('Agendamento realizado:', bookingData);
    alert(`Agendamento confirmado para ${bookingData.date.toLocaleDateString('pt-BR')} às ${bookingData.time}`);
    // Reset form
    setSelectedDate(null);
    setSelectedService('');
    setIsTimeModalOpen(false);
  };

  return (
    <div className="homepage">
      <Navbar 
        onLogin={onLogin}
        onRegister={onRegister}
        user={user}
        onLogout={onLogout}
      />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            BarberShop
            <span className="hero-subtitle">Estilo & Tradição</span>
          </h1>
          <p className="hero-description">
            Descubra o melhor em cortes de cabelo, barba e cuidados masculinos. 
            Tradição e modernidade se encontram em cada atendimento.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onLogin}>Entrar</button>
            <button className="btn-secondary" onClick={onRegister}>Cadastrar</button>
          </div>
        </div>
        <div className="hero-calendar">
          <Calendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            compact={true}
          />
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Nossos Serviços</h2>
          <div className="services-grid">
            {services.map((service) => (
              <button
                key={service.id}
                className={`service-card ${
                  selectedService === service.id ? 'service-card-selected' : ''
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="service-icon">
                  {service.id === 'corte' && '✂️'}
                  {service.id === 'barba' && '🧔'}
                  {service.id === 'corte-barba' && '✂️🧔'}
                  {service.id === 'tratamento' && '💆'}
                  {service.id === 'noivo' && '💒'}
                </div>
                <h4>{service.name}</h4>
                <p className="service-duration">{service.duration} min</p>
                <span className="service-price">R$ {service.price}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Sobre Nós</h2>
              <p>
                Com mais de 10 anos de experiência, nossa barbearia combina 
                técnicas tradicionais com tendências modernas. Cada cliente 
                é único e merece um atendimento personalizado.
              </p>
              <div className="about-features">
                <div className="feature">
                  <span className="feature-icon">⭐</span>
                  <span>Atendimento Premium</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🕒</span>
                  <span>Horários Flexíveis</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🏆</span>
                  <span>Qualidade Garantida</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="barber-tools"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Entre em Contato</h2>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <h4>Endereço</h4>
                <p>Rua das Barbearias, 123<br />Centro - São Paulo/SP</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <h4>Telefone</h4>
                <p>(11) 99999-9999</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🕒</span>
              <div>
                <h4>Horário</h4>
                <p>Seg - Sex: 8h às 18h<br />Sáb: 8h às 16h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Time Modal */}
      <TimeModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        selectedDate={selectedDate}
        selectedService={selectedService}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
};

export default HomePage;
