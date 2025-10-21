# 🔗 Integração com Backend - Agendamentos

## ✨ Resumo das Integrações

Este documento descreve como o sistema de agendamentos está integrado com o backend, conectando clientes e barbearias.

## 📋 Visão Geral da Arquitetura

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Cliente   │ ←──────→│  Agendamento │ ←──────→│  Barbearia  │
│  (Frontend) │         │   (Backend)  │         │  (Backend)  │
└─────────────┘         └──────────────┘         └─────────────┘
      ↓                         ↓                         ↓
   user.id              appointment.id            barbershop.id
                        appointment.clientId       barbershop.name
                        appointment.barbershopId   barbershop.address
```

## 🔧 Serviço de API Criado

### Arquivo: `src/services/api.js`

**Novo serviço adicionado:** `appointmentService`

```javascript
export const appointmentService = {
  // Listar agendamentos do cliente
  async getClientAppointments(clientId),
  
  // Listar agendamentos da barbearia
  async getBarbershopAppointments(barbershopId),
  
  // Buscar por ID
  async getAppointmentById(id),
  
  // Criar novo
  async createAppointment(appointmentData),
  
  // Reagendar
  async rescheduleAppointment(id, newDateTime),
  
  // Cancelar
  async cancelAppointment(id),
  
  // Confirmar (barbeiro)
  async confirmAppointment(id),
  
  // Completar (barbeiro)
  async completeAppointment(id),
  
  // Horários disponíveis
  async getAvailableSlots(barbershopId, date)
};
```

## 📊 Estrutura de Dados

### Agendamento Completo

```json
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
```

### Relações no Banco de Dados

```sql
-- Tabela Appointments
CREATE TABLE appointments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  client_id BIGINT NOT NULL,
  barbershop_id BIGINT NOT NULL,
  barber_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id),
  FOREIGN KEY (barber_id) REFERENCES barbers(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

## 🔄 Fluxo de Dados

### 1. Cliente Visualiza Agendamentos

```javascript
// Frontend: Appointments.js
useEffect(() => {
  if (user && user.id) {
    fetchAppointments();
  }
}, [user]);

const fetchAppointments = async () => {
  // Chama API
  const data = await appointmentService.getClientAppointments(user.id);
  setAppointments(data.appointments);
};
```

```
GET /api/appointments/client/1
Authorization: Bearer {token}

Response:
{
  "appointments": [...]
}
```

### 2. Cliente Cancela Agendamento

```javascript
// Frontend
await appointmentService.cancelAppointment(appointmentId);

// Atualiza localmente
setAppointments(appointments.map(apt => 
  apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
));
```

```
PUT /api/appointments/1/cancel
Authorization: Bearer {token}

Response:
{
  "message": "Agendamento cancelado com sucesso",
  "appointment": {
    "id": 1,
    "status": "cancelled"
  }
}
```

### 3. Cliente Reagenda

```javascript
// Frontend
await appointmentService.rescheduleAppointment(appointmentId, {
  date: '2025-10-30',
  time: '15:00'
});

// Atualiza localmente
setAppointments(appointments.map(apt => 
  apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt
));
```

```
PUT /api/appointments/1/reschedule
Authorization: Bearer {token}

Body:
{
  "date": "2025-10-30",
  "time": "15:00"
}

Response:
{
  "message": "Agendamento reagendado com sucesso",
  "appointment": {...}
}
```

### 4. Buscar Horários Disponíveis

```javascript
// Frontend
const data = await appointmentService.getAvailableSlots(barbershopId, date);
setAvailableSlots(data.availableSlots);
```

```
GET /api/appointments/available-slots?barbershopId=1&date=2025-10-25
Authorization: Bearer {token}

Response:
{
  "date": "2025-10-25",
  "availableSlots": ["08:00", "09:00", "10:00", ...]
}
```

## 🔐 Autenticação e Autorização

### Token JWT

Todas as requisições incluem o token de autenticação:

```javascript
// Interceptor automático em api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Validações no Backend

```java
// Apenas o cliente pode ver seus próprios agendamentos
if (appointment.getClientId() != authenticatedUser.getId()) {
  throw new UnauthorizedException("Acesso negado");
}

// Apenas agendamentos futuros podem ser cancelados
if (appointment.getDate().isBefore(LocalDate.now())) {
  throw new BadRequestException("Não é possível cancelar agendamento passado");
}
```

## 🎯 Funcionalidades Implementadas

### ✅ No Frontend (Appointments.js)

- [x] Listar agendamentos do cliente logado
- [x] Filtrar por status (Todos, Próximos, Realizados, Cancelados)
- [x] Ver detalhes completos do agendamento
- [x] Reagendar agendamento (com validações)
- [x] Cancelar agendamento (com confirmação)
- [x] Buscar horários disponíveis dinamicamente
- [x] Loading states e tratamento de erros
- [x] Fallback para dados mock (desenvolvimento)

### ⏳ Necessário no Backend

- [ ] Endpoint GET `/api/appointments/client/:clientId`
- [ ] Endpoint PUT `/api/appointments/:id/cancel`
- [ ] Endpoint PUT `/api/appointments/:id/reschedule`
- [ ] Endpoint GET `/api/appointments/available-slots`
- [ ] Validações de negócio (datas, status, etc)
- [ ] Relacionamentos entre tabelas
- [ ] Envio de notificações (opcional)

## 📱 Estados e Transições

### Diagrama de Estados

```
[Cliente Agenda]
      ↓
  (pending)
      ↓
[Barbearia Confirma]
      ↓
  (confirmed) ←──────── [Cliente Reagenda]
      ↓
      ├─→ [Cliente Cancela] → (cancelled)
      ├─→ [Barbearia Cancela] → (cancelled)
      └─→ [Serviço Realizado] → (completed)
```

### Transições Permitidas

| De | Para | Ação | Quem pode |
|---|---|---|---|
| pending | confirmed | Confirmar | Barbearia |
| pending | cancelled | Cancelar | Cliente ou Barbearia |
| confirmed | cancelled | Cancelar | Cliente ou Barbearia |
| confirmed | completed | Completar | Barbearia |
| confirmed | confirmed | Reagendar | Cliente |

## 🛠️ Tratamento de Erros

### Frontend

```javascript
try {
  const data = await appointmentService.getClientAppointments(user.id);
  setAppointments(data.appointments);
} catch (error) {
  console.error('Erro ao buscar agendamentos:', error);
  setError(error.message);
  
  // Fallback para dados mock
  setAppointments(mockData);
}
```

### Erros Comuns

| Erro | Status | Solução |
|---|---|---|
| Backend não disponível | Network Error | Usar dados mock |
| Token expirado | 401 | Redirecionar para login |
| Agendamento não encontrado | 404 | Exibir mensagem amigável |
| Validação falhou | 400 | Mostrar mensagem de erro |

## 🔄 Sincronização de Dados

### Atualização Local Otimista

```javascript
// Atualizar UI imediatamente (otimista)
setAppointments(appointments.map(apt => 
  apt.id === id ? { ...apt, status: 'cancelled' } : apt
));

// Se API falhar, reverter mudança
try {
  await appointmentService.cancelAppointment(id);
} catch (error) {
  // Reverter
  setAppointments(previousAppointments);
  alert('Erro ao cancelar');
}
```

## 📊 Exemplo Completo de Integração

### Cenário: Cliente Cancela Agendamento

```javascript
// 1. Componente Appointments.js
const handleCancelAppointment = async (appointmentId) => {
  // Confirmar com usuário
  if (!window.confirm('Tem certeza?')) return;

  try {
    // 2. Chamar serviço
    await appointmentService.cancelAppointment(appointmentId);
    
    // 3. Atualizar estado local
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
    ));
    
    // 4. Feedback ao usuário
    alert('Agendamento cancelado com sucesso!');
    setShowDetails(false);
  } catch (error) {
    // 5. Tratar erro
    alert(error.message || 'Erro ao cancelar');
  }
};
```

```javascript
// services/api.js
async cancelAppointment(id) {
  const response = await api.put(`/api/appointments/${id}/cancel`);
  return response.data;
}
```

```java
// Backend: AppointmentController.java
@PutMapping("/{id}/cancel")
public ResponseEntity<?> cancelAppointment(@PathVariable Long id) {
  Appointment appointment = appointmentService.findById(id);
  
  // Validações
  if (appointment.getStatus() == Status.CANCELLED) {
    throw new BadRequestException("Já cancelado");
  }
  
  if (appointment.getDate().isBefore(LocalDate.now())) {
    throw new BadRequestException("Não pode cancelar agendamento passado");
  }
  
  // Atualizar
  appointment.setStatus(Status.CANCELLED);
  appointment.setCancelledAt(LocalDateTime.now());
  appointmentService.save(appointment);
  
  return ResponseEntity.ok(appointment);
}
```

## 🎯 Próximos Passos

### Backend (Necessário)

1. Criar entidade `Appointment` com relacionamentos
2. Implementar `AppointmentController` com todos os endpoints
3. Adicionar validações de negócio
4. Implementar lógica de horários disponíveis
5. Configurar CORS para aceitar requisições do frontend

### Frontend (Melhorias)

1. Adicionar notificações em tempo real
2. Implementar cache de agendamentos
3. Adicionar paginação para muitos agendamentos
4. Melhorar feedback visual (toasts em vez de alerts)
5. Adicionar filtro por data/período

### Integrações Futuras

1. Notificações por email/SMS
2. Lembretes automáticos
3. Sistema de avaliações pós-atendimento
4. Histórico de alterações
5. Exportar para calendário (Google, Apple)

---

**Status:** ✅ Frontend completo e pronto para integração
**Próximo:** Implementar endpoints no backend Spring Boot
**Data:** Outubro 2025

