# Formato Exato dos Dados do Backend

Este documento especifica **EXATAMENTE** como os dados devem ser retornados pelo backend Spring Boot.

## 📋 Estrutura de Dados das Barbearias

### GET /api/barbershops

**Response esperado pelo frontend:**

```json
{
  "barbershops": [
    {
      "id": 1,
      "name": "Navalha de Ouro - Setor Bueno",
      "rating": 4.8,
      "reviews": 152,
      "price": 50.00,
      "address": "Av. T-63, 1234 - Setor Bueno, Goiânia - GO",
      "cep": "74000-000",
      "services": [],
      "image": "https://example.com/barbershop.jpg"
    },
    {
      "id": 2,
      "name": "Classic Cuts Premium",
      "rating": 4.9,
      "reviews": 287,
      "price": 45.00,
      "address": "Rua 3, 123 - Setor Central, Goiânia - GO",
      "cep": "74015-120",
      "services": ["Corte", "Barba", "Tratamento"],
      "image": "https://example.com/barbershop2.jpg"
    }
  ]
}
```

## ✅ Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `id` | Long | ID único da barbearia | `1` |
| `name` | String | Nome da barbearia | `"Navalha de Ouro"` |
| `rating` | Double | Avaliação de 0.0 a 5.0 | `4.8` |
| `reviews` | Integer | Número de avaliações | `152` |
| `price` | Double | Preço base em R$ | `50.00` |
| `address` | String | Endereço completo | `"Av. T-63, 1234 - Setor Bueno"` |
| `cep` | String | CEP (com ou sem formatação) | `"74000-000"` ou `"74000000"` |
| `services` | Array | Lista de serviços (pode ser vazia) | `["Corte", "Barba"]` |
| `image` | String | URL da imagem | `"https://..."` |

## ❌ Campos que NÃO devem ser enviados

**NÃO inclua estes campos no JSON:**

- ❌ `coordinates` - O frontend calcula automaticamente
- ❌ `lat` / `latitude` - Não é necessário
- ❌ `lng` / `longitude` - Não é necessário
- ❌ `distance` - O frontend calcula baseado na localização do usuário

## 🔍 Detalhes dos Campos

### 1. CEP (Campo Crítico)

O CEP é **OBRIGATÓRIO** e será usado para geocodificação:

✅ **Formatos aceitos:**
```json
"cep": "74000-000"  // Com hífen (preferido)
"cep": "74000000"   // Sem hífen (também funciona)
```

❌ **Formatos NÃO aceitos:**
```json
"cep": null         // Não pode ser null
"cep": ""           // Não pode ser vazio
"cep": "74000"      // CEP incompleto
```

**O que o frontend faz com o CEP:**
- Exibe o CEP formatado na interface
- Pode ser usado para busca e filtros

### 2. Rating (Avaliação)

✅ **Formato correto:**
```json
"rating": 4.8       // Número decimal de 0.0 a 5.0
"rating": 5.0       // Nota máxima
"rating": 0.0       // Nota mínima
```

❌ **Formatos incorretos:**
```json
"rating": "4.8"     // String (deve ser número)
"rating": 6.0       // Acima de 5.0
"rating": -1.0      // Negativo
```

### 3. Services (Serviços)

✅ **Formatos aceitos:**
```json
"services": []                              // Array vazio (OK)
"services": ["Corte"]                       // Um serviço
"services": ["Corte", "Barba", "Tratamento"] // Múltiplos serviços
```

❌ **Formatos incorretos:**
```json
"services": null    // Não pode ser null (use array vazio)
"services": ""      // Não é um array
```

### 4. Image (Imagem)

✅ **Formatos aceitos:**
```json
"image": "https://example.com/image.jpg"    // URL completa
"image": "/uploads/barbershop1.jpg"         // Caminho relativo
"image": ""                                 // String vazia (usa placeholder)
```

**Nota:** Se a imagem estiver vazia, o frontend usará um placeholder padrão.

## 📊 Exemplo Completo - Múltiplas Barbearias

```json
{
  "barbershops": [
    {
      "id": 1,
      "name": "Barbearia Central",
      "rating": 4.8,
      "reviews": 152,
      "price": 50.00,
      "address": "Rua Principal, 100 - Centro, Goiânia - GO",
      "cep": "74000-000",
      "services": ["Corte", "Barba"],
      "image": "https://example.com/barber1.jpg"
    },
    {
      "id": 2,
      "name": "Elite Cuts",
      "rating": 4.9,
      "reviews": 287,
      "price": 60.00,
      "address": "Av. Goiás, 500 - Setor Bueno, Goiânia - GO",
      "cep": "74230-010",
      "services": ["Corte", "Barba", "Tratamento", "Noivo"],
      "image": "https://example.com/barber2.jpg"
    },
    {
      "id": 3,
      "name": "Quick Cuts",
      "rating": 4.5,
      "reviews": 98,
      "price": 30.00,
      "address": "Rua 10, 250 - Setor Central, Goiânia - GO",
      "cep": "74015-120",
      "services": ["Corte"],
      "image": "https://example.com/barber3.jpg"
    }
  ]
}
```

## 🔄 Processamento pelo Frontend

O frontend usa os dados exatamente como recebidos do backend, sem modificações ou processamento adicional.

## 🎯 Modelo Java (Spring Boot)

```java
@Entity
@Table(name = "barbershops")
public class Barbershop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @Min(0)
    @Max(5)
    private Double rating;
    
    @Min(0)
    private Integer reviews;
    
    @Min(0)
    private Double price;
    
    @NotBlank
    private String address;
    
    @NotBlank
    @Pattern(regexp = "\\d{5}-?\\d{3}")
    private String cep;  // ⭐ CAMPO OBRIGATÓRIO
    
    @ElementCollection
    private List<String> services = new ArrayList<>();
    
    private String image;
    
    // Getters e Setters
}
```

## 🚫 Erros Comuns a Evitar

### ❌ Erro 1: CEP null ou vazio
```json
{
  "id": 1,
  "name": "Barbearia",
  "cep": null  // ← NÃO FAZER
}
```

### ❌ Erro 2: Rating como string
```json
{
  "id": 1,
  "name": "Barbearia",
  "rating": "4.8"  // ← NÃO FAZER (deve ser número)
}
```

### ❌ Erro 3: Services null
```json
{
  "id": 1,
  "name": "Barbearia",
  "services": null  // ← NÃO FAZER (use array vazio)
}
```

## ✅ Checklist de Validação

Antes de enviar dados para o frontend, verifique:

- [ ] Objeto principal é `{ "barbershops": [...] }`
- [ ] Cada barbearia tem `id`, `name`, `rating`, `reviews`, `price`, `address`, `cep`, `services`, `image`
- [ ] Campo `cep` está preenchido e válido (8 dígitos)
- [ ] Campo `rating` é número entre 0.0 e 5.0
- [ ] Campo `services` é array (pode ser vazio)
- [ ] Campo `price` é número positivo

## 📞 Suporte

Se houver dúvidas sobre o formato:
1. Verifique os logs do frontend (console do navegador)
2. O frontend mostra mensagens claras sobre erros de formato
3. Consulte este documento para o formato exato

---

**✅ Siga exatamente este formato e o frontend funcionará perfeitamente!**

