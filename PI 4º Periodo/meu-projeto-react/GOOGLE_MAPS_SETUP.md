# Configuração do Google Maps

Este documento explica como o Google Maps está integrado ao projeto BarberHub.

## 📋 Visão Geral

O projeto utiliza o Google Maps para exibir a localização das barbearias em um mapa interativo. Quando o usuário visualiza a lista de barbearias, ele pode ver um mapa com marcadores mostrando a localização exata de cada estabelecimento.

## 🔑 Chave da API

A chave da API do Google Maps está carregada diretamente no HTML:

**Arquivo:** `public/index.html`
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBiwTSijXx8atgDO5HuAUQ5V3-3D1ksbtI&libraries=places" async defer></script>
```

**Chave atual:** `AIzaSyBiwTSijXx8atgDO5HuAUQ5V3-3D1ksbtI`

⚠️ **IMPORTANTE:** Esta chave deve ser mantida em segredo em produção. Configure restrições de domínio no Google Cloud Console.

## 📦 Sem Necessidade de Pacotes NPM

Esta implementação usa a API do Google Maps diretamente do CDN, **sem necessidade de instalar pacotes npm**. A biblioteca é carregada automaticamente quando a página carrega.

## 🗺️ Como Funciona

### 1. Carregamento da API

A API do Google Maps é carregada diretamente no HTML via script tag. Isso significa que está disponível globalmente através de `window.google.maps`.

### 2. Componente SimpleMap

O componente `SimpleMap.js` usa a API nativa do Google Maps:

```javascript
import React, { useEffect, useRef, useState } from 'react';

// Usa window.google.maps diretamente
const map = new window.google.maps.Map(element, options);
const marker = new window.google.maps.Marker({ ... });
```

**Principais recursos:**
- ✅ Usa a API nativa do Google Maps (sem bibliotecas externas)
- ✅ Exibe marcadores dourados para cada barbearia
- ✅ InfoWindow com detalhes ao clicar no marcador
- ✅ Tema escuro personalizado
- ✅ Fallback para barbearias sem coordenadas
- ✅ Loading state enquanto a API carrega

### 2. Estrutura de Dados Necessária

Para que uma barbearia apareça no mapa, ela **DEVE** ter os campos:

```javascript
{
  id: 1,
  name: "Barbearia Exemplo",
  address: "Rua Exemplo, 123",
  latitude: -16.6869,  // ← OBRIGATÓRIO para aparecer no mapa
  longitude: -49.2648, // ← OBRIGATÓRIO para aparecer no mapa
  rating: 4.8,
  distance: 2.5,
  price: 50,
  // ... outros campos
}
```

### 3. Comportamento do Mapa

**Caso 1: Barbearias com coordenadas**
- ✅ Mapa interativo com marcadores
- ✅ Clique no marcador para ver detalhes
- ✅ Zoom e navegação

**Caso 2: Barbearias sem coordenadas**
- 📋 Exibe lista simples
- ℹ️ Mensagem informando que não há coordenadas

**Caso 3: Chave da API não configurada**
- ⚠️ Mensagem de erro
- 💡 Instruções para configurar

## 🎨 Personalização do Mapa

### Tema Escuro
O mapa usa um tema escuro personalizado que combina com o design do aplicativo:

```javascript
const mapOptions = {
  styles: [
    { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    // ... mais estilos
  ]
};
```

### Marcadores Personalizados
Os marcadores usam a cor dourada do tema (#d4af37):

```javascript
icon={{
  path: window.google.maps.SymbolPath.CIRCLE,
  scale: 10,
  fillColor: '#d4af37',
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2
}}
```

## 🔧 Configuração no Backend

Para adicionar suporte a coordenadas no backend, você precisa:

### 1. Atualizar o Modelo da Barbearia

```java
@Entity
public class Barbershop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String address;
    
    // Adicionar campos de coordenadas
    private Double latitude;
    private Double longitude;
    
    // ... getters e setters
}
```

### 2. Exemplo de Coordenadas de Goiânia

```
Centro de Goiânia: -16.6869, -49.2648
Setor Bueno: -16.7104, -49.2617
Setor Marista: -16.6936, -49.2526
Setor Oeste: -16.6855, -49.2786
```

## 📖 Como Obter Coordenadas

### Método 1: Google Maps (Web)
1. Acesse https://www.google.com/maps
2. Pesquise o endereço da barbearia
3. Clique com o botão direito no local exato
4. Clique no primeiro item (as coordenadas)
5. As coordenadas serão copiadas: `latitude, longitude`

### Método 2: Google Maps (App)
1. Abra o app do Google Maps
2. Mantenha pressionado no local
3. As coordenadas aparecem na busca

### Método 3: API de Geocoding
Use a API do Google para converter endereços em coordenadas automaticamente:

```javascript
// Exemplo de chamada
const address = "Av. T-63, 1234 - Setor Bueno, Goiânia - GO";
const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const location = data.results[0].geometry.location;
    console.log(`Latitude: ${location.lat}, Longitude: ${location.lng}`);
  });
```

## 🧪 Testando o Mapa

1. Certifique-se de que o backend está rodando
2. As barbearias devem ter campos `latitude` e `longitude`
3. Acesse a página inicial (HomePage)
4. O mapa deve aparecer ao lado da lista de barbearias

### Verificar se está funcionando:

```javascript
// No console do navegador:
console.log(window.env.REACT_APP_GOOGLE_MAPS_API_KEY);
// Deve retornar a chave da API

// Verificar barbearias:
// No componente HomePage, as barbearias são exibidas no console
```

## ⚠️ Problemas Comuns

### 1. Mapa não aparece
- ✅ Verificar se a chave da API está configurada
- ✅ Abrir o console para ver erros
- ✅ Verificar se as barbearias têm coordenadas

### 2. "For development purposes only"
- Isso é normal para chaves não restritas
- Configure restrições no Google Cloud Console

### 3. Marcadores não aparecem
- Verificar se `latitude` e `longitude` são números (não strings)
- Verificar se os valores estão dentro do range válido:
  - Latitude: -90 a 90
  - Longitude: -180 a 180

## 🔒 Segurança em Produção

Para produção, configure as seguintes restrições no Google Cloud Console:

1. **Restrição de domínio:**
   - Permitir apenas seu domínio
   - Exemplo: `*.seudominio.com`

2. **Restrição de API:**
   - Habilitar apenas:
     - Maps JavaScript API
     - Geocoding API (se usar)

3. **Monitoramento:**
   - Configure alertas de uso
   - Defina limites de requisições

## 📚 Documentação Oficial

- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Obter Chave da API](https://developers.google.com/maps/documentation/javascript/get-api-key)

## 🎯 Próximos Passos

- [ ] Configurar geocoding automático no backend
- [ ] Adicionar busca de barbearias por raio
- [ ] Implementar roteamento (direções)
- [ ] Adicionar Street View
- [ ] Cluster de marcadores para muitas barbearias

---

**Última atualização:** Outubro 2025

