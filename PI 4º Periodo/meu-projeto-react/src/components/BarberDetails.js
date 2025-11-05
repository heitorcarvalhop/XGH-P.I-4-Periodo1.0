import React, { useState, useEffect } from 'react';
import './BarberDetails.css';
import Booking from './Booking';
import { 
  MapPin, Phone, Clock, Star, DollarSign, 
  Calendar, Heart, Share2, CheckCircle, Users
} from "lucide-react";

const BarberDetails = ({ barbershop, onBack, user }) => {
  const [showBooking, setShowBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Bloquear scroll quando o modal estiver aberto
  useEffect(() => {
    if (showBooking) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup quando o componente for desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showBooking]);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aqui você pode adicionar lógica para salvar nos favoritos
  };

  const handleShare = () => {
    // Lógica para compartilhar
    if (navigator.share) {
      navigator.share({
        title: barbershop.name,
        text: `Confira ${barbershop.name} no BarberHub!`,
        url: window.location.href,
      }).catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
      alert('Link copiado para a área de transferência!');
    }
  };

  // Gerar avaliações mock baseadas no rating
  const generateReviews = () => {
    const reviews = [
      {
        id: 1,
        name: 'João Silva',
        rating: 5,
        date: '2024-11-01',
        comment: 'Excelente atendimento! Profissionais muito capacitados.',
      },
      {
        id: 2,
        name: 'Pedro Santos',
        rating: 4,
        date: '2024-10-28',
        comment: 'Ótimo ambiente e serviço de qualidade. Recomendo!',
      },
      {
        id: 3,
        name: 'Carlos Oliveira',
        rating: 5,
        date: '2024-10-25',
        comment: 'Melhor barbearia da região. Sempre saio satisfeito!',
      },
    ];
    return reviews;
  };

  const reviews = generateReviews();

  // Mapeamento de preços dos serviços (alinhado com Booking.js)
  const servicePrices = {
    'Corte': 35,
    'Barba': 25,
    'Sobrancelha': 15,
    'Escova': 20,
    'Tratamento Capilar': 45,
    'Massagem': 30,
    'Coloração': 60,
    'Spa': 100,
  };

  const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
      const meters = Math.round(distanceInKm * 1000);
      return `${meters} m`;
    } else {
      return `${distanceInKm.toFixed(1)} km`;
    }
  };

  return (
    <div className="barber-details-container">
      <div className="barber-details-content">
        {/* Header com botão de voltar */}
        <div className="details-header">
          <button 
            className="back-button" 
            onClick={onBack}
            title="Voltar"
          >
            <svg className="back-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="header-actions">
            <button 
              className={`icon-button ${isFavorite ? 'favorite-active' : ''}`}
              onClick={handleToggleFavorite}
              title="Adicionar aos favoritos"
            >
              <Heart size={24} fill={isFavorite ? '#ff4d6d' : 'none'} />
            </button>
            <button 
              className="icon-button"
              onClick={handleShare}
              title="Compartilhar"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Imagem principal */}
        <div className="details-banner">
          <img 
            src={barbershop.image || 'https://via.placeholder.com/800x400?text=Barbearia'} 
            alt={barbershop.name}
          />
          <div className="banner-overlay">
            <h1>{barbershop.name}</h1>
            <div className="rating-badge">
              <Star size={20} fill="#d4af37" color="#d4af37" />
              <span>{barbershop.rating}</span>
            </div>
          </div>
        </div>

        {/* Informações principais */}
        <div className="details-main">
          <div className="info-cards">
            <div className="info-card">
              <MapPin size={24} color="#d4af37" />
              <div>
                <h3>Localização</h3>
                <p>{barbershop.address}</p>
                <span className="distance-badge">{formatDistance(barbershop.distance)}</span>
              </div>
            </div>

            <div className="info-card">
              <Phone size={24} color="#d4af37" />
              <div>
                <h3>Telefone</h3>
                <p>{barbershop.phone}</p>
              </div>
            </div>

            <div className="info-card">
              <Clock size={24} color="#d4af37" />
              <div>
                <h3>Horário de Funcionamento</h3>
                <p>{barbershop.openingHours || 'Seg-Sex: 9h-19h, Sáb: 9h-17h'}</p>
              </div>
            </div>

            <div className="info-card">
              <DollarSign size={24} color="#d4af37" />
              <div>
                <h3>Preço médio</h3>
                <p>A partir de R$ {barbershop.price}</p>
              </div>
            </div>
          </div>

          {/* Serviços oferecidos */}
          <div className="services-section">
            <h2>
              <CheckCircle size={24} color="#d4af37" />
              Serviços Oferecidos
            </h2>
            <div className="services-list">
              {barbershop.services && barbershop.services.map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-info">
                    <CheckCircle size={18} color="#4caf50" />
                    <span className="service-name">{service}</span>
                  </div>
                  <span className="service-price">
                    {servicePrices[service] ? `R$ ${servicePrices[service]}` : 'Sob consulta'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Avaliações */}
          <div className="reviews-section">
            <h2>
              <Users size={24} color="#d4af37" />
              Avaliações dos Clientes
            </h2>
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="rating-number">{barbershop.rating}</div>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < Math.floor(barbershop.rating) ? '#d4af37' : 'none'}
                      color="#d4af37"
                    />
                  ))}
                </div>
                <p>{reviews.length} avaliações</p>
              </div>
            </div>

            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4>{review.name}</h4>
                        <span className="review-date">
                          {new Date(review.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < review.rating ? '#d4af37' : 'none'}
                          color="#d4af37"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botão de agendamento fixo */}
        <div className="booking-footer">
          <div className="booking-footer-content">
            <div className="price-info">
              <span className="price-label">A partir de</span>
              <span className="price-value">R$ {barbershop.price}</span>
            </div>
            <button 
              className="btn-book-now"
              onClick={() => setShowBooking(true)}
            >
              <Calendar size={20} />
              <span>Agendar Horário</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Agendamento */}
      {showBooking && (
        <div className="booking-modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
            <Booking 
              barbershop={barbershop}
              user={user}
              onBookingComplete={(bookingData) => {
                console.log('Agendamento realizado:', bookingData);
                setShowBooking(false);
                // Aqui você pode adicionar uma notificação de sucesso
                alert('Agendamento realizado com sucesso!');
              }}
              onCancel={() => setShowBooking(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberDetails;

