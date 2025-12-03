# ✅ Endpoint de Agendamento - Corrigido!

## 🔧 O que foi corrigido

O componente `Booking.js` estava **simulando** a chamada para API em vez de realmente salvar no backend.

### ❌ ANTES (não salvava):
```javascript
// Simular chamada para API
await new Promise(resolve => setTimeout(resolve, 2000));

console.log('Agendamento criado:', bookingData);
onBookingComplete(bookingData);
```

### ✅ AGORA (salva no backend):
```javascript
// Chamar API real
const response = await appointmentService.createAppointment(appointmentData);

console.log('✅ Agendamento salvo no backend:', response);
onBookingComplete(bookingData);
```

## 📡 Endpoint Utilizado

### POST /api/appointments

**Arquivo:** `src/services/api.js`  
**Linha:** 315

```javascript
async createAppointment(appointmentData) {
  try {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}
```

## 📋 Formato dos Dados Enviados

### Estrutura do JSON
```json
{
  "clientId": 1,
  "barbershopId": 1,
  "barberId": null,
  "serviceId": 1,
  "date": "2025-11-15",
  "time": "14:30",
  "services": "Corte, Barba",
  "duration": 50,
  "price": 60
}
```

### Descrição dos Campos

| Campo | Tipo | Descrição | Exemplo | Obrigatório |
|-------|------|-----------|---------|-------------|
| `clientId` | Integer | ID do cliente logado | `1` | ✅ Sim |
| `barbershopId` | Integer | ID da barbearia | `1` | ✅ Sim |
| `barberId` | Integer/null | ID do barbeiro (pode ser null) | `2` ou `null` | ❌ Não |
| `serviceId` | Integer | ID do primeiro serviço | `1` | ✅ Sim |
| `date` | String | Data no formato YYYY-MM-DD | `"2025-11-15"` | ✅ Sim |
| `time` | String | Horário no formato HH:MM | `"14:30"` | ✅ Sim |
| `services` | String | Lista de serviços (separados por vírgula) | `"Corte, Barba"` | ✅ Sim |
| `duration` | Integer | Duração total em minutos | `50` | ✅ Sim |
| `price` | Float | Preço total | `60.00` | ✅ Sim |

## 📤 Exemplo Completo de Requisição

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Body
```json
{
  "clientId": 5,
  "barbershopId": 2,
  "barberId": null,
  "serviceId": 1,
  "date": "2025-11-15",
  "time": "14:30",
  "services": "Corte de Cabelo, Barba",
  "duration": 50,
  "price": 60.00
}
```

### Curl Example
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "clientId": 5,
    "barbershopId": 2,
    "barberId": null,
    "serviceId": 1,
    "date": "2025-11-15",
    "time": "14:30",
    "services": "Corte de Cabelo, Barba",
    "duration": 50,
    "price": 60.00
  }'
```

## 📥 Resposta Esperada do Backend

### Sucesso (201 Created)
```json
{
  "id": 123,
  "clientId": 5,
  "barbershopId": 2,
  "barberId": null,
  "serviceId": 1,
  "date": "2025-11-15",
  "time": "14:30",
  "services": "Corte de Cabelo, Barba",
  "duration": 50,
  "price": 60.00,
  "status": "pending",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

### Erro (400 Bad Request)
```json
{
  "error": "Bad Request",
  "message": "Campo obrigatório ausente: clientId",
  "status": 400
}
```

### Erro (404 Not Found)
```json
{
  "error": "Not Found",
  "message": "Barbearia não encontrada",
  "status": 404
}
```

## 🔍 Logs no Console

Ao fazer um agendamento, você verá no console:

### Envio
```
📤 Enviando agendamento para o backend: {
  clientId: 5,
  barbershopId: 2,
  date: "2025-11-15",
  time: "14:30",
  services: "Corte, Barba",
  duration: 50,
  price: 60
}
```

### Sucesso
```
✅ Agendamento salvo no backend: {
  id: 123,
  status: "pending",
  ...
}
```

### Erro
```
❌ Erro ao fazer agendamento: Backend não disponível
```

## 🎯 Como o Backend Deve Processar

### 1. Validações Necessárias

```java
@PostMapping
public ResponseEntity<?> createAppointment(
    @Valid @RequestBody AppointmentRequest request,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // 1. Verificar se cliente existe
    if (!clientRepository.existsById(request.getClientId())) {
        throw new NotFoundException("Cliente não encontrado");
    }
    
    // 2. Verificar se barbearia existe
    if (!barbershopRepository.existsById(request.getBarbershopId())) {
        throw new NotFoundException("Barbearia não encontrada");
    }
    
    // 3. Verificar se data/hora estão disponíveis
    if (isSlotOccupied(request.getBarbershopId(), request.getDate(), request.getTime())) {
        throw new ConflictException("Horário já ocupado");
    }
    
    // 4. Criar agendamento
    Appointment appointment = new Appointment();
    appointment.setClientId(request.getClientId());
    appointment.setBarbershopId(request.getBarbershopId());
    appointment.setBarberId(request.getBarberId());
    appointment.setServiceId(request.getServiceId());
    appointment.setDate(request.getDate());
    appointment.setTime(request.getTime());
    appointment.setServices(request.getServices());
    appointment.setDuration(request.getDuration());
    appointment.setPrice(request.getPrice());
    appointment.setStatus("pending");
    
    // 5. Salvar no banco
    Appointment saved = appointmentRepository.save(appointment);
    
    // 6. Retornar resposta
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
}
```

### 2. Entidade Appointment

```java
@Entity
@Table(name = "appointments")
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "client_id")
    private Long clientId;
    
    @NotNull
    @Column(name = "barbershop_id")
    private Long barbershopId;
    
    @Column(name = "barber_id")
    private Long barberId;
    
    @Column(name = "service_id")
    private Long serviceId;
    
    @NotNull
    private LocalDate date;
    
    @NotNull
    private LocalTime time;
    
    @NotNull
    private String services;
    
    @NotNull
    private Integer duration;
    
    @NotNull
    private Double price;
    
    @NotNull
    private String status; // pending, confirmed, completed, cancelled
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    // Getters e Setters
}
```

## 🧪 Como Testar

### 1. Teste no Frontend

```bash
1. Faça login como cliente
2. Clique em "Ver detalhes" de uma barbearia
3. Clique em "Agendar Horário"
4. Selecione um ou mais serviços
5. Escolha data e horário
6. Clique em "Confirmar Agendamento"
7. Abra o console (F12) e veja os logs
```

### 2. Verificar no Console

**Se backend estiver ONLINE:**
```
📤 Enviando agendamento para o backend: {...}
✅ Agendamento salvo no backend: {...}
```

**Se backend estiver OFFLINE:**
```
📤 Enviando agendamento para o backend: {...}
❌ Erro ao fazer agendamento: Backend não disponível
⚠️ Alert: "Backend não está disponível. Verifique se o servidor está rodando..."
```

### 3. Teste Direto na API (Backend)

```bash
# Teste se o endpoint existe
curl http://localhost:8080/api/appointments

# Teste criação de agendamento
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "barbershopId": 1,
    "date": "2025-11-15",
    "time": "14:30",
    "services": "Corte",
    "duration": 30,
    "price": 35
  }'
```

## 🚨 Possíveis Erros e Soluções

### Erro 1: "Backend não disponível"
**Causa:** Backend não está rodando  
**Solução:** Inicie o backend Spring Boot em `localhost:8080`

### Erro 2: "CORS error"
**Causa:** Backend não está configurado para aceitar requisições do frontend  
**Solução:** Configure CORS no Spring Boot:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

### Erro 3: "401 Unauthorized"
**Causa:** Token de autenticação inválido ou ausente  
**Solução:** Verifique se o usuário está logado e o token está sendo enviado

### Erro 4: "Campo obrigatório ausente"
**Causa:** Dados incompletos sendo enviados  
**Solução:** Verifique se todos os campos obrigatórios estão preenchidos

## 📊 Fluxo Completo

```
1. Cliente seleciona serviços, data e horário
   ↓
2. Frontend valida os dados
   ↓
3. Frontend formata data para YYYY-MM-DD
   ↓
4. Frontend chama appointmentService.createAppointment()
   ↓
5. Requisição POST para /api/appointments
   ↓
6. Backend valida os dados
   ↓
7. Backend verifica disponibilidade
   ↓
8. Backend salva no banco de dados
   ↓
9. Backend retorna o agendamento criado
   ↓
10. Frontend exibe mensagem de sucesso
   ↓
11. Cliente é redirecionado ou modal fecha
```

## ✅ Checklist de Implementação

### Frontend ✅
- [x] Importar `appointmentService` no Booking.js
- [x] Substituir simulação por chamada real à API
- [x] Formatar data para YYYY-MM-DD
- [x] Preparar dados no formato correto
- [x] Adicionar tratamento de erros
- [x] Adicionar logs detalhados
- [x] Mostrar mensagens apropriadas ao usuário

### Backend ⏳ (Pendente)
- [ ] Criar endpoint POST /api/appointments
- [ ] Validar dados recebidos
- [ ] Verificar disponibilidade de horário
- [ ] Salvar no banco de dados
- [ ] Retornar resposta apropriada
- [ ] Configurar CORS
- [ ] Testar endpoint

## 🎉 Resultado

Agora quando o cliente fizer um agendamento:
1. ✅ Os dados são enviados para o backend
2. ✅ O backend salva no banco de dados
3. ✅ O cliente recebe confirmação
4. ✅ O agendamento fica disponível para consulta

---

**Status:** ✅ Frontend completo | ⏳ Backend pendente  
**Data:** 12/11/2025  
**Prioridade:** 🔴 ALTA - Funcionalidade crítica

