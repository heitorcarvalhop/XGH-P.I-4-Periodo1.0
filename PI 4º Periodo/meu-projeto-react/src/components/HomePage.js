import React, { useState, useEffect } from 'react';
import './HomePage.css';
import SimpleMap from './SimpleMap';
import Appointments from './Appointments';
import Profile from './Profile';
import BarberDetails from './BarberDetails';
import { barbershopService } from '../services/api';
import { 
  House, Calendar, Heart, User, Scissors, Map, 
  MapPin, Smartphone, Search, LogOut,
  AlertTriangle, Frown, RotateCw,
  ClipboardList
} from "lucide-react";

// Importar imagens das barbearias
import Barbearia1 from '../images/Barbearia1.jpg';
import Barbearia2 from '../images/Barbearia2.jpg';
import Barbearia3 from '../images/Barbearia3.webp';
import Barbearia4 from '../images/Barbearia4.jpg';

// Localização fixa: Faculdade SENAI Fatesg, Goiânia
// Coordenadas exatas da faculdade
const USER_LOCATION = {
  latitude: -16.671054036464717,
  longitude: -49.2388158932536,
  name: 'Faculdade SENAI Fatesg'
};

const HomePage = ({ onLogin, onRegister, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minRating, setMinRating] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState('list+map'); // 'list' ou 'list+map'
  const [barbershops, setBarbershops] = useState([]);
  const [isLoadingBarbershops, setIsLoadingBarbershops] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBarbershop, setSelectedBarbershop] = useState(null);

  // Função para calcular distância usando fórmula de Haversine
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Validar se os parâmetros são números válidos
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.warn('⚠️ Coordenadas inválidas:', { lat1, lon1, lat2, lon2 });
      return 999;
    }

    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    console.log('📏 Distância calculada:', {
      de: `${lat1}, ${lon1}`,
      para: `${lat2}, ${lon2}`,
      distancia: `${distance.toFixed(3)} km`
    });
    
    // Retornar com mais precisão (3 casas decimais) para permitir conversão precisa
    return parseFloat(distance.toFixed(3));
  };

  // Função para formatar distância (km ou metros)
  const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
      // Menor que 1 km, mostrar em metros
      const meters = Math.round(distanceInKm * 1000);
      return `${meters} m`;
    } else {
      // 1 km ou mais, mostrar em km
      return `${distanceInKm.toFixed(1)} km`;
    }
  };

  // Verificar se o usuário precisa completar o perfil
  useEffect(() => {
    if (user) {
      // Verificar se falta telefone
      const needsPhone = !user.phone || user.phone.trim() === '';
      
      // Verificar se já mostrou o prompt nesta sessão
      const promptShown = sessionStorage.getItem('profilePromptShown');
      
      if (needsPhone && !promptShown) {
        setShowProfilePrompt(true);
      }
    }
  }, [user]);

  // Buscar barbearias da API ao carregar o componente
  useEffect(() => {
    const fetchBarbershops = async () => {
      setIsLoadingBarbershops(true);
      setApiError(null);
      
      try {
        console.log('🔍 Buscando barbearias do backend...');
        const response = await barbershopService.getAllBarbershops();
        
        if (response && response.barbershops && response.barbershops.length > 0) {
          console.log('✅ Barbearias carregadas da API:', response.barbershops.length);
          console.log('🔍 Dados da primeira barbearia:', response.barbershops[0]);
          
          // Calcular distância real para cada barbearia
          const barbershopsWithDistance = response.barbershops.map(shop => {
            console.log(`🏪 Processando ${shop.name}:`, {
              latitude: shop.latitude,
              longitude: shop.longitude,
              phone: shop.phone,
              openingHours: shop.openingHours,
              tipo_lat: typeof shop.latitude,
              tipo_lon: typeof shop.longitude
            });
            
            if (shop.latitude && shop.longitude) {
              const distance = calculateDistance(
                USER_LOCATION.latitude,
                USER_LOCATION.longitude,
                parseFloat(shop.latitude),
                parseFloat(shop.longitude)
              );
              
              // Adicionar imagem padrão se não tiver
              const imageMap = {
                1: Barbearia1,
                2: Barbearia2,
                3: Barbearia3,
                4: Barbearia4
              };
              const defaultImage = imageMap[shop.id % 4 || 1];
              
              return { 
                ...shop, 
                distance,
                image: shop.image || defaultImage
              };
            }
            console.warn(`⚠️ ${shop.name} não tem coordenadas válidas`);
            return { ...shop, distance: 999 }; // Se não tiver coordenadas, coloca distância alta
          });
          
          // Ordenar por distância
          barbershopsWithDistance.sort((a, b) => a.distance - b.distance);
          
          console.log('📍 Distâncias calculadas a partir de:', USER_LOCATION.name);
          setBarbershops(barbershopsWithDistance);
        } else {
          console.warn('⚠️ API retornou resposta vazia');
          setApiError('Nenhuma barbearia cadastrada no sistema.');
          setBarbershops([]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar barbearias:', error.message);
        
        // Definir mensagem de erro apropriada
        let errorMsg = 'Erro ao carregar barbearias.';
        if (error.message.includes('Backend não disponível') || error.message.includes('Erro de conexão')) {
          errorMsg = 'Servidor indisponível. Verifique se o backend está rodando em http://localhost:8080';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setApiError(errorMsg);
        setBarbershops([]);
      } finally {
        setIsLoadingBarbershops(false);
      }
    };

    fetchBarbershops();
  }, []);

  // Função para buscar dados completos de uma barbearia
  const handleSelectBarbershop = async (shop) => {
    try {
      console.log('🔍 Buscando dados completos da barbearia:', shop.id);
      
      // Buscar dados completos do backend
      const response = await barbershopService.getBarbershopById(shop.id);
      console.log('✅ Dados completos recebidos:', response);
      
      // Combinar dados da listagem (que tem distance calculada) com dados completos da API
      const completeData = {
        ...shop, // Preserva distance, image, etc.
        ...response.barbershop || response, // Sobrescreve com dados completos
        // Garantir que phone e openingHours estejam presentes
        phone: (response.barbershop?.phone || response.phone) || shop.phone || 'Não informado',
        openingHours: (response.barbershop?.openingHours || response.openingHours || response.hours) || shop.openingHours || 'Horário não informado'
      };
      
      console.log('📋 Dados finais da barbearia:', completeData);
      setSelectedBarbershop(completeData);
    } catch (error) {
      console.error('❌ Erro ao buscar dados completos da barbearia:', error.message);
      
      // Se falhar, usar dados da listagem mesmo (com fallbacks)
      const fallbackData = {
        ...shop,
        phone: shop.phone || 'Não informado',
        openingHours: shop.openingHours || 'Seg-Sex: 9h-19h, Sáb: 9h-17h'
      };
      
      setSelectedBarbershop(fallbackData);
    }
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
    { id: 'home', label: 'Início', icon: House },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'profile', label: 'Perfil', icon: User }
  ];

  const handleNavigation = (itemId) => {
    setActiveTab(itemId);
  };

  const filteredBarbershops = barbershops.filter(shop => {
    const distanceMatch = shop.distance <= maxDistance;
    const ratingMatch = minRating === 'all' || shop.rating >= parseFloat(minRating);
    const priceMatch = priceRange === 'all' || 
      (priceRange === 'low' && shop.price <= 40) ||
      (priceRange === 'medium' && shop.price > 40 && shop.price <= 60) ||
      (priceRange === 'high' && shop.price > 60);
    
    return distanceMatch && ratingMatch && priceMatch;
  });

  // Se uma barbearia foi selecionada, mostrar detalhes
  if (selectedBarbershop) {
    return (
      <BarberDetails 
        barbershop={selectedBarbershop}
        onBack={() => setSelectedBarbershop(null)}
        user={user}
      />
    );
  }

  return (
    <div className="homepage">
      {/* Sidebar de Navegação */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">
        <Scissors size={28} strokeWidth={1.8} color="#d4af37" /> {/* ícone Lucide */}
      </span>
              <span className="logo-text">BarberHub</span>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="nav-icon">
                  <item.icon size={20} /> {/* ← Aqui é o segredo */}
                </span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Área Principal */}
      <div className="main-content">
        {/* Header */}
        <div className="main-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar barbearias próximas..."
              className="search-input"
            />
                </div>
          <div className="header-actions">
            <button className="location-btn" title={`Calculando distâncias a partir de: ${USER_LOCATION.name}`}>
              <MapPin size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
              {USER_LOCATION.name}
            </button>
            <button className="favorites-btn">
              <Heart size={22} strokeWidth={2} color="#ff4d6d" /> {/* ícone Lucide */}
            </button>            
            <div className={`user-menu ${isDropdownOpen ? 'active' : ''}`}>
              <div className="user-avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span>{user?.name?.charAt(0) || 'U'}</span>
                </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-name">{user?.name || 'Usuário'}</span>
                  <span className="user-type">{user?.userType === 'barber' ? 'Barbeiro' : 'Cliente'}</span>
                </div>
                <button 
                  className="profile-btn" 
                  onClick={() => {
                    setActiveTab('profile');
                    setIsDropdownOpen(false);
                  }}
                >
                  <span className="logo-icon">
                    <User size={28} strokeWidth={1.8} color="#d4af37" /> {/* ícone Lucide */}
                  </span>                  
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

        {/* Banner de Completar Perfil */}
        {showProfilePrompt && (
          <div className="profile-prompt-banner">
            <div className="prompt-content">
              <div className="prompt-icon">
                <Smartphone size={32} strokeWidth={2} color="#d4af37" />
              </div>
              <div className="prompt-text">
                <h3>Complete seu perfil</h3>
                <p>Adicione seu telefone para que as barbearias possam entrar em contato com você!</p>
              </div>
              <div className="prompt-actions">
                <button 
                  className="btn-complete-profile" 
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfilePrompt(false);
                    sessionStorage.setItem('profilePromptShown', 'true');
                  }}
                >
                  Adicionar telefone
                </button>
                <button 
                  className="btn-dismiss-prompt" 
                  onClick={() => {
                    setShowProfilePrompt(false);
                    sessionStorage.setItem('profilePromptShown', 'true');
                  }}
                >
                  Mais tarde
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="content-area">
          {/* Renderizar conteúdo baseado na tab ativa */}
          {activeTab === 'appointments' ? (
            <Appointments user={user} />
          ) : activeTab === 'home' ? (
          <div className="content-layout">
            {/* Seção de Barbearias */}
            <div className="barbershops-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Barbearias próximas</h2>
                  <span className="results-count">{filteredBarbershops.length} barbearias encontradas</span>
                </div>
                <button 
                  className="view-toggle"
                  onClick={() => setViewMode(viewMode === 'list' ? 'list+map' : 'list')}
                >
                  {viewMode === 'list' ? (
                    <Map size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
                  ) : (
                    <ClipboardList size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
                  )}
                  {viewMode === 'list' ? 'Mostrar Mapa' : 'Apenas Lista'}
                </button>
              </div>

              {/* Filtros */}
              <div className="filters-section">
                <div className="filters-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} strokeWidth={2} />
                    Filtros
                  </h3>
                  <button 
                    className="toggle-filters"
                    onClick={() => setFiltersVisible(!filtersVisible)}
                  >
                    {filtersVisible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                {filtersVisible && (
                  <div className="filters-content">
                    {/* Info de Localização */}
                    <div className="location-info" style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '20px',
                      fontSize: '13px',
                      color: '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <MapPin size={16} strokeWidth={2} />
                      <span>Distâncias calculadas a partir de: <strong>{USER_LOCATION.name}</strong></span>
                    </div>

                    {/* Distância Máxima */}
                    <div className="filter-group">
                      <label>Distância máxima</label>
                      <div className="slider-container">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={maxDistance}
                          onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                          className="distance-slider"
                          style={{
                            background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((maxDistance - 1) / 9) * 100}%, #333333 ${((maxDistance - 1) / 9) * 100}%, #333333 100%)`
                          }}
                        />
                        <div className="slider-labels">
                          <span>1 km</span>
                          <span>{maxDistance} km</span>
                          <span>10 km</span>
                        </div>
                      </div>
                    </div>

                    {/* Avaliação Mínima */}
                    <div className="filter-group">
                      <label>Avaliação mínima</label>
                      <div className="rating-buttons">
                        {[
                          { value: 'all', label: 'Todas' },
                          { value: '3', label: '3+ ★' },
                          { value: '4', label: '4+ ★' },
                          { value: '4.5', label: '4.5+ ★' }
                        ].map((rating) => (
                          <button
                            key={rating.value}
                            className={`rating-btn ${minRating === rating.value ? 'active' : ''}`}
                            onClick={() => setMinRating(rating.value)}
                          >
                            {rating.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Faixa de Preço */}
                    <div className="filter-group">
                      <label>Faixa de preço</label>
                      <div className="price-buttons">
                        {[
                          { value: 'all', label: 'Todos' },
                          { value: 'low', label: 'R$ (até R$40)' },
                          { value: 'medium', label: 'R$R$ (R$40-60)' },
                          { value: 'high', label: 'R$R$R$ (R$60+)' }
                        ].map((price) => (
                          <button
                            key={price.value}
                            className={`price-btn ${priceRange === price.value ? 'active' : ''}`}
                            onClick={() => setPriceRange(price.value)}
                          >
                            {price.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="filter-footer">
                      <span>{filteredBarbershops.length} barbearias encontradas</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Barbearias */}
              <div className="barbershops-list">
                {isLoadingBarbershops ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <RotateCw size={48} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>Carregando barbearias...</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>Conectando ao servidor...</p>
                  </div>
                ) : apiError ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <AlertTriangle size={48} strokeWidth={2} color="#ff6b6b" />
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>
                      Erro ao carregar barbearias
                    </p>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                      {apiError}
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      style={{
                        background: '#d4af37',
                        color: '#000',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <RotateCw size={16} strokeWidth={2} />
                      Tentar Novamente
                    </button>
                  </div>
                ) : filteredBarbershops.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <Frown size={48} strokeWidth={2} color="#888" />
                    <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>
                      Nenhuma barbearia encontrada
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {barbershops.length === 0 
                        ? 'Não há barbearias cadastradas no sistema.'
                        : 'Tente ajustar os filtros de busca.'}
                    </p>
                  </div>
                ) : (
                  filteredBarbershops.map((shop) => (
                  <div key={shop.id} className="barbershop-card">
                    <div className="shop-image">
                      <img src={shop.image} alt={shop.name} />
                    </div>
                    <div className="shop-info">
                      <h4>{shop.name}</h4>
                      <div className="shop-rating">
                        <span className="stars">★{shop.rating}</span>
                        <span className="reviews">({shop.reviews})</span>
                      </div>
                      <div className="shop-details">
                        <span className="price">A partir de R${shop.price}</span>
                        <span className="distance">{formatDistance(shop.distance)}</span>
                      </div>
                      <div className="shop-services">
                        {shop.services.map((service, index) => {
                          // Extrair o nome do serviço (pode ser string ou objeto)
                          const serviceName = typeof service === 'string' ? service : service?.name || 'Serviço';
                          return (
                            <span key={index} className="service-tag">{serviceName}</span>
                          );
                        })}
                      </div>
                      <button 
                        className="view-details-btn"
                        onClick={() => handleSelectBarbershop(shop)}
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Mapa */}
            <div className={`map-section ${viewMode === 'list' ? 'map-hidden' : ''}`}>
              <div className="map-container">
                <div className="map-header flex items-center gap-2">
                  <Map size={22} color="#d4af37" strokeWidth={2} /> {/* ícone Lucide */}
                  <h3 className="map-title font-semibold text-lg">Mapa de Localização</h3>
                </div>
                <div className="map-content">
                  <SimpleMap barbershops={filteredBarbershops} userLocation={USER_LOCATION} />
                </div>
              </div>
            </div>
          </div>
          ) : activeTab === 'favorites' ? (
            <div className="coming-soon">
              <div className="coming-soon-content">
                <div className="coming-soon-icon">
                  <Heart size={64} strokeWidth={2} color="#ff4d6d" fill="#ff4d6d" />
                </div>
                <h2>Favoritos</h2>
                <p>Esta funcionalidade estará disponível em breve!</p>
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <Profile user={user} onUpdateUser={(updatedUser) => {
              // Atualizar usuário no localStorage e estado
              localStorage.setItem('user', JSON.stringify(updatedUser));
              // Se tiver um setState para user, usar aqui
            }} onLogout={onLogout} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
