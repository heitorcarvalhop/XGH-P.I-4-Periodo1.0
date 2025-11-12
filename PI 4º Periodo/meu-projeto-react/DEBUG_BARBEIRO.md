# 🔍 Debug - Página do Barbeiro não aparece

## Problema
Você está logado como barbeiro mas ainda vê a página do cliente.

---

## ✅ Solução Rápida

### Opção 1: Forçar userType manualmente

1. **Abra o Console (F12)**
2. **Cole e execute:**

```javascript
// Ver dados atuais
console.log('Dados atuais:', JSON.parse(localStorage.getItem('user')));

// Forçar userType como barber
const user = JSON.parse(localStorage.getItem('user'));
user.userType = 'barber';
localStorage.setItem('user', JSON.stringify(user));

// Recarregar página
location.reload();
```

---

### Opção 2: Limpar e fazer login novamente

1. **Console (F12):**

```javascript
localStorage.clear();
location.reload();
```

2. **Faça login novamente** com suas credenciais de barbeiro

---

## 🔍 Como Verificar se está Correto

No console, você deve ver:

```javascript
// Dados corretos de barbeiro:
{
  id: 1,
  name: "Seu Nome",
  email: "barbeiro@email.com",
  userType: "barber",  // ← IMPORTANTE!
  barbershopId: 1
}
```

---

## ⚙️ Como o Sistema Decide qual Página Mostrar

O código no `App.js` verifica:

```javascript
const isBarber = user.userType === 'barber' || user.userType === 'BARBER';

if (isBarber) {
  return <BarberHomePage />  // ← Página com Dashboard
} else {
  return <HomePage />        // ← Página com Mapa
}
```

**Se `userType` não for "barber" ou "BARBER", mostra a página do cliente!**

---

## 🚨 Causas Comuns

### 1. **userType está como "client"**
```javascript
// ERRADO:
{ userType: "client" }

// CORRETO:
{ userType: "barber" }
```

### 2. **userType não existe**
```javascript
// ERRADO:
{ name: "João", email: "..." }

// CORRETO:
{ name: "João", email: "...", userType: "barber" }
```

### 3. **Usuário antigo no cache**
Dados salvos antes das mudanças podem não ter userType correto.

---

## 🛠️ Soluções Detalhadas

### Solução 1: Adicionar userType manualmente

```javascript
// 1. Pegar usuário atual
const user = JSON.parse(localStorage.getItem('user'));

// 2. Adicionar userType
user.userType = 'barber';

// 3. Adicionar barbershopId (se não tiver)
user.barbershopId = 1; // ou ID da sua barbearia

// 4. Salvar
localStorage.setItem('user', JSON.stringify(user));

// 5. Recarregar
location.reload();
```

---

### Solução 2: Backend retornar userType correto

O endpoint de login deve retornar:

```json
{
  "token": "jwt-token-aqui",
  "userType": "barber",  // ← Backend deve retornar isso
  "userData": {
    "id": 1,
    "name": "Nome do Barbeiro",
    "email": "barbeiro@email.com",
    "userType": "barber",  // ← E aqui também
    "barbershopId": 1
  }
}
```

---

## ✅ Checklist de Verificação

Marque cada item quando verificar:

- [ ] **userType** está definido?
- [ ] **userType** = "barber" ou "BARBER"?
- [ ] **barbershopId** está presente?
- [ ] **Console não mostra erros** do React?
- [ ] **Fez logout e login novamente?**
- [ ] **Limpou o cache do navegador?**

---

## 🎯 Teste Final

Depois de aplicar a solução, você deve ver:

✅ **Sidebar com:**
- Dashboard (📊)
- Agendamentos (📅)
- Barbeiros (👥)
- Perfil (👤)

✅ **Dashboard com 4 cards:**
- Lucro Total (Mês)
- Lucro Médio Diário
- Média de Clientes/Dia
- Agendamentos Hoje

✅ **Seções:**
- Horários Disponíveis Hoje
- Barbeiros Cadastrados

❌ **NÃO deve aparecer:**
- Mapa de barbearias
- Filtros de distância/preço
- Lista de barbearias próximas

---

## 🔧 Script Completo de Debug

Cole isso no console para ver tudo:

```javascript
console.log('=== DEBUG BARBEIRO ===');
console.log('1. Usuário:', JSON.parse(localStorage.getItem('user')));
console.log('2. Token:', localStorage.getItem('authToken'));
console.log('3. UserType:', localStorage.getItem('userType'));

const user = JSON.parse(localStorage.getItem('user'));
if (user) {
  console.log('4. É Barbeiro?', user.userType === 'barber' || user.userType === 'BARBER');
  console.log('5. Tem barbershopId?', !!user.barbershopId);
} else {
  console.log('4. ERRO: Usuário não encontrado!');
}
console.log('===================');
```

---

## 📞 Se ainda não funcionar

Me envie a saída do script de debug acima e vou te ajudar a resolver! 🚀


