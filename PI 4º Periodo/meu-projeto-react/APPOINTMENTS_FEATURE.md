# 📅 Funcionalidade de Agendamentos

## ✨ Visão Geral

A página de Agendamentos permite que os clientes visualizem, gerenciem e acompanhem todos os seus agendamentos em barbearias.

## 🎯 Funcionalidades Implementadas

### 1. **Visualização de Agendamentos**
- ✅ Lista completa de todos os agendamentos do cliente
- ✅ Cards com informações resumidas
- ✅ Filtros por status (Todos, Próximos, Realizados, Cancelados)
- ✅ Design responsivo e moderno

### 2. **Ver Detalhes**
- ✅ Modal com informações completas do agendamento
- ✅ Dados da barbearia (nome, endereço, telefone)
- ✅ Informações do serviço (nome, duração, preço)
- ✅ Data e horário formatados
- ✅ Nome do barbeiro
- ✅ Status do agendamento

### 3. **Reagendar**
- ✅ Modal para seleção de nova data e horário
- ✅ Mostra agendamento atual para referência
- ✅ Validação de data mínima (não permite datas passadas)
- ✅ Seleção de horários disponíveis
- ✅ Confirmação antes de reagendar

### 4. **Cancelar Agendamento**
- ✅ Confirmação antes de cancelar
- ✅ Atualização do status para "cancelado"
- ✅ Feedback visual imediato
- ✅ Disponível apenas para agendamentos futuros confirmados

## 📊 Estados de Agendamento

### Status Disponíveis

```javascript
{
  confirmed: 'Confirmado',   // Verde - Agendamento ativo
  completed: 'Concluído',    // Azul - Serviço realizado
  cancelled: 'Cancelado'     // Vermelho - Agendamento cancelado
}
```

### Cores dos Status

- **Confirmado** (Verde #4CAF50):
  - Agendamento ativo
  - Permite reagendar e cancelar

- **Concluído** (Azul #2196F3):
  - Serviço já realizado
  - Apenas visualização

- **Cancelado** (Vermelho #f44336):
  - Agendamento cancelado
  - Apenas visualização

## 🎨 Interface do Usuário

### Layout Principal

```
┌─────────────────────────────────────┐
│   Meus Agendamentos                 │
│   X agendamentos                    │
├─────────────────────────────────────┤
│ [Todos] [Próximos] [Realizados]    │
│ [Cancelados]                        │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🏪 Barbearia Estilo             │ │
│ │ 📍 Av. T-63, 1234              │ │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ ✂️ Corte + Barba    💰 R$ 50,00│ │
│ │ 📅 25/10/2025       ⏰ 14:30   │ │
│ │ [Ver Detalhes] [Reagendar]     │ │
│ │ [Cancelar]                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Cards de Agendamento

Cada card exibe:
- 🏪 Nome da barbearia
- 📍 Endereço
- 🏷️ Badge de status (colorido)
- ✂️ Serviço
- 📅 Data
- ⏰ Horário
- 💰 Valor
- Botões de ação

## 🔗 Integração com API

### Criar Novo Agendamento

```javascript
POST /api/appointments
```

**Request Body (FORMATO EXATO):**
```json
{
  "clientId": 1,
  "barbershopId": 1,
  "barberId": 1,
  "serviceId": 1,
  "date": "2025-12-20",
  "time": "14:30"
}
```

**Campos Obrigatórios:**
- `clientId` (number): ID do cliente logado
- `barbershopId` (number): ID da barbearia selecionada
- `barberId` (number): ID do barbeiro (atualmente fixo como 1)
- `serviceId` (number): ID do serviço selecionado
- `date` (string): Data no formato `YYYY-MM-DD`
- `time` (string): Horário no formato `HH:MM` (24h)

**Response:**
```json
{
  "id": 123,
  "status": "pending",
  "message": "Agendamento criado com sucesso"
}
```

### Listar Agendamentos do Cliente

```javascript
GET /api/appointments/client/:clientId
```

**Response:**
```json
{
  "appointments": [
    {
      "id": 1,
      "barbershopName": "Barbearia Estilo",
      "barbershopAddress": "Av. T-63, 1234 - Setor Bueno",
      "barbershopPhone": "(62) 99999-9999",
      "service": "Corte + Barba",
      "date": "2025-10-25",
      "time": "14:30",
      "duration": 45,
      "price": 50.00,
      "status": "confirmed",
      "barberName": "João Silva"
    }
  ]
}
```

### Ações da API

#### 1. Cancelar Agendamento
```javascript
PUT /api/appointments/:id/cancel
```

**Response:**
```json
{
  "message": "Agendamento cancelado com sucesso",
  "appointment": { ...agendamento atualizado }
}
```

#### 2. Reagendar
```javascript
PUT /api/appointments/:id/reschedule

Body:
{
  "date": "2025-10-30",
  "time": "15:00"
}
```

**Response:**
```json
{
  "message": "Agendamento reagendado com sucesso",
  "appointment": { ...agendamento atualizado }
}
```

## 🛠️ Estrutura de Arquivos

```
src/components/
├── Appointments.js      # Componente principal
├── Appointments.css     # Estilos
└── HomePage.js          # Integração (activeTab)
```

## 📱 Responsividade

### Desktop (> 768px)
- Grid de cards com largura completa
- Modais centralizados
- Filtros em linha horizontal

### Tablet (768px - 480px)
- Cards em coluna única
- Botões ajustados
- Modais adaptados

### Mobile (< 480px)
- Layout otimizado para toque
- Botões em largura completa
- Modais em tela cheia
- Texto reduzido

## 🎯 Fluxo de Usuário

### Ver Agendamentos
1. Cliente faz login
2. Clica em "Agendamentos" na sidebar
3. Vê lista de agendamentos
4. Filtra por status se desejar

### Ver Detalhes
1. Cliente clica em "Ver Detalhes"
2. Modal abre com informações completas
3. Cliente pode fechar o modal

### Reagendar
1. Cliente clica em "Reagendar" (apenas para confirmados)
2. Modal de reagendamento abre
3. Cliente seleciona nova data e horário
4. Confirma o reagendamento
5. Sistema atualiza e fecha o modal
6. Feedback de sucesso

### Cancelar
1. Cliente clica em "Cancelar" (apenas para confirmados)
2. Confirmação é solicitada
3. Cliente confirma
4. Status muda para "cancelado"
5. Card é atualizado visualmente
6. Feedback de sucesso

## 🔒 Regras de Negócio

### Reagendamento
- ✅ Apenas agendamentos "confirmados"
- ✅ Apenas agendamentos futuros
- ✅ Data mínima: hoje
- ✅ Horários predefinidos (08:00 - 19:00)

### Cancelamento
- ✅ Apenas agendamentos "confirmados"
- ✅ Apenas agendamentos futuros
- ✅ Requer confirmação
- ✅ Irreversível (não pode descancelar)

### Visualização
- ✅ Todos podem ver detalhes
- ✅ Agendamentos passados são apenas leitura
- ✅ Agendamentos cancelados são apenas leitura

## 💡 Melhorias Futuras

### Curto Prazo
- [ ] Notificações de lembrete
- [ ] Avaliação após serviço completado
- [ ] Histórico de alterações
- [ ] Exportar para calendário

### Médio Prazo
- [ ] Chat com a barbearia
- [ ] Upload de foto de referência
- [ ] Solicitar barbeiro específico
- [ ] Programa de fidelidade

### Longo Prazo
- [ ] IA para sugestão de horários
- [ ] Reagendamento inteligente
- [ ] Recomendações personalizadas
- [ ] Integração com Google Calendar

## 🐛 Solução de Problemas

### Agendamentos não aparecem
**Problema:** Lista vazia mesmo com agendamentos

**Solução:**
1. Verificar se o backend está rodando
2. Checar se o endpoint está correto
3. Verificar autenticação do usuário
4. Ver console para erros de API

### Modal não abre
**Problema:** Clicar em botões não abre modal

**Solução:**
1. Verificar se há erros no console
2. Checar se `selectedAppointment` está sendo setado
3. Verificar states `showDetails` e `showReschedule`

### Reagendamento falha
**Problema:** Erro ao tentar reagendar

**Solução:**
1. Verificar se data e horário estão selecionados
2. Checar formato de data (YYYY-MM-DD)
3. Verificar endpoint da API
4. Confirmar que agendamento está "confirmado"

## 📊 Dados Mock (Desenvolvimento)

O componente inclui dados fictícios para desenvolvimento sem backend:

```javascript
const mockData = [
  {
    id: 1,
    barbershopName: 'Barbearia Estilo',
    barbershopAddress: 'Av. T-63, 1234 - Setor Bueno',
    service: 'Corte + Barba',
    date: '2025-10-25',
    time: '14:30',
    duration: 45,
    price: 50.00,
    status: 'confirmed',
    barberName: 'João Silva',
    barbershopPhone: '(62) 99999-9999'
  }
  // ... mais agendamentos
];
```

## 🎨 Personalização

### Cores
Defina no arquivo `Appointments.css`:

```css
/* Status colors */
--color-confirmed: #4CAF50;
--color-cancelled: #f44336;
--color-completed: #2196F3;

/* Primary colors */
--color-primary: #d4af37;
--color-background: #1a1a1a;
```

### Horários Disponíveis
Edite no componente `Appointments.js`:

```javascript
const timeSlots = [
  '08:00', '08:30', '09:00', // ... seus horários
];
```

---

**Status:** ✅ Implementado e Funcionando
**Data:** Outubro 2025
**Próximo:** Integrar com backend real

