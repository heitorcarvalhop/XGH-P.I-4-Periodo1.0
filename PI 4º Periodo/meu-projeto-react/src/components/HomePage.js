import React, { useState, useEffect } from 'react';
import './HomePage.css';
import SimpleMap from './SimpleMap';
import Appointments from './Appointments';
import Profile from './Profile';
import { barbershopService } from '../services/api';
import { 
  House, Calendar, Heart, User, Scissors, Map, 
  MapPin, Smartphone, Search, LogOut, CheckCircle, 
  AlertTriangle, XCircle, Frown, RotateCw, Store,
  ClipboardList
} from "lucide-react";

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

  // Localização fixa: Faculdade SENAI Fatesg, Goiânia
  // Coordenadas exatas da faculdade
  const USER_LOCATION = {
    latitude: -16.671054036464717,
    longitude: -49.2388158932536,
    name: 'Faculdade SENAI Fatesg'
  };

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
      
      // Dados mock para desenvolvimento (sempre disponíveis)
      const mockBarbershops = [
          {
            id: 1,
            name: 'Barbearia Estilo',
            address: 'Av. T-63, 1234 - Setor Bueno, Goiânia',
            cep: '74215-220',
            phone: '(62) 99999-9999',
            rating: 4.8,
            price: 45,
            distance: 2.5,
            services: ['Corte', 'Barba', 'Sobrancelha'],
            openingHours: 'Seg-Sex: 9h-19h, Sáb: 9h-17h',
            latitude: -16.6920,  // Setor Bueno (cerca de 600m do SENAI)
            longitude: -49.2680
          },
          {
            id: 2,
            name: 'Barba & Estilo',
            address: 'Rua 10, 250 - Centro, Goiânia',
            cep: '74015-010',
            phone: '(62) 98888-8888',
            rating: 4.5,
            price: 35,
            distance: 3.2,
            services: ['Corte', 'Barba'],
            openingHours: 'Seg-Sáb: 8h-18h',
            latitude: -16.6788,
            longitude: -49.2539
          },
          {
            id: 3,
            name: 'Barbearia Premium',
            address: 'Av. 85, 500 - Setor Marista, Goiânia',
            cep: '74175-010',
            phone: '(62) 97777-7777',
            rating: 4.9,
            price: 80,
            distance: 4.8,
            services: ['Corte', 'Barba', 'Tratamento Capilar', 'Massagem'],
            openingHours: 'Seg-Sex: 10h-20h, Sáb: 9h-18h',
            latitude: -16.7050,
            longitude: -49.2447
          },
          {
            id: 4,
            name: 'Cortes & Barbas',
            address: 'Rua 5, 100 - Setor Sul, Goiânia',
            cep: '74083-010',
            phone: '(62) 96666-6666',
            rating: 4.3,
            price: 30,
            distance: 5.5,
            services: ['Corte', 'Barba'],
            openingHours: 'Seg-Sáb: 8h-19h',
            latitude: -16.7014,
            longitude: -49.2820
          },
          {
            id: 5,
            name: 'Barbearia Clássica',
            address: 'Rua 7, 789 - Setor Oeste, Goiânia',
            cep: '74125-100',
            phone: '(62) 95555-5555',
            rating: 4.6,
            price: 40,
            distance: 1.8,
            services: ['Corte', 'Barba', 'Escova'],
            openingHours: 'Seg-Sex: 8h-19h, Sáb: 8h-16h',
            latitude: -16.6950,
            longitude: -49.2750
          },
          {
            id: 6,
            name: 'The Barber Shop',
            address: 'Av. Goiás, 456 - Setor Central, Goiânia',
            cep: '74020-100',
            phone: '(62) 94444-4444',
            rating: 4.7,
            price: 55,
            distance: 3.8,
            services: ['Corte', 'Barba', 'Coloração', 'Sobrancelha'],
            openingHours: 'Seg-Sex: 9h-20h, Sáb: 9h-18h',
            latitude: -16.6820,
            longitude: -49.2560
          },
          {
            id: 7,
            name: 'Barbearia Moderna',
            address: 'Rua 15, 321 - Jardim América, Goiânia',
            cep: '74255-190',
            phone: '(62) 93333-3333',
            rating: 4.4,
            price: 38,
            distance: 4.2,
            services: ['Corte', 'Barba'],
            openingHours: 'Ter-Sáb: 9h-19h',
            latitude: -16.7100,
            longitude: -49.2400
          },
          {
            id: 8,
            name: 'Elite Barber',
            address: 'Av. T-4, 890 - Setor Bueno, Goiânia',
            cep: '74230-020',
            phone: '(62) 92222-2222',
            rating: 4.9,
            price: 90,
            distance: 6.0,
            services: ['Corte', 'Barba', 'Tratamento Capilar', 'Massagem', 'Spa'],
            openingHours: 'Seg-Sex: 10h-21h, Sáb: 9h-19h, Dom: 10h-16h',
            latitude: -16.6900,
            longitude: -49.2500
          }
      ];
      
      // Tentar buscar da API, mas sempre usar mocks se falhar ou estiver vazio
      try {
        const response = await barbershopService.getAllBarbershops();
        
        if (response && response.barbershops && response.barbershops.length > 0) {
          console.log('✅ Barbearias carregadas da API:', response.barbershops.length);
          console.log('🔍 Dados da primeira barbearia:', response.barbershops[0]);
          
          // Calcular distância real para cada barbearia
          const barbershopsWithDistance = response.barbershops.map(shop => {
            console.log(`🏪 Processando ${shop.name}:`, {
              latitude: shop.latitude,
              longitude: shop.longitude,
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
              return { ...shop, distance };
            }
            console.warn(`⚠️ ${shop.name} não tem coordenadas válidas`);
            return { ...shop, distance: 999 }; // Se não tiver coordenadas, coloca distância alta
          });
          
          // Ordenar por distância
          barbershopsWithDistance.sort((a, b) => a.distance - b.distance);
          
          console.log('📍 Distâncias calculadas a partir de:', USER_LOCATION.name);
          setBarbershops(barbershopsWithDistance);
        } else {
          console.log('⚠️ API sem dados, usando mocks.');
          
          // Calcular distância para mocks também
          const mockWithDistance = mockBarbershops.map(shop => {
            const distance = calculateDistance(
              USER_LOCATION.latitude,
              USER_LOCATION.longitude,
              shop.latitude,
              shop.longitude
            );
            return { ...shop, distance };
          });
          
          mockWithDistance.sort((a, b) => a.distance - b.distance);
          setBarbershops(mockWithDistance);
        }
      } catch (error) {
        console.log('❌ Erro na API, usando mocks:', error.message);
        
        // Calcular distância para mocks em caso de erro
        const mockWithDistance = mockBarbershops.map(shop => {
          const distance = calculateDistance(
            USER_LOCATION.latitude,
            USER_LOCATION.longitude,
            shop.latitude,
            shop.longitude
          );
          return { ...shop, distance };
        });
        
        mockWithDistance.sort((a, b) => a.distance - b.distance);
        setBarbershops(mockWithDistance);
      } finally {
        setIsLoadingBarbershops(false);
      }
    };

    fetchBarbershops();
  }, [USER_LOCATION.latitude, USER_LOCATION.longitude]); // Executar quando localização mudar

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
            <div className="user-menu">
              <div className="user-avatar">
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
                    // Fechar dropdown
                    document.querySelector('.user-menu').classList.remove('active');
                  }}
                >
                  <span className="logo-icon">
                    <User size={28} strokeWidth={1.8} color="#d4af37" /> {/* ícone Lucide */}
                  </span>                  
                  Meu Perfil
                </button>
                <button 
                  className="logout-btn" 
                  onClick={onLogout}
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
                        {shop.services.map((service, index) => (
                          <span key={index} className="service-tag">{service}</span>
                        ))}
                      </div>
                      <button className="view-details-btn">Ver detalhes</button>
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
