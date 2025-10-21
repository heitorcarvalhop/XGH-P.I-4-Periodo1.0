# Documentação da API - API-Back

Esta documentação descreve os endpoints do back-end Spring Boot do projeto BarberHub, refatorado para a arquitetura com Clientes, Barbeiros e Barbearias separados.

## Base URL
```
http://localhost:8080
```

## Endpoints de Autenticação

### POST /api/auth/login
Realiza o login de um Cliente ou Barbeiro. O sistema identifica o tipo de usuário automaticamente.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (200 OK) - Login de Cliente:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "CLIENT",
  "userData": {
    "id": 1,
    "name": "Heitor Cliente",
    "email": "heitor_cliente@email.com"
  }
}
```

**Response (200 OK) - Login de Barbeiro:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "BARBER",
  "userData": {
    "id": 1,
    "name": "Carlos Barbeiro",
    "email": "carlos_barbeiro@email.com",
    "cpf": "123.456.789-00",
    "birthDate": "1990-05-15",
    "phone": "(11) 98888-7777"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Credenciais inválidas"
}
```

## Endpoints de Cadastro (Públicos)

### POST /clients/register
Cadastra um novo Cliente.

**Request Body:**
```json
{
  "name": "Heitor Cliente",
  "email": "heitor_cliente@email.com",
  "password": "senha123"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Heitor Cliente",
  "email": "heitor_cliente@email.com"
}
```

**Response (409 Conflict):**
```json
{
  "message": "Email já cadastrado"
}
```

### POST /barbers/register
Cadastra um novo Barbeiro.

**Request Body:**
```json
{
  "name": "Carlos Barbeiro",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-15",
  "phone": "(11) 98888-7777",
  "email": "carlos_barbeiro@email.com",
  "password": "senhaForte123",
  "barbershopId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Carlos Barbeiro",
  "email": "carlos_barbeiro@email.com",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-15",
  "phone": "(11) 98888-7777"
}
```

**Response (409 Conflict):**
```json
{
  "message": "Email já cadastrado no sistema"
}
```

ou
```json
{
  "message": "CPF já cadastrado"
}
```
ou
```json
{
  "message": "Barbearia não encontrada"
}
```

## Endpoints de Barbearias (Requer Autenticação)

### GET /api/barbershops
Lista todas as barbearias cadastradas no sistema.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcional):**
- `latitude`: Latitude do usuário
- `longitude`: Longitude do usuário
- `maxDistance`: Distância máxima em km
- `minRating`: Avaliação mínima
- `priceRange`: Faixa de preço
- `search`: Termo de busca

**Response (200 OK):**
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
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

**Campos Obrigatórios:**
- `id` (Long): ID único da barbearia
- `name` (String): Nome da barbearia
- `rating` (Double): Avaliação de 0 a 5
- `reviews` (Integer): Número de avaliações
- `price` (Double): Preço base dos serviços
- `address` (String): Endereço completo
- `cep` (String): CEP no formato "00000-000" ou "00000000"
- `services` (Array): Lista de serviços oferecidos
- `image` (String): URL da imagem da barbearia

### GET /api/barbershops/{id}
Busca detalhes de uma barbearia específica.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Navalha de Ouro - Setor Bueno",
  "rating": 4.8,
  "reviews": 152,
  "address": "Av. T-63, 1234 - Setor Bueno, Goiânia - GO",
  "cep": "74000-000",
  "phone": "(62) 3281-1234",
  "hours": "Seg-Sáb: 9h-20h",
  "services": [
    {
      "id": 1,
      "name": "Corte de Cabelo",
      "duration": 30,
      "price": 50.00
    }
  ],
  "images": ["image1.jpg", "image2.jpg"]
}
```

**Campos Obrigatórios:**
- `id` (Long): ID único da barbearia
- `name` (String): Nome da barbearia
- `rating` (Double): Avaliação de 0 a 5
- `reviews` (Integer): Número de avaliações
- `address` (String): Endereço completo
- `cep` (String): CEP no formato "00000-000" ou "00000000"
- `phone` (String): Telefone de contato
- `hours` (String): Horário de funcionamento
- `services` (Array): Lista de serviços com id, name, duration e price
- `images` (Array): URLs das imagens da barbearia

**Campos Opcionais para Integração com Google Maps:**
- `latitude` (Double): Latitude da localização da barbearia (ex: -23.5505) - OPCIONAL
- `longitude` (Double): Longitude da localização da barbearia (ex: -46.6333) - OPCIONAL

**✨ NOVO: Geocodificação Automática por CEP:**
O sistema agora converte automaticamente o CEP em coordenadas usando a **Google Geocoding API**. 

**Prioridade de Localização:**
1. Se a barbearia tem `latitude` e `longitude` → Usa diretamente
2. Se tem apenas `cep` → Converte CEP em coordenadas automaticamente
3. Se tem apenas `address` → Tenta localizar pelo endereço

**Isso significa que você NÃO precisa mais cadastrar latitude/longitude manualmente!** Apenas o CEP já é suficiente para o mapa funcionar.

**Exemplo com Coordenadas:**
```json
{
  "id": 1,
  "name": "Barbearia Goiás",
  "rating": 4.8,
  "reviews": 150,
  "price": 50,
  "distance": 2.5,
  "address": "Av. T-63, 1234 - Setor Bueno, Goiânia - GO",
  "cep": "74000-000",
  "phone": "(62) 3281-1234",
  "hours": "Seg-Sáb: 9h-20h",
  "latitude": -16.6869,
  "longitude": -49.2648,
  "services": [
    {
      "id": 1,
      "name": "Corte de Cabelo",
      "duration": 30,
      "price": 50.00
    }
  ],
  "images": ["image1.jpg", "image2.jpg"]
}
```

**✨ Geocodificação Automática (Recomendado):**
Basta enviar o **CEP** no campo `cep` e o sistema converte automaticamente em coordenadas!

**Exemplo Simples:**
```json
{
  "id": 1,
  "name": "Barbearia Goiás",
  "address": "Av. T-63, 1234 - Setor Bueno, Goiânia - GO",
  "cep": "74215-140",  // ← Apenas isso já é suficiente!
  "rating": 4.8,
  "price": 50
}
```

**Como Obter Coordenadas Manualmente (Opcional):**
Só necessário se quiser precisão extra ou se o CEP não funcionar:
1. Acesse o Google Maps
2. Pesquise o endereço da barbearia
3. Clique com o botão direito no local exato
4. Selecione as coordenadas que aparecem no topo
5. Adicione aos campos `latitude` e `longitude`

### POST /api/barbershops/{id}/services
Adiciona um novo serviço a uma barbearia existente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Corte de Cabelo",
  "duration": 30,
  "price": 50.00
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Corte de Cabelo",
  "duration": 30,
  "price": 50.00
}
```

## Endpoints de Validação (Públicos)

### POST /api/validation/email
Valida se um email já está em uso por um cliente ou barbeiro.

**Request Body:**
```json
{
  "value": "usuario@email.com"
}
```

**Response (200 OK) - Email em uso:**
```json
{
  "valid": false,
  "message": "Email já está em uso"
}
```

**Response (200 OK) - Email disponível:**
```json
{
  "valid": true,
  "message": "Email disponível"
}
```

### POST /api/validation/cpf
Valida se um CPF já está em uso por um barbeiro.

**Request Body:**
```json
{
  "value": "123.456.789-00"
}
```

**Response (200 OK) - CPF em uso:**
```json
{
  "valid": false,
  "message": "CPF já está em uso"
}
```

## Endpoints de Usuários

### GET /api/users/:id
Busca um usuário específico por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Heitor Cliente",
  "email": "heitor@email.com",
  "phone": "(62) 99999-9999",
  "cpf": "123.456.789-00",
  "birthDate": "1990-01-15",
  "userType": "CLIENT",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-10-21T10:00:00Z"
}
```

### PUT /api/users/:id
Atualiza dados do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Nome Atualizado",
  "email": "novo@email.com",
  "phone": "(62) 99999-9999",
  "cpf": "123.456.789-00",
  "birthDate": "1990-01-15",
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123"
}
```

**Observações:**
- `currentPassword` e `newPassword` são opcionais
- Se enviar `newPassword`, `currentPassword` é obrigatório
- Nova senha deve ter no mínimo 6 caracteres
- CPF e birthDate são obrigatórios apenas para barbeiros

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Nome Atualizado",
  "email": "novo@email.com",
  "phone": "(62) 99999-9999",
  "cpf": "123.456.789-00",
  "birthDate": "1990-01-15",
  "userType": "CLIENT",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-10-21T14:30:00Z"
}
```

**Response (400 Bad Request) - Senha atual incorreta:**
```json
{
  "error": "Senha atual incorreta"
}
```

**Response (400 Bad Request) - Validação:**
```json
{
  "error": "Email já está em uso"
}
```

### DELETE /api/users/:id
Deleta um usuário (requer permissões de admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

### GET /api/users
Lista todos os usuários (apenas admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Usuário 1",
      "email": "user1@email.com",
      "userType": "CLIENT"
    },
    {
      "id": 2,
      "name": "Usuário 2",
      "email": "user2@email.com",
      "userType": "BARBER"
    }
  ]
}
```

## Endpoints de Agendamentos

### GET /api/appointments/client/:clientId
Lista todos os agendamentos de um cliente específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "appointments": [
    {
      "id": 1,
      "clientId": 1,
      "clientName": "Heitor Cliente",
      "barbershopId": 1,
      "barbershopName": "Barbearia Estilo",
      "barbershopAddress": "Av. T-63, 1234 - Setor Bueno",
      "barbershopPhone": "(62) 99999-9999",
      "barberId": 1,
      "barberName": "João Silva",
      "serviceId": 1,
      "service": "Corte + Barba",
      "date": "2025-10-25",
      "time": "14:30",
      "duration": 45,
      "price": 50.00,
      "status": "confirmed"
    }
  ]
}
```

**Status possíveis:**
- `pending`: Aguardando confirmação da barbearia
- `confirmed`: Confirmado pela barbearia
- `cancelled`: Cancelado (pelo cliente ou barbearia)
- `completed`: Serviço realizado

### GET /api/appointments/barbershop/:barbershopId
Lista todos os agendamentos de uma barbearia específica.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
Similar ao endpoint do cliente, mas com todos os agendamentos da barbearia.

### GET /api/appointments/:id
Busca um agendamento específico por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "clientId": 1,
  "clientName": "Heitor Cliente",
  "barbershopId": 1,
  "barbershopName": "Barbearia Estilo",
  "service": "Corte + Barba",
  "date": "2025-10-25",
  "time": "14:30",
  "duration": 45,
  "price": 50.00,
  "status": "confirmed"
}
```

### POST /api/appointments
Cria um novo agendamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "clientId": 1,
  "barbershopId": 1,
  "barberId": 1,
  "serviceId": 1,
  "date": "2025-10-25",
  "time": "14:30"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "clientId": 1,
  "barbershopId": 1,
  "barberId": 1,
  "serviceId": 1,
  "date": "2025-10-25",
  "time": "14:30",
  "duration": 45,
  "price": 50.00,
  "status": "pending",
  "createdAt": "2025-10-21T10:00:00Z"
}
```

### PUT /api/appointments/:id/reschedule
Reagenda um agendamento existente.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "date": "2025-10-30",
  "time": "15:00"
}
```

**Response (200 OK):**
```json
{
  "message": "Agendamento reagendado com sucesso",
  "appointment": {
    "id": 1,
    "date": "2025-10-30",
    "time": "15:00",
    "status": "confirmed"
  }
}
```

### PUT /api/appointments/:id/cancel
Cancela um agendamento.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Agendamento cancelado com sucesso",
  "appointment": {
    "id": 1,
    "status": "cancelled",
    "cancelledAt": "2025-10-21T10:00:00Z"
  }
}
```

### PUT /api/appointments/:id/confirm
Confirma um agendamento (apenas barbeiro/barbearia).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Agendamento confirmado",
  "appointment": {
    "id": 1,
    "status": "confirmed"
  }
}
```

### PUT /api/appointments/:id/complete
Marca um agendamento como concluído (apenas barbeiro/barbearia).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Agendamento marcado como concluído",
  "appointment": {
    "id": 1,
    "status": "completed",
    "completedAt": "2025-10-25T15:15:00Z"
  }
}
```

### GET /api/appointments/available-slots
Busca horários disponíveis para agendamento.

**Query Parameters:**
- `barbershopId`: ID da barbearia
- `date`: Data no formato YYYY-MM-DD

**Response (200 OK):**
```json
{
  "date": "2025-10-25",
  "availableSlots": [
    "08:00",
    "08:30",
    "09:00",
    "10:00",
    "14:00",
    "15:30",
    "16:00"
  ]
}
```

**Response (200 OK) - CPF disponível:**
```json
{
  "valid": true,
  "message": "CPF disponível"
}
```

## Códigos de Status HTTP

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict (Email/CPF já cadastrado, Barbearia não encontrada)
- **422** - Unprocessable Entity
- **500** - Internal Server Error

## Headers Obrigatórios

Para endpoints que requerem autenticação:
```
Authorization: Bearer {token}
Content-Type: application/json
```

## 📚 Documentação Adicional

- **`FORMATO_DADOS_BACKEND.md`**: Formato EXATO dos dados que o backend deve retornar
- **`BACKEND_CORS_CONFIG.md`**: Como configurar CORS no Spring Boot

## Integração Frontend

### Serviços Disponíveis

O frontend possui os seguintes serviços para integração:

#### authService
- `login(credentials)` - Login de cliente ou barbeiro
- `logout()` - Logout do usuário
- `isAuthenticated()` - Verifica se usuário está autenticado
- `getCurrentUser()` - Obtém dados do usuário logado

#### userService
- `register(userData)` - Registra cliente ou barbeiro (detecta automaticamente)
- `registerClient(clientData)` - Registra apenas cliente
- `registerBarber(barberData)` - Registra apenas barbeiro
- `getUserById(id)` - Busca usuário por ID
- `updateUser(id, userData)` - Atualiza dados do usuário
- `deleteUser(id)` - Deleta usuário

#### barbershopService
- `getAllBarbershops(filters)` - Lista todas as barbearias com filtros opcionais
- `getBarbershopById(id)` - Busca barbearia por ID
- `addService(barbershopId, serviceData)` - Adiciona serviço a uma barbearia

#### validationService
- `validateEmail(email)` - Valida disponibilidade de email
- `validateCPF(cpf)` - Valida disponibilidade de CPF

---

Esta documentação descreve as rotas, respostas e formatos necessários para integração completa do backend API-Back com o front-end BarberHub.
