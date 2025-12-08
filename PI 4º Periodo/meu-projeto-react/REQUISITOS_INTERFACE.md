# 📱 Requisitos de Interface e Protótipos - BarberShop System

## 📋 Índice
1. [Requisitos Funcionais de Interface](#requisitos-funcionais-de-interface)
2. [Requisitos Não-Funcionais (UX/UI)](#requisitos-não-funcionais-uxui)
3. [Fluxos de Usuário](#fluxos-de-usuário)
4. [Protótipos de Baixa Fidelidade](#protótipos-de-baixa-fidelidade)

---

## 🎯 Requisitos Funcionais de Interface

### RF01 - Autenticação
- **RF01.1** O sistema deve apresentar tela de login com campos de email e senha
- **RF01.2** O sistema deve permitir seleção de tipo de usuário (Cliente ou Barbeiro)
- **RF01.3** O sistema deve exibir mensagens de erro claras para credenciais inválidas
- **RF01.4** O sistema deve redirecionar para dashboard específico após login bem-sucedido

### RF02 - Cadastro de Usuário
- **RF02.1** O sistema deve apresentar formulário de cadastro com validação em tempo real
- **RF02.2** Para barbeiros, deve exibir campo de seleção de barbearia
- **RF02.3** Deve formatar automaticamente CPF e telefone durante digitação
- **RF02.4** Deve validar idade mínima (18 anos) para barbeiros

### RF03 - Dashboard do Cliente
- **RF03.1** Deve exibir lista de barbearias ordenadas por distância
- **RF03.2** Deve apresentar mapa interativo com localização das barbearias
- **RF03.3** Deve permitir filtros por avaliação, distância e preço
- **RF03.4** Deve exibir cards com informações das barbearias (nome, avaliação, serviços)

### RF04 - Dashboard do Barbeiro
- **RF04.1** Deve exibir estatísticas em cards visuais (lucro, clientes, agendamentos)
- **RF04.2** Deve apresentar calendário com agendamentos do dia
- **RF04.3** Deve mostrar contadores em tempo real de clientes e agendamentos
- **RF04.4** Deve permitir atualização manual das estatísticas

### RF05 - Sistema de Agendamentos
- **RF05.1** Deve apresentar calendário interativo para seleção de data
- **RF05.2** Deve exibir serviços disponíveis em formato de cards
- **RF05.3** Deve mostrar horários disponíveis dinamicamente
- **RF05.4** Deve apresentar resumo do agendamento antes da confirmação
- **RF05.5** Deve permitir seleção de apenas 1 serviço por agendamento

### RF06 - Gerenciamento de Agendamentos
- **RF06.1** Cliente deve visualizar lista de seus agendamentos
- **RF06.2** Cliente deve poder cancelar ou reagendar
- **RF06.3** Barbeiro deve visualizar todos agendamentos da barbearia
- **RF06.4** Sistema deve exibir status colorido (pendente, confirmado, cancelado)

### RF07 - Perfil do Usuário
- **RF07.1** Deve exibir dados do usuário de forma organizada
- **RF07.2** Deve permitir edição de informações pessoais
- **RF07.3** Deve exigir senha atual para alteração de senha

### RF08 - Perfil da Barbearia
- **RF08.1** Deve exibir informações completas da barbearia
- **RF08.2** Deve mostrar serviços oferecidos com preços
- **RF08.3** Deve apresentar horário de funcionamento
- **RF08.4** Deve exibir avaliações e comentários de clientes

---

## 🎨 Requisitos Não-Funcionais (UX/UI)

### RNF01 - Usabilidade
- **RNF01.1** Interface deve seguir padrão de design consistente (dourado #d4af37)
- **RNF01.2** Botões principais devem ter feedback visual ao hover
- **RNF01.3** Campos de formulário devem ter validação visual (verde/vermelho)
- **RNF01.4** Loading states devem ser exibidos durante requisições
- **RNF01.5** Mensagens de erro devem ser claras e acionáveis

### RNF02 - Responsividade
- **RNF02.1** Interface deve adaptar-se a telas de 320px a 1920px
- **RNF02.2** Menu lateral deve colapsar em dispositivos móveis
- **RNF02.3** Cards devem reorganizar em grid responsivo

### RNF03 - Performance
- **RNF03.1** Tempo de carregamento inicial < 3 segundos
- **RNF03.2** Transições e animações devem ser suaves (< 300ms)
- **RNF03.3** Imagens devem ter lazy loading

### RNF04 - Acessibilidade
- **RNF04.1** Contraste de cores deve seguir WCAG 2.1 (mínimo AA)
- **RNF04.2** Elementos interativos devem ter área mínima de 44x44px
- **RNF04.3** Formulários devem ter labels associados

### RNF05 - Feedback Visual
- **RNF05.1** Estados de sucesso devem usar verde (#4caf50)
- **RNF05.2** Estados de erro devem usar vermelho (#f44336)
- **RNF05.3** Estados de aviso devem usar amarelo (#ff9800)
- **RNF05.4** Loading deve usar spinner animado

---

## 🔄 Fluxos de Usuário

### Fluxo 1: Cliente Fazer Agendamento
```
1. Login como Cliente
   ↓
2. Ver Dashboard com Barbearias
   ↓
3. Selecionar Barbearia
   ↓
4. Clicar em "Agendar"
   ↓
5. Escolher Serviço (radio button)
   ↓
6. Selecionar Data no Calendário
   ↓
7. Escolher Horário Disponível
   ↓
8. Revisar Resumo
   ↓
9. Confirmar Agendamento
   ↓
10. Ver Confirmação e Voltar para Home
```

### Fluxo 2: Barbeiro Visualizar Agendamentos
```
1. Login como Barbeiro
   ↓
2. Ver Dashboard com Estatísticas
   ↓
3. Visualizar Cards:
   - Lucro do Mês
   - Agendamentos Hoje
   - Clientes Únicos
   ↓
4. Ver Calendário com Agendamentos do Dia
   ↓
5. Clicar em Agendamento para Ver Detalhes
   ↓
6. Confirmar/Completar Atendimento
```

### Fluxo 3: Cadastro de Barbeiro
```
1. Abrir Tela de Cadastro
   ↓
2. Selecionar "Barbeiro"
   ↓
3. Preencher:
   - Nome Completo
   - CPF (com máscara)
   - Data de Nascimento
   - Telefone (com máscara)
   - Email
   - Senha
   ↓
4. Selecionar Barbearia (dropdown)
   ↓
5. Validação em Tempo Real
   ↓
6. Clicar em "Cadastrar"
   ↓
7. Redirecionamento para Login
```

---

## 📐 Protótipos de Baixa Fidelidade

### Protótipo 1: Tela de Login

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Imagem Tijolo]                    │
│                                                 │
│             🪒 BARBERSHOP                       │
│            Estilo & Tradição                    │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│     ┌──────────┐  ┌──────────┐                │
│     │👤 Cliente│  │✂️ Barbeiro│               │
│     │  ATIVO   │  │          │                 │
│     └──────────┘  └──────────┘                 │
│                                                 │
│     Bem-vindo de volta                         │
│     Entre na sua conta para continuar          │
│                                                 │
│     Email:                                      │
│     [________________________]                  │
│                                                 │
│     Senha:                                      │
│     [________________________]                  │
│                                                 │
│     [ Esqueceu a senha? ]                      │
│                                                 │
│     ┌──────────────────────┐                   │
│     │       ENTRAR         │                   │
│     └──────────────────────┘                   │
│                                                 │
│     ┌──────────────────────┐                   │
│     │   Criar nova conta   │                   │
│     └──────────────────────┘                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Protótipo 2: Dashboard Cliente (Lista de Barbearias)

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰  BARBERSHOP          [Buscar...]         [Perfil ▼]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filtros:  [Distância ▼] [Avaliação ▼] [Preço ▼]  [Vista: ⊞] │
│                                                                 │
│  ┌─────────────────────────────┐   ┌───────────────────────┐  │
│  │  🗺️  Mapa Interativo        │   │  Barbearias Próximas  │  │
│  │                              │   │  ┌─────────────────┐  │  │
│  │    📍 Faculdade SENAI       │   │  │ [Foto] Barbearia │  │  │
│  │                              │   │  │ 🏪 Nome          │  │  │
│  │    🏪 Barbearia 1 (2.5km)  │   │  │ ⭐ 4.8 (152)     │  │  │
│  │    🏪 Barbearia 2 (3.1km)  │   │  │ 💰 R$ 45,00      │  │  │
│  │    🏪 Barbearia 3 (4.2km)  │   │  │ 📍 2.5 km        │  │  │
│  │                              │   │  │ [Ver Detalhes]   │  │  │
│  │                              │   │  └─────────────────┘  │  │
│  │                              │   │                       │  │
│  │                              │   │  ┌─────────────────┐  │  │
│  │                              │   │  │ [Foto] Barbearia │  │  │
│  │                              │   │  │ 🏪 Nome          │  │  │
│  │                              │   │  │ ⭐ 4.5 (98)      │  │  │
│  │                              │   │  │ 💰 R$ 50,00      │  │  │
│  │                              │   │  │ 📍 3.1 km        │  │  │
│  │                              │   │  │ [Ver Detalhes]   │  │  │
│  └─────────────────────────────┘   └───────────────────────┘  │
│                                                                 │
│  Menu Inferior: [🏠 Home] [📅 Agendamentos] [❤️ Favoritos]    │
└─────────────────────────────────────────────────────────────────┘
```

### Protótipo 3: Tela de Agendamento

```
┌─────────────────────────────────────────────────────────────┐
│  [←]            Agendar Horário                             │
│               Barbearia Nome - Endereço                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Escolha o Serviço                                      │
│  Selecione apenas um serviço por agendamento               │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  (•) Corte   │  │  ( ) Barba   │  │ ( ) Sobrancelha│   │
│  │   30 min     │  │   20 min     │  │   15 min     │    │
│  │  R$ 35,00    │  │  R$ 25,00    │  │  R$ 15,00    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  2. Escolha a Data                                         │
│  ┌─────────────────────────────────────────┐              │
│  │       Dezembro 2025                     │              │
│  │  D  S  T  Q  Q  S  S                   │              │
│  │  1  2  3  4  5  6  7                   │              │
│  │  8  9 [10]11 12 13 14                  │  ← Dia 10    │
│  │ 15 16 17 18 19 20 21                   │    selecionado│
│  └─────────────────────────────────────────┘              │
│                                                             │
│  3. Escolha o Horário                                      │
│  [08:00] [08:30] [09:00] [09:30] [10:00] [10:30]         │
│  [14:00] [14:30] [15:00] [15:30] [16:00] [16:30]         │
│          ↑ Horário 14:30 selecionado                       │
│                                                             │
│  ┌─────────────────────────────────────────┐              │
│  │ 📋 Resumo do Agendamento                │              │
│  │ Data: 10/12/2025                        │              │
│  │ Horário: 14:30                          │              │
│  │ Serviço: Corte                          │              │
│  │ Duração: 30 minutos                     │              │
│  │ Total: R$ 35,00                         │              │
│  └─────────────────────────────────────────┘              │
│                                                             │
│  [Cancelar]        [Confirmar Agendamento]                │
└─────────────────────────────────────────────────────────────┘
```

### Protótipo 4: Dashboard Barbeiro

```
┌─────────────────────────────────────────────────────────────────┐
│  ☰  BARBERSHOP - Dashboard  🔄 Atualizar    [Perfil ▼]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ 💰 Lucro Mês │ │ 📈 Média/Dia │ │ 👥 Clientes   │          │
│  │              │ │              │ │               │          │
│  │  R$ 2.250    │ │    3.5       │ │  5 clientes   │          │
│  │              │ │              │ │     hoje      │          │
│  │ 45 agendamentos│ │ Baseado no mês│ │             │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                                 │
│  ┌──────────────┐ ┌─────────────────────────────────────┐    │
│  │ 📅 Agendamentos│ │  Calendário - Agendamentos Hoje    │    │
│  │     Hoje      │ │                                     │    │
│  │               │ │  5 agendados | 8 horários livres   │    │
│  │      8        │ │                                     │    │
│  │               │ │  Agendamentos Confirmados (5):     │    │
│  │  28 no mês    │ │                                     │    │
│  └──────────────┘ │  ┌──────────────────────────────┐  │    │
│                    │  │ 09:00 - João Silva           │  │    │
│                    │  │ 💈 Corte (30min) - R$ 35     │  │    │
│                    │  │ [Confirmar] [Cancelar]       │  │    │
│                    │  └──────────────────────────────┘  │    │
│                    │                                     │    │
│                    │  ┌──────────────────────────────┐  │    │
│                    │  │ 10:00 - Maria Santos         │  │    │
│                    │  │ 💈 Barba (20min) - R$ 25     │  │    │
│                    │  │ [Confirmar] [Cancelar]       │  │    │
│                    │  └──────────────────────────────┘  │    │
│                    │                                     │    │
│                    │  Horários Livres (8):              │    │
│                    │  [11:00] [11:30] [14:00] [14:30]  │    │
│                    │                                     │    │
│                    │  ────────────────────────────────  │    │
│                    │  📊 Resumo:                        │    │
│                    │  👥 5 agendamentos                 │    │
│                    │  🕐 8 horários livres              │    │
│                    │  💰 R$ 175,00 receita prevista    │    │
│                    └─────────────────────────────────────┘    │
│                                                                 │
│  Menu: [📊 Dashboard] [📅 Agendamentos] [👥 Barbeiros] [🏪 Barbearia]│
└─────────────────────────────────────────────────────────────────┘
```

### Protótipo 5: Cadastro de Barbeiro

```
┌─────────────────────────────────────────────────────────┐
│  [←]         🪒 BARBERSHOP                              │
│             Crie sua conta                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Como você quer se cadastrar?                          │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐          │
│  │  👤 Cliente     │    │  ✂️ Barbeiro    │          │
│  │                 │    │    [SELECIONADO] │          │
│  │ Agendar horários│    │ Gerenciar barbearia│        │
│  └─────────────────┘    └─────────────────┘          │
│                                                         │
│  Nome Completo *                                       │
│  [_________________________]                           │
│  Nome de usuário: tadeu jorge                          │
│                                                         │
│  CPF *                  Data de Nascimento *           │
│  [999.999.999-99]       [11/09/2001]                  │
│                                                         │
│  Barbearia onde trabalha *                             │
│  [TadeuBRUTAL e Cortes ▼]                            │
│  ↑ Dropdown com lista de barbearias                   │
│                                                         │
│  Telefone *                                            │
│  [(62) 98266-5531]                                    │
│                                                         │
│  Email *                                               │
│  [tadaojorge@gmail.com]                               │
│                                                         │
│  Senha *                Confirmar Senha *              │
│  [••••••••]             [••••••••]                     │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │  Cadastrar como Barbeiro            │              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  Já tem uma conta? [Faça login aqui]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Protótipo 6: Lista de Agendamentos (Cliente)

```
┌─────────────────────────────────────────────────────────────┐
│  ☰  Meus Agendamentos                    [Perfil ▼]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filtros: [Todos ▼] [Pendentes] [Confirmados] [Concluídos]│
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🏪 Navalha de Ouro                     [CONFIRMADO] │ │
│  │  📍 Av. T-63, 1234 - Setor Bueno                     │ │
│  │  📅 10/12/2025 às 14:30                              │ │
│  │  💈 Serviço: Corte de Cabelo                         │ │
│  │  ⏱️  Duração: 30 minutos                             │ │
│  │  💰 Valor: R$ 35,00                                  │ │
│  │  👨‍💼 Barbeiro: Carlos Silva                          │ │
│  │  ☎️  (62) 3333-4444                                  │ │
│  │                                                       │ │
│  │  [Reagendar]  [Cancelar]  [Ver Detalhes]           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  🏪 Barbearia Estilo                    [PENDENTE]   │ │
│  │  📍 Rua ABC, 456                                     │ │
│  │  📅 12/12/2025 às 10:00                              │ │
│  │  💈 Serviço: Barba                                   │ │
│  │  ⏱️  Duração: 20 minutos                             │ │
│  │  💰 Valor: R$ 25,00                                  │ │
│  │  👨‍💼 Barbeiro: João Santos                          │ │
│  │  ☎️  (62) 9999-8888                                  │ │
│  │                                                       │ │
│  │  [Reagendar]  [Cancelar]  [Ver Detalhes]           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Menu: [🏠 Home] [📅 Agendamentos] [❤️ Favoritos] [👤 Perfil]│
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Elementos Visuais e Padrões

### Paleta de Cores

```
Primária:   #d4af37 (Dourado)         ████
Secundária: #1a1a1a (Preto Suave)     ████
Sucesso:    #4caf50 (Verde)           ████
Erro:       #f44336 (Vermelho)        ████
Aviso:      #ff9800 (Laranja)         ████
Info:       #2196f3 (Azul)            ████
Background: #0a0a0a (Preto Profundo)  ████
```

### Tipografia
```
Títulos:     'Playfair Display', serif
Corpo:       'Inter', 'Roboto', sans-serif
Código:      'Fira Code', monospace
```

### Espaçamentos
```
Pequeno:    8px
Médio:      16px
Grande:     24px
Extra:      32px
```

### Bordas
```
Arredondamento: 8px (padrão)
Sombras:        0 4px 15px rgba(0,0,0,0.3)
```

---

## ✅ Checklist de Implementação

### Telas Implementadas
- [x] Login
- [x] Cadastro (Cliente e Barbeiro)
- [x] Dashboard Cliente (Lista de Barbearias)
- [x] Dashboard Barbeiro (Estatísticas + Agendamentos)
- [x] Sistema de Agendamento
- [x] Lista de Agendamentos
- [x] Perfil do Usuário
- [x] Perfil da Barbearia

### Componentes UI
- [x] Cards responsivos
- [x] Formulários com validação
- [x] Calendário interativo
- [x] Mapa do Google Maps
- [x] Loading states
- [x] Mensagens de erro/sucesso
- [x] Menu lateral/navegação
- [x] Botões com feedback visual
- [x] Radio buttons personalizados
- [x] Dropdowns estilizados

### Interações
- [x] Hover effects
- [x] Animações de transição
- [x] Feedback visual em ações
- [x] Validação em tempo real
- [x] Estados de loading
- [x] Confirmações de ação

---

## 📊 Métricas de Sucesso

### Performance
- Tempo de carregamento < 3s
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

### Usabilidade
- Taxa de conclusão de agendamento > 80%
- Taxa de erro em formulários < 10%
- Tempo médio para criar agendamento < 2 minutos

### Acessibilidade
- Pontuação Lighthouse > 90
- Contraste mínimo 4.5:1
- Navegação por teclado completa

---

**Documento gerado com base no código implementado do BarberShop System**

*Última atualização: Dezembro 2025*

