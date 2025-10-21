# 👥 Páginas Separadas - Cliente vs Barbeiro

## 🎯 Visão Geral

O sistema agora possui interfaces completamente diferentes dependendo do tipo de usuário que faz login:
- **Cliente** → `HomePage.js`
- **Barbeiro** → `BarberHomePage.js`

## 🔀 Fluxo de Autenticação

```
Login
  ↓
Verificar userType
  ↓
├── Cliente? → HomePage (buscar barbearias, agendar)
└── Barbeiro? → BarberHomePage (gerenciar agendamentos, ver barbearia)
```

## 📊 Comparação das Interfaces

### 🏠 HOMEPAGE (Cliente)

**Navegação:**
- 🏠 Início
- 📅 Agendamentos
- ❤️ Favoritos
- 👤 Perfil

**Funcionalidades:**
- ✅ Buscar barbearias próximas
- ✅ Ver no mapa
- ✅ Filtrar por distância, preço, avaliação
- ✅ Fazer agendamentos
- ✅ Ver seus agendamentos
- ✅ Reagendar/cancelar
- ✅ Adicionar favoritos
- ✅ Editar perfil pessoal

**Dados Exibidos:**
- Lista de barbearias
- Mapa interativo
- Filtros de busca
- Agendamentos do cliente

---

### ✂️ BARBERHOMEPAGE (Barbeiro)

**Navegação:**
- 🏠 Dashboard
- 📅 Agendamentos
- ✂️ Minha Barbearia
- 👤 Perfil

**Funcionalidades:**
- ✅ Ver dashboard com estatísticas
- ✅ Agendamentos de hoje
- ✅ Total de agendamentos do mês
- ✅ Avaliação média
- ✅ Receita mensal
- ✅ Informações da barbearia onde trabalha
- ✅ Gerenciar agendamentos (em breve)
- ✅ Editar perfil profissional

**Dados Exibidos:**
- Cards de estatísticas
- Agendamentos do barbeiro
- Informações da barbearia
- Perfil com dados da barbearia

---

## 🔄 Lógica no App.js

```javascript
if (user) {
  const isBarber = user.userType === 'barber' || user.userType === 'BARBER';
  
  if (isBarber) {
    return <BarberHomePage user={user} onLogout={handleLogout} />;
  }
  
  return <HomePage user={user} onLogout={handleLogout} />;
}
```

## 👤 Perfil - Diferenças por Tipo

### Cliente:
```
┌────────────────────────────────┐
│ 👤 Informações Pessoais        │
│ - Nome                         │
│ - Email                        │
│ - Telefone                     │
├────────────────────────────────┤
│ 📊 Estatísticas                │
│ - Membro desde                 │
│ - Total de agendamentos        │
│ - Avaliação média              │
└────────────────────────────────┘
```

### Barbeiro:
```
┌────────────────────────────────┐
│ 👤 Informações Pessoais        │
│ - Nome                         │
│ - Email                        │
│ - Telefone                     │
│ - CPF                          │
│ - Data de Nascimento           │
├────────────────────────────────┤
│ ✂️ Sua Barbearia               │
│ - Nome da barbearia            │
│ - Endereço                     │
│ - Telefone da barbearia        │
│ - CEP                          │
│ - Avaliação                    │
├────────────────────────────────┤
│ 📊 Estatísticas                │
│ - Membro desde                 │
│ - Agendamentos realizados      │
│ - Avaliação média              │
└────────────────────────────────┘
```

## 📁 Estrutura de Arquivos

```
src/
├── App.js                          ← Roteamento por tipo de usuário
├── components/
│   ├── HomePage.js                 ← Interface do Cliente
│   ├── HomePage.css
│   ├── BarberHomePage.js           ← Interface do Barbeiro
│   ├── BarberHomePage.css
│   ├── Profile.js                  ← Compartilhado (adapta por tipo)
│   ├── Profile.css
│   ├── Appointments.js             ← Cliente
│   └── ...
```

## 🎨 Design Visual

### HomePage (Cliente)
- **Cor principal:** Dourado (#d4af37)
- **Tema:** Busca e navegação
- **Layout:** Sidebar + Lista + Mapa
- **Foco:** Encontrar barbearias

### BarberHomePage (Barbeiro)
- **Cor principal:** Dourado (#d4af37)
- **Tema:** Dashboard e gestão
- **Layout:** Sidebar + Cards de estatísticas
- **Foco:** Gerenciar trabalho

## 🔐 Campos Específicos no Backend

### User (Cliente):
```json
{
  "id": 1,
  "name": "João Cliente",
  "email": "joao@email.com",
  "phone": "(62) 99999-9999",
  "userType": "CLIENT",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### User (Barbeiro):
```json
{
  "id": 2,
  "name": "Pedro Barbeiro",
  "email": "pedro@email.com",
  "phone": "(62) 98888-8888",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-20",
  "userType": "BARBER",
  "barbershopId": 1,              ← ID da barbearia
  "createdAt": "2025-01-15T10:00:00Z"
}
```

## 🔗 Integração com Barbearia

### No BarberHomePage:
```javascript
useEffect(() => {
  if (user && user.barbershopId) {
    fetchBarbershopData();
  }
}, [user]);

const fetchBarbershopData = async () => {
  const data = await barbershopService.getBarbershopById(user.barbershopId);
  setBarbershop(data);
};
```

### No Profile:
```javascript
{(user.userType === 'barber' || user.userType === 'BARBER') && barbershop && (
  <div className="profile-section barbershop-section-profile">
    <h2>✂️ Sua Barbearia</h2>
    {/* Exibir informações da barbearia */}
  </div>
)}
```

## 📊 Dashboard do Barbeiro

### Cards de Estatísticas:

1. **Agendamentos Hoje**
   - 📅 Ícone
   - Número de agendamentos para hoje
   - Status: confirmado, pendente, etc

2. **Total Este Mês**
   - ✂️ Ícone
   - Total de atendimentos no mês atual

3. **Avaliação Média**
   - ⭐ Ícone
   - Média das avaliações recebidas

4. **Receita Mensal**
   - 💰 Ícone
   - Valor total ganho no mês

### Seções:

**Agendamentos de Hoje:**
- Lista dos agendamentos do dia
- Horário, cliente, serviço
- Status do agendamento

**Sua Barbearia:**
- Nome, endereço, telefone
- Avaliação da barbearia
- Status: Ativo

## 🚀 Funcionalidades Futuras

### Cliente:
- [ ] Sistema de favoritos funcional
- [ ] Histórico de visitas
- [ ] Sistema de avaliações
- [ ] Cupons e promoções
- [ ] Notificações de agendamento

### Barbeiro:
- [ ] Gerenciamento completo de agendamentos
- [ ] Confirmar/recusar agendamentos
- [ ] Marcar como concluído
- [ ] Ver histórico completo
- [ ] Relatórios financeiros
- [ ] Gestão de horários disponíveis
- [ ] Cadastro de serviços
- [ ] Responder avaliações

## 🎯 Navegação Completa

### Cliente (HomePage):
```
Sidebar:
├── 🏠 Início
│   ├── Lista de barbearias
│   ├── Mapa interativo
│   └── Filtros
├── 📅 Agendamentos
│   ├── Próximos
│   ├── Realizados
│   └── Cancelados
├── ❤️ Favoritos (em breve)
└── 👤 Perfil
    ├── Dados pessoais
    ├── Alterar senha
    └── Estatísticas
```

### Barbeiro (BarberHomePage):
```
Sidebar:
├── 🏠 Dashboard
│   ├── Estatísticas
│   ├── Agendamentos hoje
│   └── Info da barbearia
├── 📅 Agendamentos (em breve)
│   ├── Hoje
│   ├── Semana
│   └── Mês
├── ✂️ Minha Barbearia
│   ├── Informações completas
│   ├── Endereço e contato
│   └── Avaliações
└── 👤 Perfil
    ├── Dados pessoais + CPF
    ├── Informações da barbearia
    ├── Alterar senha
    └── Estatísticas
```

## 💡 Benefícios da Separação

### 1. **Experiência Personalizada**
- Cada tipo de usuário vê apenas o que precisa
- Interface otimizada para seu caso de uso

### 2. **Performance**
- Não carrega dados desnecessários
- Cliente não precisa de estatísticas de barbeiro
- Barbeiro não precisa da busca de barbearias

### 3. **Segurança**
- Separação clara de permissões
- Barbeiro não acessa funções de cliente
- Cliente não acessa gestão de agendamentos

### 4. **Manutenção**
- Código organizado e separado
- Fácil adicionar funcionalidades específicas
- Menos conflitos entre features

### 5. **Escalabilidade**
- Fácil adicionar novos tipos de usuário
- Possibilidade de admin no futuro
- Cada interface pode evoluir independentemente

## 🔧 Como Testar

### Testar como Cliente:
1. Fazer login com um cliente
2. Verificar: HomePage é renderizada
3. Ver: barbearias, mapa, filtros
4. Perfil: apenas dados pessoais

### Testar como Barbeiro:
1. Fazer login com um barbeiro
2. Verificar: BarberHomePage é renderizada
3. Ver: dashboard, estatísticas
4. Perfil: dados pessoais + barbearia

## ⚙️ Configuração no Backend

### Endpoint de Login:
```json
POST /api/auth/login
Response:
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Nome",
    "email": "email@email.com",
    "userType": "CLIENT" ou "BARBER",
    "barbershopId": 1  // apenas para barbeiros
  }
}
```

### O campo `userType` é crítico:
- Determina qual página renderizar
- Define quais campos exibir no perfil
- Controla acesso a funcionalidades

---

**Status:** ✅ Implementado e Funcionando
**Data:** Outubro 2025
**Próximo:** Implementar gestão de agendamentos para barbeiros

