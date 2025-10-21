# 🗺️ Geocodificação Automática - Google Maps

## ✨ Novidade: Conversão Automática de CEP em Coordenadas!

O sistema agora converte automaticamente CEPs em coordenadas geográficas, eliminando a necessidade de cadastrar latitude e longitude manualmente!

## 🎯 Como Funciona

### Prioridade de Localização

O sistema tenta localizar as barbearias na seguinte ordem:

```
1º - Coordenadas Manuais (latitude + longitude)
     ↓ Se não tiver
2º - CEP (converte automaticamente)
     ↓ Se não tiver ou falhar
3º - Endereço completo (tenta localizar)
```

### Para o Backend

**Você só precisa enviar o CEP!**

```json
{
  "barbershops": [
    {
      "id": 1,
      "name": "Barbearia Centro",
      "address": "Rua 10, 250 - Centro, Goiânia - GO",
      "cep": "74020-000",  // ← Isso é suficiente!
      "phone": "(62) 3281-1234",
      "rating": 4.5,
      "price": 45
    }
  ]
}
```

## 📍 Exemplos de CEPs de Goiânia

```javascript
// CEPs válidos para teste em Goiânia:
"74215-140"  // Setor Bueno
"74230-010"  // Setor Oeste
"74175-090"  // Setor Marista
"74063-030"  // Setor Central
"74133-010"  // Setor Sul
"74055-020"  // Jardim Goiás
```

## ⚡ Performance

### Primeira Carga
- 🔄 O sistema converte todos os CEPs em coordenadas
- ⏱️ Demora ~1-2 segundos para cada barbearia
- 📍 Exibe "Localizando barbearias..." durante o processo

### Subsequentes
- Os marcadores são atualizados instantaneamente
- Não precisa reconverter se a barbearia já foi processada

## 🔧 Detalhes Técnicos

### API Utilizada
- **Google Geocoding API** (incluída no Google Maps JavaScript API)
- Não requer configuração adicional
- Usa a mesma chave da API do Google Maps

### Formato de Busca
```javascript
// Para CEP:
"74215-140, Brasil"  // Adiciona ", Brasil" para maior precisão

// Para endereço (fallback):
"Av. T-63, 1234 - Setor Bueno, Goiânia - GO, Brasil"
```

### Tratamento de Erros
- Se o CEP não for encontrado → Tenta com o endereço
- Se o endereço falhar → Barbearia não aparece no mapa (mas aparece na lista)
- Console mostra avisos para CEPs inválidos

## 🎨 Mensagens no Frontend

### Durante Carregamento
```
🗺️
Localizando barbearias...
```

### Se Nenhuma Foi Localizada
```
🗺️
Mapa de Barbearias
0 barbearias encontradas
Não foi possível localizar as barbearias. Verifique se os CEPs estão corretos.
```

### Mapa Carregado com Sucesso
- Mapa interativo com marcadores dourados
- Clique no marcador para ver detalhes
- InfoWindow com informações da barbearia

## 🐛 Solução de Problemas

### CEP Não Localizado

**Problema:** CEP não retorna coordenadas

**Soluções:**
1. Verifique o formato: `"74215-140"` ou `"74215140"` (ambos funcionam)
2. Confirme se o CEP existe e está correto
3. Tente adicionar o endereço completo no campo `address`

### Muitas Requisições

**Problema:** Muitas barbearias = muitas requisições de geocoding

**Solução:** A API processa todas em paralelo usando `Promise.all()`

**Alternativa:** Cadastre latitude/longitude diretamente no banco de dados para evitar conversões

### Quota da API Excedida

**Problema:** Limite diário de requisições do Google Maps atingido

**Soluções:**
1. Configure billing no Google Cloud Console
2. Cache as coordenadas no backend após a primeira conversão
3. Use latitude/longitude diretos do banco de dados

## 💡 Boas Práticas

### Para Melhor Performance

1. **Ideal:** Cadastre latitude/longitude no banco de dados
   - Mais rápido (sem conversão)
   - Não usa quota da API
   - Precisão garantida

2. **Alternativa:** Use apenas CEP
   - Funciona bem para a maioria dos casos
   - Conversão automática
   - Simples de implementar

3. **Fallback:** Endereço completo
   - Quando CEP não está disponível
   - Menos preciso
   - Pode falhar para endereços mal formatados

### Formato Ideal do Endereço

```json
{
  "address": "Avenida T-63, 1234 - Setor Bueno, Goiânia - GO",
  "cep": "74215-140"
}
```

**Componentes importantes:**
- Nome da rua/avenida
- Número
- Bairro
- Cidade
- Estado
- CEP (obrigatório para geocoding automático)

## 🔐 Segurança

### Chave da API
- A mesma chave do Google Maps é usada
- Está configurada em `public/env-config.js`
- Recomendado: Configurar restrições no Google Cloud Console

### Limites
- Google Maps tem limites generosos para geocoding
- Free tier: 40.000 requisições/mês
- Após isso, cobrado por requisição adicional

## 📊 Exemplo Completo

### Backend Response
```json
{
  "barbershops": [
    {
      "id": 1,
      "name": "Barbearia Estilo",
      "address": "Av. T-63, 1234 - Setor Bueno",
      "cep": "74215-140",
      "phone": "(62) 99999-9999",
      "hours": "Seg-Sáb: 9h-20h",
      "rating": 4.8,
      "reviews": 150,
      "price": 50,
      "distance": 2.5,
      "services": ["Corte", "Barba"],
      "images": ["url1.jpg"]
    },
    {
      "id": 2,
      "name": "Barba & Estilo",
      "address": "Rua 10, 250 - Centro",
      "cep": "74020-000",
      // latitude e longitude ausentes - será geocodificado!
      "rating": 4.5,
      "price": 45
    }
  ]
}
```

### Resultado no Frontend
- Ambas as barbearias aparecem no mapa
- Marcadores dourados nas localizações corretas
- InfoWindow ao clicar com todas as informações

---

**Status:** ✅ Funcionando perfeitamente!
**Última atualização:** Outubro 2025

