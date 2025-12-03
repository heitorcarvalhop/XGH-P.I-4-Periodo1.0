# ⚠️ ATUALIZAÇÃO URGENTE - Campos Faltando no Backend

## 📋 Problema Identificado

Os campos **`phone`** (telefone) e **`openingHours`** (horário de funcionamento) das barbearias **NÃO estão sendo retornados** pelo backend na resposta da API.

## 🔍 Onde está o problema?

### Endpoint Afetado:
- **GET** `/api/barbershops` - Lista todas as barbearias
- **GET** `/api/barbershops/{id}` - Busca barbearia por ID

### O que está acontecendo:
✅ O frontend está preparado para receber esses campos  
❌ O backend **não está retornando** esses campos do banco de dados  
❌ Isso faz com que o telefone e horário apareçam como "Não informado" na tela

## 🛠️ Solução Necessária no Backend

### 1. Adicionar campos na entidade Barbershop

```java
@Entity
@Table(name = "barbershops")
public class Barbershop {
    
    // ... campos existentes ...
    
    @NotBlank(message = "Telefone é obrigatório")
    @Column(name = "phone", nullable = false)
    private String phone;
    
    @NotBlank(message = "Horário de funcionamento é obrigatório")
    @Column(name = "opening_hours", nullable = false)
    private String openingHours;
    
    @NotNull(message = "Latitude é obrigatória")
    @Column(name = "latitude", nullable = false)
    private Double latitude;
    
    @NotNull(message = "Longitude é obrigatória")
    @Column(name = "longitude", nullable = false)
    private Double longitude;
    
    // Getters e Setters
}
```

### 2. Verificar se as colunas existem no banco de dados

Execute este SQL para verificar:

```sql
-- Verificar se as colunas existem
DESCRIBE barbershops;

-- Se não existirem, adicionar as colunas:
ALTER TABLE barbershops 
ADD COLUMN phone VARCHAR(20) NOT NULL DEFAULT '(00) 0000-0000',
ADD COLUMN opening_hours VARCHAR(100) NOT NULL DEFAULT 'Seg-Sex: 9h-18h',
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Atualizar barbearias existentes com dados reais:
UPDATE barbershops 
SET phone = '(62) 3281-1234', 
    opening_hours = 'Seg-Sex: 9h-19h, Sáb: 9h-17h',
    latitude = -16.6869,
    longitude = -49.2648
WHERE id = 1;

-- Repetir para cada barbearia cadastrada
```

### 3. Garantir que o DTO/Response inclui esses campos

Se você usa um DTO para a resposta, verifique se ele inclui:

```java
public class BarbershopResponse {
    private Long id;
    private String name;
    private Double rating;
    private Integer reviews;
    private Double price;
    private String address;
    private String cep;
    private String phone;           // ⭐ ADICIONAR
    private String openingHours;    // ⭐ ADICIONAR
    private Double latitude;        // ⭐ ADICIONAR
    private Double longitude;       // ⭐ ADICIONAR
    private List<String> services;
    private String image;
    
    // Getters e Setters
}
```

### 4. Verificar o método do Controller/Service

Garanta que o método que retorna as barbearias está incluindo todos os campos:

```java
@GetMapping
public ResponseEntity<Map<String, List<BarbershopResponse>>> getAllBarbershops() {
    List<Barbershop> barbershops = barbershopService.findAll();
    
    List<BarbershopResponse> response = barbershops.stream()
        .map(barbershop -> {
            BarbershopResponse dto = new BarbershopResponse();
            dto.setId(barbershop.getId());
            dto.setName(barbershop.getName());
            dto.setRating(barbershop.getRating());
            dto.setReviews(barbershop.getReviews());
            dto.setPrice(barbershop.getPrice());
            dto.setAddress(barbershop.getAddress());
            dto.setCep(barbershop.getCep());
            dto.setPhone(barbershop.getPhone());                    // ⭐ ADICIONAR
            dto.setOpeningHours(barbershop.getOpeningHours());      // ⭐ ADICIONAR
            dto.setLatitude(barbershop.getLatitude());              // ⭐ ADICIONAR
            dto.setLongitude(barbershop.getLongitude());            // ⭐ ADICIONAR
            dto.setServices(barbershop.getServices());
            dto.setImage(barbershop.getImage());
            return dto;
        })
        .collect(Collectors.toList());
    
    return ResponseEntity.ok(Map.of("barbershops", response));
}
```

## 📊 Exemplo de Resposta Esperada

```json
{
  "barbershops": [
    {
      "id": 1,
      "name": "Barbearia Estilo",
      "rating": 4.8,
      "reviews": 152,
      "price": 50.00,
      "address": "Av. T-63, 1234 - Setor Bueno, Goiânia - GO",
      "cep": "74000-000",
      "phone": "(62) 3281-1234",
      "openingHours": "Seg-Sex: 9h-19h, Sáb: 9h-17h",
      "latitude": -16.6920,
      "longitude": -49.2680,
      "services": ["Corte", "Barba"],
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

## ✅ Checklist de Implementação

- [ ] Adicionar campos `phone`, `openingHours`, `latitude`, `longitude` na entidade Barbershop
- [ ] Criar/atualizar colunas no banco de dados
- [ ] Atualizar dados das barbearias existentes
- [ ] Adicionar campos no DTO/Response
- [ ] Garantir que o Controller está retornando todos os campos
- [ ] Testar o endpoint `/api/barbershops` e verificar se os campos estão na resposta
- [ ] Testar o endpoint `/api/barbershops/{id}` e verificar se os campos estão na resposta

## 🔧 Como Testar

### 1. Fazer requisição GET no endpoint:
```bash
curl http://localhost:8080/api/barbershops
```

### 2. Verificar se a resposta contém os campos:
```json
{
  "barbershops": [
    {
      "phone": "(62) 3281-1234",          // ✅ Deve estar presente
      "openingHours": "Seg-Sex: 9h-19h",  // ✅ Deve estar presente
      "latitude": -16.6920,               // ✅ Deve estar presente
      "longitude": -49.2680               // ✅ Deve estar presente
      // ... outros campos
    }
  ]
}
```

## 🎯 Impacto no Frontend

### Antes da correção:
- Telefone: "Não informado"
- Horário: "Horário não informado" (ou valor padrão)

### Depois da correção:
- Telefone: "(62) 3281-1234" (valor real do banco)
- Horário: "Seg-Sex: 9h-19h, Sáb: 9h-17h" (valor real do banco)

## 📱 Alterações no Frontend (já implementadas)

✅ O frontend já foi atualizado para:
1. Buscar dados completos da barbearia quando o usuário clicar em "Ver detalhes"
2. Fazer fallback para valores padrão quando os campos não estiverem presentes
3. Adicionar logs detalhados para debugging

### Logs que você verá no console do navegador:
```
🏪 Processando Barbearia Estilo: {
  latitude: -16.6920,
  longitude: -49.2680,
  phone: "(62) 3281-1234",
  openingHours: "Seg-Sex: 9h-19h"
}
```

## 🚨 IMPORTANTE

Esses campos são **OBRIGATÓRIOS** para o funcionamento correto do sistema:

1. **phone** - Usado na tela de detalhes da barbearia
2. **openingHours** - Usado na tela de detalhes da barbearia
3. **latitude** e **longitude** - Usados para:
   - Calcular distância até o usuário
   - Exibir marcadores no mapa
   - Ordenar barbearias por proximidade

Sem esses campos, o sistema fica limitado e mostra informações incorretas para o usuário.

## 📞 Dúvidas?

Consulte os documentos:
- `FORMATO_DADOS_BACKEND.md` - Formato completo esperado
- `API_DOCUMENTATION.md` - Documentação completa da API
- `RESUMO_ENDPOINTS.md` - Lista de todos os endpoints

---

**Atualizado em:** 12/11/2025  
**Prioridade:** 🔴 ALTA - Campos essenciais faltando


