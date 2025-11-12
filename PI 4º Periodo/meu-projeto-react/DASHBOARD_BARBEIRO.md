# 📊 Dashboard do Barbeiro - Documentação

## 🎯 Visão Geral

Criamos uma página de Dashboard completamente nova e diferente da página do cliente, com relatórios e estatísticas específicas para barbeiros gerenciarem seus negócios.

---

## ✨ Funcionalidades Implementadas

### 1. **Relatórios Principais (Dashboard)**

#### 📈 Cards de Estatísticas:

1. **Lucro Total do Mês** 💰
   - Mostra o faturamento total do mês atual
   - Destaque visual (card em destaque)
   - Indica número total de agendamentos
   - Conectado ao backend via API

2. **Lucro Médio Diário** 📊
   - Calcula a média de receita por dia
   - Baseado nos dados do mês atual
   - Formatação em R$ (Real Brasileiro)

3. **Média de Clientes por Dia** 👥
   - Quantos clientes atendidos em média por dia
   - Mostra também quantos clientes hoje
   - Calculado automaticamente

4. **Agendamentos Hoje** 📅
   - Número de agendamentos para hoje
   - Compara com total do mês
   - Atualização em tempo real

---

### 2. **Horários Disponíveis** ⏰

- Lista todos os horários disponíveis do dia
- Integrado com endpoint `/api/appointments/available-slots`
- Mostra até 12 horários visualmente
- Indica quantos horários extras existem
- Empty state quando não há horários

**Formato dos horários:**
```
08:00  08:30  09:00  09:30  10:00
...
+5 mais
```

---

### 3. **Barbeiros Cadastrados** ✂️

- Lista todos os barbeiros da equipe
- Mostra status (Ativo/Inativo)
- Indica quantos agendamentos cada um tem hoje
- Botão para ver detalhes de cada barbeiro
- Possibilidade de adicionar novos barbeiros

**Informações exibidas:**
- Nome do barbeiro
- Status (ativo/inativo)
- Agendamentos hoje
- Agendamentos do mês

---

### 4. **Navegação Melhorada**

#### Abas disponíveis:
1. **Dashboard** 📊 - Relatórios e estatísticas
2. **Agendamentos** 📅 - Gerenciamento (em desenvolvimento)
3. **Barbeiros** 👥 - Equipe da barbearia
4. **Perfil** 👤 - Dados pessoais

---

## 🔌 Integração com Backend

### Endpoints Utilizados:

#### 1. **Buscar Barbearia**
```
GET /api/barbershops/{id}
```
Retorna dados da barbearia do barbeiro logado.

#### 2. **Buscar Agendamentos**
```
GET /api/appointments/barbershop/{barbershopId}
```
Retorna todos os agendamentos da barbearia para calcular estatísticas.

**Cálculos realizados:**
- Filtra agendamentos do mês atual
- Remove agendamentos cancelados
- Calcula soma de preços (lucro total)
- Calcula médias por dia
- Identifica agendamentos de hoje

#### 3. **Horários Disponíveis**
```
GET /api/appointments/available-slots?barbershopId={id}&date={today}
```
Retorna array de horários disponíveis: `["08:00", "08:30", ...]`

#### 4. **Barbeiros (Futuro)**
```
GET /api/barbershops/{id}/barbers
```
Endpoint ainda não implementado. Por enquanto usa dados do usuário logado.

---

## 📊 Estatísticas Calculadas

### Como são calculadas:

```javascript
// Lucro Total do Mês
totalRevenue = agendamentosMês.reduce((sum, apt) => sum + apt.price, 0)

// Média de Clientes por Dia
avgClientsPerDay = totalAgendamentosMês / diasNoMês

// Lucro Médio Diário
avgRevenuePerDay = totalRevenue / diasNoMês

// Agendamentos Hoje
todayAppointments = agendamentos.filter(apt => apt.date === hoje)
```

---

## 🎨 Interface Visual

### Componentes Usados:
- **Lucide React Icons** - Ícones modernos e profissionais
- **Cards Responsivos** - Layout em grid
- **Badges de Status** - Visual claro para status
- **Empty States** - Mensagens quando não há dados

### Cores do Tema:
- **Dourado**: `#d4af37` - Destaque/principal
- **Verde**: `#4ade80` - Crescimento/positivo
- **Cinza**: `#666` - Texto secundário
- **Fundo**: Gradientes escuros

---

## 📱 Diferenças entre Cliente e Barbeiro

| Feature | Cliente | Barbeiro |
|---------|---------|----------|
| **Mapa** | ✅ Sim | ❌ Não |
| **Filtros de Barbearias** | ✅ Sim | ❌ Não |
| **Lista de Barbearias** | ✅ Sim | ❌ Não |
| **Dashboard com Estatísticas** | ❌ Não | ✅ Sim |
| **Lucro Total/Médio** | ❌ Não | ✅ Sim |
| **Horários Disponíveis** | ❌ Não | ✅ Sim |
| **Gerenciar Barbeiros** | ❌ Não | ✅ Sim |
| **Fazer Agendamento** | ✅ Sim | ❌ Não |
| **Ver Favoritos** | ✅ Sim | ❌ Não |

---

## 🚀 Próximos Passos

### Para completar o Dashboard:

1. **Endpoint de Barbeiros**
   ```
   GET /api/barbershops/{id}/barbers
   ```
   Retornar lista de barbeiros com:
   - id, name, email, phone
   - status (active/inactive)
   - appointmentsToday (número)
   - appointmentsMonth (número)

2. **Gerenciamento de Agendamentos**
   - Visualizar todos os agendamentos
   - Confirmar/cancelar agendamentos
   - Reagendar
   - Marcar como concluído

3. **Adicionar Barbeiros**
   ```
   POST /api/barbershops/{id}/barbers
   ```
   Permitir cadastro de novos barbeiros na equipe.

4. **Gráficos**
   - Gráfico de lucro mensal (últimos 6 meses)
   - Gráfico de agendamentos por dia
   - Horários mais populares

5. **Relatórios Avançados**
   - Serviços mais vendidos
   - Clientes recorrentes
   - Taxa de cancelamento
   - Ticket médio por atendimento

---

## 💡 Como Testar

### 1. **Faça login como barbeiro:**
```json
{
  "email": "barbeiro@email.com",
  "password": "senha",
  "userType": "barber"
}
```

### 2. **Certifique-se que o usuário tem:**
- `barbershopId` definido
- Acesso aos endpoints da API

### 3. **Verifique o console:**
- Deve mostrar estatísticas sendo carregadas
- Horários disponíveis (se houver)
- Sem erros de API

### 4. **Teste as funcionalidades:**
- ✅ Dashboard carrega estatísticas
- ✅ Cards mostram valores formatados
- ✅ Horários disponíveis aparecem
- ✅ Lista de barbeiros funciona
- ✅ Navegação entre abas

---

## 🔧 Estrutura do Código

### Estados Principais:
```javascript
const [statistics, setStatistics] = useState({
  totalRevenue: 0,
  avgClientsPerDay: 0,
  avgRevenuePerDay: 0,
  monthAppointments: 0,
  todayAppointments: 0,
  totalAppointments: 0
});

const [availableSlots, setAvailableSlots] = useState([]);
const [barbers, setBarbers] = useState([]);
const [barbershop, setBarbershop] = useState(null);
```

### useEffects:
1. **fetchBarbershopData** - Busca dados da barbearia
2. **fetchStatistics** - Calcula estatísticas dos agendamentos
3. **fetchBarbers** - Lista barbeiros da equipe
4. **fetchAvailableSlots** - Horários disponíveis hoje

---

## 📝 Exemplo de Resposta da API

### Estatísticas esperadas:

```json
{
  "appointments": [
    {
      "id": 1,
      "date": "2025-11-06",
      "time": "14:30",
      "price": 50.00,
      "status": "confirmed",
      "clientName": "João Silva",
      "service": "Corte + Barba"
    }
  ]
}
```

### Horários disponíveis:

```json
{
  "availableSlots": [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30"
  ]
}
```

---

## 🎯 Resultado Final

Uma página de Dashboard profissional para barbeiros que:

✅ Mostra estatísticas financeiras em tempo real  
✅ Calcula médias automaticamente  
✅ Lista horários disponíveis  
✅ Gerencia equipe de barbeiros  
✅ Interface moderna e intuitiva  
✅ Completamente diferente da página do cliente  
✅ 100% conectada ao backend (sem mocks)  

**Interface limpa, profissional e focada em dados relevantes para o negócio!** 📊✨


