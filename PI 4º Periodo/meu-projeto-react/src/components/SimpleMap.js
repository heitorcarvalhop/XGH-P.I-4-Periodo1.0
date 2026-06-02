import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SimpleMap.css';

const DEFAULT_CENTER = [-16.6869, -49.2648];

const hasCoordinates = (location) => (
  location
  && Number.isFinite(Number(location.latitude))
  && Number.isFinite(Number(location.longitude))
);

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const buildShopPopup = (shop) => `
  <div class="map-popup">
    <h3>${escapeHtml(shop.name)}</h3>
    <p>${escapeHtml(shop.address)}</p>
    <div class="map-popup-details">
      <span class="map-popup-rating">★ ${escapeHtml(shop.rating)}</span>
      ${Number.isFinite(Number(shop.distance))
        ? `<span>${Number(shop.distance).toFixed(1)} km</span>`
        : ''}
    </div>
    ${shop.price != null
      ? `<strong>A partir de R$ ${escapeHtml(shop.price)}</strong>`
      : ''}
  </div>
`;

const buildUserPopup = (userLocation) => `
  <div class="map-popup">
    <h3 class="map-popup-user">${escapeHtml(userLocation.name || 'Você está aqui')}</h3>
    <p>As distâncias são calculadas a partir deste ponto.</p>
  </div>
`;

const SimpleMap = ({ barbershops = [], userLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  const shopsWithCoordinates = useMemo(() => (
    barbershops
      .filter(hasCoordinates)
      .map((shop) => ({
        ...shop,
        latitude: Number(shop.latitude),
        longitude: Number(shop.longitude)
      }))
  ), [barbershops]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    const center = hasCoordinates(userLocation)
      ? [Number(userLocation.latitude), Number(userLocation.longitude)]
      : DEFAULT_CENTER;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      markerLayerRef.current = null;
      mapRef.current = null;
    };
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();
    const bounds = [];

    shopsWithCoordinates.forEach((shop) => {
      const point = [shop.latitude, shop.longitude];
      L.circleMarker(point, {
        radius: 9,
        fillColor: '#d4af37',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 2
      })
        .bindPopup(buildShopPopup(shop))
        .addTo(markerLayer);
      bounds.push(point);
    });

    if (hasCoordinates(userLocation)) {
      const userPoint = [Number(userLocation.latitude), Number(userLocation.longitude)];
      L.circleMarker(userPoint, {
        radius: 11,
        fillColor: '#ff4d6d',
        fillOpacity: 1,
        color: '#ffffff',
        weight: 3
      })
        .bindPopup(buildUserPopup(userLocation))
        .addTo(markerLayer);
      bounds.push(userPoint);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [shopsWithCoordinates, userLocation]);

  return (
    <div className="simple-map-wrapper">
      <div ref={mapContainerRef} className="simple-map" />
      {shopsWithCoordinates.length === 0 && (
        <div className="simple-map-empty">
          <strong>Mapa de Barbearias</strong>
          <span>
            {barbershops.length > 0
              ? 'Nenhuma barbearia possui coordenadas válidas.'
              : 'Nenhuma barbearia encontrada.'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;
