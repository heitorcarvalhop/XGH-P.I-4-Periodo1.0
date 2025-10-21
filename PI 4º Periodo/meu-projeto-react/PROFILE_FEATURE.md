# 👤 Funcionalidade de Perfil

## ✨ Visão Geral

A página de Perfil permite que os usuários visualizem e editem suas informações pessoais, alterem senha e gerenciem sua conta.

## 🎯 Funcionalidades Implementadas

### 1. **Visualização de Perfil**
- ✅ Avatar com iniciais do usuário
- ✅ Nome, email e tipo de usuário
- ✅ Informações pessoais organizadas
- ✅ Estatísticas do usuário (membro desde, etc)
- ✅ Design moderno e responsivo

### 2. **Edição de Perfil**
- ✅ Modo de edição com validações
- ✅ Campos editáveis:
  - Nome completo
  - Email
  - Telefone (com máscara)
  - CPF (com máscara - apenas barbeiros)
  - Data de nascimento (apenas barbeiros)
- ✅ Validação em tempo real
- ✅ Salvamento via API

### 3. **Alterar Senha**
- ✅ Seção exclusiva no modo de edição
- ✅ Campos:
  - Senha atual (obrigatória)
  - Nova senha (mínimo 6 caracteres)
  - Confirmar nova senha
- ✅ Validação de correspondência
- ✅ Opcional (pode salvar sem alterar senha)

### 4. **Gerenciamento de Conta**
- ✅ Botão de logout
- ✅ Zona de perigo claramente identificada
- ✅ Feedback visual para todas as ações

## 📊 Interface do Usuário

### Layout Principal

```
┌─────────────────────────────────────────┐
│  [Avatar] Nome do Usuário     [Editar] │
│           Cliente/Barbeiro              │
│           email@exemplo.com             │
├─────────────────────────────────────────┤
│  👤 Informações Pessoais                │
│  ┌────────────┐  ┌────────────┐        │
│  │ Nome       │  │ Email      │        │
│  └────────────┘  └────────────┘        │
│  ┌────────────┐  ┌────────────┐        │
│  │ Telefone   │  │ CPF        │        │
│  └────────────┘  └────────────┘        │
├─────────────────────────────────────────┤
│  ⚠️ Zona de Perigo                      │
│  [🚪 Sair da Conta]                     │
├─────────────────────────────────────────┤
│  📊 Estatísticas                        │
│  [Membro desde] [Agendamentos] [Nota]  │
└─────────────────────────────────────────┘
```

### Modo de Edição

```
┌─────────────────────────────────────────┐
│  [Avatar] Nome do Usuário               │
│           Cliente/Barbeiro              │
├─────────────────────────────────────────┤
│  👤 Informações Pessoais                │
│  [Input: Nome]    [Input: Email]       │
│  [Input: Telefone] [Input: CPF]        │
├─────────────────────────────────────────┤
│  🔒 Alterar Senha (opcional)            │
│  [Input: Senha Atual]                   │
│  [Input: Nova Senha]                    │
│  [Input: Confirmar Senha]               │
├─────────────────────────────────────────┤
│           [Cancelar] [Salvar]           │
└─────────────────────────────────────────┘
```

## 🎨 Componentes Visuais

### 1. Header do Perfil
- Avatar circular grande (100x100px)
- Gradiente dourado (#d4af37)
- Iniciais do usuário em destaque
- Badge de tipo de usuário
- Botão "Editar Perfil"

### 2. Seções
- **Informações Pessoais**: Dados do usuário
- **Alterar Senha**: (Apenas em modo de edição)
- **Zona de Perigo**: Ações críticas
- **Estatísticas**: Métricas do usuário

### 3. Alertas
- **Sucesso** (Verde): Perfil atualizado
- **Erro** (Vermelho): Validação ou erro de API
- Animação de slide-down
- Botão de fechar (×)

## 🔄 Fluxo de Dados

### Visualização

```javascript
// 1. Carregar dados do usuário
useEffect(() => {
  if (user) {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      birthDate: user.birthDate
    });
  }
}, [user]);
```

### Edição

```javascript
// 1. Usuário clica em "Editar Perfil"
setIsEditing(true);

// 2. Preenche formulário
handleChange(e) {
  setFormData({ ...formData, [name]: value });
}

// 3. Clica em "Salvar"
const handleSave = async () => {
  // Validações
  if (!formData.name.trim()) return;
  
  // Chama API
  const updated = await userService.updateUser(user.id, formData);
  
  // Atualiza contexto
  onUpdateUser(updated);
  
  // Feedback
  setSuccess('Perfil atualizado!');
  setIsEditing(false);
};
```

### Alterar Senha

```javascript
// Apenas se houver nova senha
if (formData.newPassword) {
  // Validações
  if (!formData.currentPassword) return;
  if (formData.newPassword !== formData.confirmPassword) return;
  
  updateData.currentPassword = formData.currentPassword;
  updateData.newPassword = formData.newPassword;
}
```

## 🔗 Integração com Backend

### Endpoint

```
PUT /api/users/:id
Authorization: Bearer {token}
```

### Request Body

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

### Response (200 OK)

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

## ✅ Validações

### Nome
- ✅ Não pode estar vazio
- ✅ Texto obrigatório

### Email
- ✅ Não pode estar vazio
- ✅ Formato de email válido (no backend)

### Telefone
- ✅ Máscara: (00) 00000-0000
- ✅ Auto-formatação ao digitar
- ✅ Máximo 15 caracteres

### CPF (Apenas Barbeiros)
- ✅ Máscara: 000.000.000-00
- ✅ Auto-formatação ao digitar
- ✅ Máximo 14 caracteres
- ✅ Validação no backend

### Senha
- ✅ Senha atual obrigatória para alterar
- ✅ Nova senha: mínimo 6 caracteres
- ✅ Confirmação deve coincidir
- ✅ Campos limpos após salvamento

## 📱 Responsividade

### Desktop (> 768px)
- Grid de 2 colunas para formulário
- Header horizontal
- Estatísticas em linha

### Tablet (768px - 480px)
- Grid de 1 coluna
- Header flexível
- Botões adaptados

### Mobile (< 480px)
- Layout empilhado
- Avatar menor (80px)
- Botões em largura completa
- Fontes reduzidas

## 🎯 Diferenças entre Tipos de Usuário

### Cliente
```javascript
Campos disponíveis:
- Nome
- Email
- Telefone
- Senha
```

### Barbeiro
```javascript
Campos disponíveis:
- Nome
- Email
- Telefone
- CPF
- Data de Nascimento
- Senha
```

## 🔒 Segurança

### Autenticação
- Token JWT em todas as requisições
- Validação de propriedade (usuário só edita próprio perfil)

### Senha
- Nunca exibida em texto plano
- Alteração requer senha atual
- Validação de força (mínimo 6 caracteres)
- Confirmação obrigatória

### Dados Sensíveis
- CPF com máscara
- Email validado
- Telefone formatado

## 💡 Funcionalidades Especiais

### 1. Máscaras de Input

```javascript
// CPF: 000.000.000-00
const formatCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Telefone: (00) 00000-0000
const formatPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};
```

### 2. Iniciais do Avatar

```javascript
const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
```

### 3. Feedback Temporizado

```javascript
setSuccess('Perfil atualizado!');
setTimeout(() => setSuccess(null), 3000); // Remove após 3s
```

## 🐛 Tratamento de Erros

### Erros de Validação
```javascript
if (!formData.name.trim()) {
  setError('Nome é obrigatório');
  return;
}

if (formData.newPassword !== formData.confirmPassword) {
  setError('As senhas não coincidem');
  return;
}
```

### Erros de API
```javascript
try {
  await userService.updateUser(user.id, updateData);
} catch (error) {
  setError(error.message || 'Erro ao atualizar perfil');
}
```

## 📊 Estatísticas do Usuário

### Implementadas
- 📅 Membro desde
- ✂️ Total de agendamentos (placeholder)
- ⭐ Avaliação média (placeholder)

### Futuras
- Últimas barbearias visitadas
- Serviços mais agendados
- Histórico de pagamentos
- Cupons e promoções

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Upload de foto de perfil
- [ ] Crop/resize de imagem
- [ ] Notificações de email
- [ ] Histórico de alterações

### Médio Prazo
- [ ] Autenticação de dois fatores (2FA)
- [ ] Login social (Google, Facebook)
- [ ] Preferências de notificação
- [ ] Temas personalizados

### Longo Prazo
- [ ] Integração com redes sociais
- [ ] Carteira digital
- [ ] Programa de fidelidade
- [ ] Gamificação

## 🎨 Personalização

### Cores
```css
--primary-color: #d4af37;
--primary-hover: #c49d2e;
--danger-color: #f44336;
--success-color: #4CAF50;
--background: #1a1a1a;
```

### Avatar
```css
.profile-avatar-large {
  background: linear-gradient(135deg, #d4af37 0%, #c49d2e 100%);
  border: 4px solid rgba(212, 175, 55, 0.5);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
}
```

## 📝 Exemplo de Uso

```javascript
<Profile 
  user={currentUser}
  onUpdateUser={(updatedUser) => {
    // Atualizar no localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Atualizar estado global
    setUser(updatedUser);
  }}
  onLogout={() => {
    // Limpar dados e redirecionar
    authService.logout();
    navigate('/login');
  }}
/>
```

## ✅ Checklist de Funcionalidades

- [x] Visualizar perfil
- [x] Editar informações pessoais
- [x] Alterar senha
- [x] Validações de formulário
- [x] Máscaras de input (CPF, telefone)
- [x] Feedback de sucesso/erro
- [x] Logout
- [x] Responsividade
- [x] Integração com API
- [ ] Upload de foto
- [ ] Estatísticas reais
- [ ] Histórico de atividades

---

**Status:** ✅ Implementado e Funcionando
**Data:** Outubro 2025
**Próximo:** Integrar com backend real e adicionar upload de foto

