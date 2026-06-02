import React, { useState, useEffect } from 'react';
import './BarbershopProfile.css';
import { barbershopService } from '../services/api';
import { 
  Store, MapPin, Phone, Clock, Star, 
  Edit2, Save, X, DollarSign, Image as ImageIcon,
  CheckCircle, AlertCircle, Navigation
} from 'lucide-react';

// Função auxiliar para normalizar serviços (converter objetos em strings)
const normalizeServices = (services) => {
  if (!Array.isArray(services)) return [];
  return services.filter(service => getServiceName(service).trim() !== '');
};

const getServiceName = (service) => {
  if (typeof service === 'string') return service;
  return service?.name || '';
};

const BarbershopProfile = ({ barbershop, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [geocodingMessage, setGeocodingMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: barbershop?.name || '',
    address: barbershop?.address || '',
    cep: barbershop?.cep || '',
    phone: barbershop?.phone || '',
    openingHours: barbershop?.openingHours || barbershop?.hours || '',
    rating: barbershop?.rating || 0,
    price: barbershop?.price || 0,
    latitude: barbershop?.latitude || '',
    longitude: barbershop?.longitude || '',
    image: barbershop?.image || '',
    services: normalizeServices(barbershop?.services)
  });

  const [newService, setNewService] = useState({ name: '', duration: '', price: '' });

  // Atualizar formData quando barbershop mudar
  useEffect(() => {
    if (barbershop) {
      setFormData({
        name: barbershop?.name || '',
        address: barbershop?.address || '',
        cep: barbershop?.cep || '',
        phone: barbershop?.phone || '',
        openingHours: barbershop?.openingHours || barbershop?.hours || '',
        rating: barbershop?.rating || 0,
        price: barbershop?.price || 0,
        latitude: barbershop?.latitude || '',
        longitude: barbershop?.longitude || '',
        image: barbershop?.image || '',
        services: normalizeServices(barbershop?.services)
      });
    }
  }, [barbershop]);

  // Função para buscar coordenadas via ViaCEP + Nominatim (OpenStreetMap)
  const geocodeAddress = async (address, cep) => {
    try {
      // Limpar CEP
      const cleanCep = cep.replace(/\D/g, '');
      
      if (cleanCep.length === 8) {
        setIsGeocodingAddress(true);
        setGeocodingMessage({ type: 'info', text: 'Buscando localização no mapa...' });
        
        // 1. Buscar informações do CEP via ViaCEP
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const viaCepData = await viaCepResponse.json();
        
        if (viaCepData.erro) {
          throw new Error('CEP não encontrado');
        }
        
        // 2. Montar endereço completo para geocoding
        const fullAddress = `${address}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
        
        // 3. Buscar coordenadas via Nominatim (OpenStreetMap)
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;
        const nominatimResponse = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'BarberHub/1.0' // Nominatim requer User-Agent
          }
        });
        const nominatimData = await nominatimResponse.json();
        
        if (nominatimData && nominatimData.length > 0) {
          const lat = parseFloat(nominatimData[0].lat);
          const lon = parseFloat(nominatimData[0].lon);
          
          console.log('📍 Coordenadas encontradas:', { lat, lon });
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon
          }));
          
          setGeocodingMessage({ type: 'success', text: '✓ Localização encontrada no mapa!' });
          setTimeout(() => setGeocodingMessage(null), 3000);
        } else {
          setGeocodingMessage({ type: 'warning', text: 'Não foi possível localizar no mapa. Verifique o endereço.' });
          setTimeout(() => setGeocodingMessage(null), 5000);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      setGeocodingMessage({ type: 'warning', text: 'Erro ao buscar localização. Coordenadas não atualizadas.' });
      setTimeout(() => setGeocodingMessage(null), 5000);
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Buscar coordenadas quando CEP for alterado (apenas se tiver 8 dígitos)
  useEffect(() => {
    if (isEditing && formData.cep && formData.address) {
      const cleanCep = formData.cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        const timer = setTimeout(() => {
          geocodeAddress(formData.address, formData.cep);
        }, 1000); // Debounce de 1 segundo
        
        return () => clearTimeout(timer);
      }
    }
  }, [formData.cep, formData.address, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função auxiliar para extrair o nome do serviço (string ou objeto)
  const handleAddService = async () => {
    if (newService.name.trim() && Number(newService.duration) > 0 && Number(newService.price) >= 0) {
      const serviceName = newService.name.trim();
      const existingNames = formData.services.map(s => getServiceName(s));
      
      if (!existingNames.includes(serviceName)) {
        try {
          const createdService = await barbershopService.addService(barbershop.id, {
            name: serviceName,
            duration: Number(newService.duration),
            price: Number(newService.price)
          });
          setFormData(prev => ({
            ...prev,
            services: [...prev.services, createdService]
          }));
          setNewService({ name: '', duration: '', price: '' });
          setSaveMessage({ type: 'success', text: 'Serviço cadastrado no servidor.' });
        } catch (error) {
          setSaveMessage({ type: 'error', text: error.message });
        }
      }
    } else {
      setSaveMessage({ type: 'error', text: 'Informe nome, duração e preço do serviço.' });
    }
  };

  const handleRemoveService = async (serviceToRemove) => {
    const serviceNameToRemove = getServiceName(serviceToRemove);
    try {
      if (serviceToRemove.id) {
        await barbershopService.deleteService(barbershop.id, serviceToRemove.id);
      }
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => getServiceName(s) !== serviceNameToRemove)
      }));
      setSaveMessage({ type: 'success', text: 'Serviço removido do servidor.' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: error.message });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      console.log('💾 Salvando dados da barbearia:', formData);
      
      const response = await barbershopService.updateBarbershop(barbershop.id, formData);
      console.log('✅ Resposta do backend:', response);

      if (onUpdate) {
        onUpdate(response.barbershop || response);
      }

      setSaveMessage({ type: 'success', text: 'Informações atualizadas com sucesso no servidor!' });
      
      setIsEditing(false);
      
      // Limpar mensagem após 5 segundos
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      setSaveMessage({ type: 'error', text: 'Erro ao salvar as alterações. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    setFormData({
      name: barbershop?.name || '',
      address: barbershop?.address || '',
      cep: barbershop?.cep || '',
      phone: barbershop?.phone || '',
      openingHours: barbershop?.openingHours || barbershop?.hours || '',
      rating: barbershop?.rating || 0,
      price: barbershop?.price || 0,
      latitude: barbershop?.latitude || '',
      longitude: barbershop?.longitude || '',
      image: barbershop?.image || '',
      services: normalizeServices(barbershop?.services)
    });
    setIsEditing(false);
    setSaveMessage(null);
  };

  if (!barbershop) {
    return (
      <div className="barbershop-profile">
        <div className="empty-state-profile">
          <Store size={64} color="#d4af37" />
          <h3>Nenhuma barbearia encontrada</h3>
          <p>Não foi possível carregar as informações da barbearia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="barbershop-profile">
      {/* Header com Ações */}
      <div className="profile-header">
        <div className="profile-header-title">
          <Store size={32} color="#d4af37" />
          <div>
            <h1>Perfil da Barbearia</h1>
            <p>Gerencie as informações da sua barbearia</p>
          </div>
        </div>
        
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <Edit2 size={20} />
              <span>Editar Informações</span>
            </button>
          ) : (
            <>
              <button className="btn-cancel" onClick={handleCancel} disabled={isSaving}>
                <X size={20} />
                <span>Cancelar</span>
              </button>
              <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mensagem de Salvamento */}
      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Formulário */}
      <div className="profile-form">
        {/* Informações Básicas */}
        <div className="form-section">
          <div className="section-header">
            <Store size={24} color="#d4af37" />
            <h2>Informações Básicas</h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome da Barbearia</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Ex: Barbearia Premium"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <div className="input-with-icon">
                <Phone size={18} />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="(62) 99999-9999"
                />
              </div>
            </div>

            <div className="form-group span-2">
              <label htmlFor="address">Endereço Completo</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Rua, Número - Bairro, Cidade - Estado"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cep">CEP</label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="74000-000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="openingHours">Horário de Funcionamento</label>
              <div className="input-with-icon">
                <Clock size={18} />
                <input
                  type="text"
                  id="openingHours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Seg-Sex: 9h-19h, Sáb: 9h-17h"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Localização Automática */}
        <div className="form-section">
          <div className="section-header">
            <Navigation size={24} color="#d4af37" />
            <h2>Localização no Mapa</h2>
          </div>
          
          <div className="location-info-box">
            <div className="location-icon">
              <MapPin size={32} color="#d4af37" />
            </div>
            <div className="location-details">
              <h3>Coordenadas Geográficas</h3>
              {formData.latitude && formData.longitude ? (
                <>
                  <p className="coordinates-display">
                    <strong>Latitude:</strong> {formData.latitude} | <strong>Longitude:</strong> {formData.longitude}
                  </p>
                  <small className="location-hint">
                    ✓ Localização encontrada! Usada para mostrar no mapa e calcular distâncias.
                  </small>
                </>
              ) : (
                <p className="no-coordinates">
                  ⚠️ Coordenadas não definidas. Preencha o CEP e endereço acima para localizar automaticamente.
                </p>
              )}
              
              {geocodingMessage && (
                <div className={`geocoding-message ${geocodingMessage.type}`}>
                  {isGeocodingAddress && <div className="spinner-tiny"></div>}
                  <span>{geocodingMessage.text}</span>
                </div>
              )}
              
              <div className="location-explanation">
                <AlertCircle size={16} />
                <small>
                  As coordenadas são calculadas automaticamente quando você preenche o CEP e endereço.
                  Elas são usadas para exibir a barbearia no mapa e calcular a distância para os clientes.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Preços e Avaliação */}
        <div className="form-section">
          <div className="section-header">
            <DollarSign size={24} color="#d4af37" />
            <h2>Preços e Avaliação</h2>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="price">Preço Base (R$)</label>
              <div className="input-with-icon">
                <DollarSign size={18} />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="50.00"
                  step="0.01"
                />
              </div>
              <small className="form-hint">Preço base dos serviços</small>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Avaliação</label>
              <div className="input-with-icon">
                <Star size={18} />
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="4.8"
                  step="0.1"
                  min="0"
                  max="5"
                />
              </div>
              <small className="form-hint">De 0.0 a 5.0</small>
            </div>
          </div>
        </div>

        {/* Imagem */}
        <div className="form-section">
          <div className="section-header">
            <ImageIcon size={24} color="#d4af37" />
            <h2>Imagem da Barbearia</h2>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">URL da Imagem</label>
            <div className="input-with-icon">
              <ImageIcon size={18} />
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" />
              </div>
            )}
          </div>
        </div>

        {/* Serviços */}
        <div className="form-section">
          <div className="section-header">
            <CheckCircle size={24} color="#d4af37" />
            <h2>Serviços Oferecidos</h2>
          </div>
          
          {isEditing && (
            <div className="add-service-container">
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do serviço"
                className="service-input"
              />
              <input
                type="number"
                min="1"
                value={newService.duration}
                onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Duração (min)"
                className="service-input"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Preço (R$)"
                className="service-input"
              />
              <button className="btn-add-service" onClick={handleAddService}>
                <CheckCircle size={18} />
                Adicionar
              </button>
            </div>
          )}

          <div className="services-list-profile">
            {formData.services.length === 0 ? (
              <div className="empty-services">
                <p>Nenhum serviço cadastrado</p>
              </div>
            ) : (
              formData.services.map((service, index) => {
                const serviceName = getServiceName(service);
                return (
                  <div key={index} className="service-tag-profile">
                    <CheckCircle size={16} />
                    <span>{serviceName}</span>
                    {isEditing && (
                      <button 
                        className="btn-remove-service" 
                        onClick={() => handleRemoveService(service)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarbershopProfile;

