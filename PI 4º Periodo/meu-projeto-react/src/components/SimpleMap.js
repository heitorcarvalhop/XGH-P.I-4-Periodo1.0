import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, AlertTriangle, Map as MapIcon } from 'lucide-react';

const SimpleMap = ({ barbershops, userLocation }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null); // Marcador da localização do usuário
  const infoWindowRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scriptLoadedRef = useRef(false);
  const [barbershopsWithCoords, setBarbershopsWithCoords] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Função para converter CEP em coordenadas usando Geocoding API
  const geocodeAddress = useCallback(async (address, cep) => {
    if (!window.google || !window.google.maps) return null;

    const geocoder = new window.google.maps.Geocoder();
    
    // Tentar com CEP + Brasil para melhor precisão
    const searchQuery = cep ? `${cep}, Brasil` : `${address}, Brasil`;

    return new Promise((resolve) => {
      geocoder.geocode({ address: searchQuery }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        } else {
          console.warn(`Geocoding falhou para: ${searchQuery}`, status);
          resolve(null);
        }
      });
    });
  }, []);

  // Processar barbearias e obter coordenadas do CEP
  useEffect(() => {
    const processBarbershops = async () => {
      if (!window.google || !window.google.maps || barbershops.length === 0) {
        setBarbershopsWithCoords([]);
        return;
      }

      setIsGeocoding(true);

      const processed = await Promise.all(
        barbershops.map(async (shop) => {
          // Se já tem coordenadas, usar elas
          if (shop.latitude && shop.longitude) {
            return {
              ...shop,
              latitude: parseFloat(shop.latitude),
              longitude: parseFloat(shop.longitude)
            };
          }

          // Se tem CEP, converter para coordenadas
          if (shop.cep) {
            const coords = await geocodeAddress(shop.address, shop.cep);
            if (coords) {
              return {
                ...shop,
                latitude: coords.lat,
                longitude: coords.lng
              };
            }
          }

          // Se tem endereço mas não tem CEP, tentar com endereço
          if (shop.address) {
            const coords = await geocodeAddress(shop.address, null);
            if (coords) {
              return {
                ...shop,
                latitude: coords.lat,
                longitude: coords.lng
              };
            }
          }

          return null;
        })
      );

      // Filtrar apenas barbearias com coordenadas válidas
      const valid = processed.filter(shop => shop !== null && shop.latitude && shop.longitude);
      setBarbershopsWithCoords(valid);
      setIsGeocoding(false);
    };

    if (!isLoading && window.google && window.google.maps) {
      processBarbershops();
    }
  }, [barbershops, isLoading, geocodeAddress]);

  // Função para atualizar marcadores
  const updateMarkers = useCallback(() => {
    if (!googleMapRef.current || !window.google) return;

    // Limpar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Criar novos marcadores
    barbershopsWithCoords.forEach((shop) => {
      const marker = new window.google.maps.Marker({
        position: { lat: shop.latitude, lng: shop.longitude },
        map: googleMapRef.current,
        title: shop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#d4af37',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Adicionar evento de clique
      marker.addListener('click', () => {
        const contentString = `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; fontSize: 16px; fontWeight: 600; color: #1a1a1a;">
              ${shop.name}
            </h3>
            <p style="margin: 0 0 8px 0; fontSize: 12px; color: #666;">
              ${shop.address}
            </p>
            <div style="display: flex; alignItems: center; gap: 10px; fontSize: 12px; marginBottom: 8px;">
              <span style="color: #d4af37;">★ ${shop.rating}</span>
              <span style="color: #666;">${shop.distance.toFixed(1)} km</span>
            </div>
            <div style="fontSize: 14px; fontWeight: 600; color: #1a1a1a;">
              A partir de R$ ${shop.price}
            </div>
          </div>
        `;

        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Adicionar marcador da localização do usuário
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      // Remover marcador anterior se existir
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }

      // Criar marcador vermelho para localização do usuário
      userMarkerRef.current = new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: googleMapRef.current,
        title: userLocation.name || 'Você está aqui',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#ff4d6d', // Vermelho
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        zIndex: 9999 // Garantir que fique acima dos outros marcadores
      });

      // Adicionar evento de clique no marcador do usuário
      userMarkerRef.current.addListener('click', () => {
        const contentString = `
          <div style="padding: 12px; max-width: 220px;">
            <h3 style="margin: 0 0 8px 0; fontSize: 16px; fontWeight: 600; color: #ff4d6d;">
              📍 ${userLocation.name || 'Você está aqui'}
            </h3>
            <p style="margin: 0; fontSize: 13px; color: #666;">
              Esta é sua localização atual. As distâncias são calculadas a partir deste ponto.
            </p>
          </div>
        `;

        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(googleMapRef.current, userMarkerRef.current);
      });
    }
  }, [barbershopsWithCoords, userLocation]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps || !window.google.maps.Map) {
      return;
    }

    // Usar a localização do usuário como centro, se disponível
    const center = userLocation && userLocation.latitude && userLocation.longitude
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : barbershopsWithCoords.length > 0
        ? { lat: barbershopsWithCoords[0].latitude, lng: barbershopsWithCoords[0].longitude }
        : { lat: -16.6869, lng: -49.2648 }; // Centro padrão (Goiânia)

    // Criar o mapa com tema escuro
    try {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: center,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        }
      ],
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    });

      // Criar InfoWindow
      infoWindowRef.current = new window.google.maps.InfoWindow();

      // Adicionar marcadores
      updateMarkers();
    } catch (error) {
      console.error('Erro ao criar o mapa:', error);
      setError(`Erro ao inicializar o mapa: ${error.message}`);
    }
  }, [barbershopsWithCoords, userLocation, updateMarkers]);

  // Carregar Google Maps quando o componente montar
  useEffect(() => {
    // Obter a chave da API do env-config.js
    const apiKey = window.env?.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError('Chave da API do Google Maps não encontrada no env-config.js');
      setIsLoading(false);
      return;
    }

    // Verificar se o script já foi carregado
    if (window.google && window.google.maps && window.google.maps.Map) {
      setIsLoading(false);
      setTimeout(() => initMap(), 100);
      return;
    }

    // Se já estamos carregando o script, não fazer nada
    if (scriptLoadedRef.current) {
      return;
    }

    // Verificar se já existe um script do Google Maps na página
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      scriptLoadedRef.current = true;
      // Aguardar o carregamento do script existente
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          clearInterval(checkLoaded);
          setIsLoading(false);
          setTimeout(() => initMap(), 100);
        }
      }, 100);
      // Timeout de 10 segundos
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google || !window.google.maps || !window.google.maps.Map) {
          setError('Timeout ao carregar o Google Maps');
          setIsLoading(false);
        }
      }, 10000);
      return;
    }

    scriptLoadedRef.current = true;

    // Criar callback global para quando o Maps carregar
    window.initGoogleMaps = () => {
      setIsLoading(false);
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          initMap();
        } else {
          setError('Google Maps não carregou corretamente');
        }
      }, 100);
    };

    // Carregar o script do Google Maps dinamicamente (com geocoding)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      setError('Erro ao carregar o Google Maps. Verifique a chave da API.');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Limpar marcadores ao desmontar
      markersRef.current.forEach(marker => marker.setMap(null));
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      // Limpar callback
      delete window.initGoogleMaps;
    };
  }, [initMap]);

  // Atualizar marcadores quando as barbearias mudarem
  useEffect(() => {
    if (!isLoading && googleMapRef.current) {
      updateMarkers();
    }
  }, [barbershops, isLoading, updateMarkers]);

  // Se houver erro ao carregar
  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ marginBottom: '20px' }}>
            <AlertTriangle size={48} strokeWidth={2} color="#ff6b6b" />
          </div>
          <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>
            Erro ao carregar Google Maps
          </h3>
          <p style={{ color: '#888', fontSize: '14px' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Se não houver barbearias com coordenadas
  if (barbershopsWithCoords.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#d4af37',
          padding: '40px'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <MapIcon size={48} strokeWidth={2} color="#d4af37" />
          </div>
          <h3 style={{ 
            color: '#d4af37', 
            marginBottom: '10px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Mapa de Barbearias
          </h3>
          <p style={{ 
            color: '#888', 
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            {barbershops.length} {barbershops.length === 1 ? 'barbearia encontrada' : 'barbearias encontradas'}
          </p>
          <p style={{ 
            color: '#666', 
            fontSize: '12px',
            marginBottom: '20px'
          }}>
            {barbershops.length > 0 
              ? 'Não foi possível localizar as barbearias. Verifique se os CEPs estão corretos.'
              : 'Nenhuma barbearia cadastrada'}
          </p>
          
          {/* Lista simplificada das barbearias */}
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '20px',
            textAlign: 'left'
          }}>
            {barbershops.map((shop) => (
              <div key={shop.id} style={{
                background: 'rgba(212, 175, 55, 0.1)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                <div style={{ 
                  color: '#d4af37', 
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <MapPin size={14} strokeWidth={2} />
                  {shop.name}
                </div>
                <div style={{ 
                  color: '#888', 
                  fontSize: '12px' 
                }}>
                  {shop.address}
                </div>
                {shop.cep && (
                  <div style={{ 
                    color: '#666', 
                    fontSize: '11px',
                    marginTop: '2px'
                  }}>
                    CEP: {shop.cep}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      {(isLoading || isGeocoding) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{ textAlign: 'center', color: '#d4af37', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <MapIcon size={48} strokeWidth={2} color="#d4af37" />
            <p>{isGeocoding ? 'Localizando barbearias...' : 'Carregando mapa...'}</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default SimpleMap;

