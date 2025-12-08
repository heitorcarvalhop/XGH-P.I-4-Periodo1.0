# 📚 Documentação Completa - BarberShop System

> Sistema completo de agendamento para barbearias com React.js + Spring Boot

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Configuração e Instalação](#configuração-e-instalação)
5. [Endpoints da API](#endpoints-da-api)
6. [Funcionalidades](#funcionalidades)
7. [Configurações Importantes](#configurações-importantes)

---

## 🎯 Visão Geral

Sistema completo para gerenciamento de barbearias com:
- **Autenticação** de Clientes e Barbeiros
- **Listagem e busca** de barbearias
- **Agendamentos** com confirmação
- **Perfil** de usuário e barbearia
- **Sistema de avaliações**

---

## 🛠️ Tecnologias

### Frontend
- **React 19.2.0**
- **Axios 1.6.0** (Cliente HTTP)
- **Google Maps API** (Mapas e geolocalização)
- **Lucide React** (Ícones)

### Backend (Esperado)
- **Spring Boot 3.x**
- **Spring Security** (JWT)
- **MySQL/PostgreSQL**

---

## 📁 Estrutura do Projeto

```
meu-projeto-react/
├── public/
│   ├── index.html
│   └── env-config.js
├── src/
│   ├── components/
│   │   ├── Login.js              # Tela de login
│   │   ├── Register.js           # Cadastro de cliente/barbeiro
│   │   ├── HomePage.js           # Página inicial (cliente)
│   │   ├── BarberHomePage.js     # Dashboard do barbeiro
│   │   ├── Appointments.js       # Gerenciar agendamentos
│   │   ├── Profile.js            # Perfil do usuário
│   │   ├── BarberDetails.js      # Detalhes da barbearia
│   │   └── SimpleMap.js          # Mapa com localização
│   ├── services/
│   │   └── api.js                # Serviços de API centralizados
│   ├── config/
│   │   └── apiConfig.js          # Configurações da API
│   └── images/                   # Imagens do projeto
└── DOCUMENTACAO.md               # Este arquivo
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js 14+ 
- npm ou yarn
- Backend Spring Boot rodando em `http://localhost:8080`

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar URL da API (opcional)
# Crie um arquivo .env na raiz:
echo "REACT_APP_API_URL=http://localhost:8080" > .env

# 3. Iniciar o servidor de desenvolvimento
npm start

# Acessar em: http://localhost:3000
```

### Scripts Disponíveis

```bash
npm start           # Servidor de desenvolvimento
npm run build       # Build para produção
npm test            # Executar testes
```

---

## 🔌 Endpoints da API

### Base URL
```
http://localhost:8080
```

### 🔐 Autenticação

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "CLIENT" | "BARBER",
  "userData": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "usuario@email.com"
  }
}
```

#### 2. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### 👤 Cadastro (Públicos)

#### 3. Cadastro de Cliente
```http
POST /clients/register
Content-Type: application/json

{
  "name": "Nome Completo",
  "email": "cliente@email.com",
  "password": "senha123"
}
```

#### 4. Cadastro de Barbeiro
```http
POST /barbers/register
Content-Type: application/json

{
  "name": "Nome Completo",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-15",
  "phone": "(62) 98888-7777",
  "email": "barbeiro@email.com",
  "password": "senha123",
  "barbershopId": 1
}
```

---

### 🏪 Barbearias

#### 5. Listar Todas as Barbearias (PÚBLICO)
```http
GET /api/barbershops
Authorization: Bearer {token} (opcional)
```

**Resposta:**
```json
{
  "barbershops": [
    {
      "id": 1,
      "name": "Navalha de Ouro",
      "rating": 4.8,
      "reviews": 152,
      "price": 50.00,
      "address": "Av. T-63, 1234 - Setor Bueno, Goiânia - GO",
      "cep": "74000-000",
      "phone": "(62) 3333-4444",
      "openingHours": "09:00-18:00",
      "latitude": -16.671054,
      "longitude": -49.238815,
      "services": ["Corte", "Barba"],
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

#### 6. Buscar Barbearia por ID (PÚBLICO)
```http
GET /api/barbershops/{id}
```

#### 7. Buscar Dados do Barbeiro (PÚBLICO)
```http
GET /api/barbers/{id}
```

**Resposta:**
```json
{
  "id": 1,
  "name": "Carlos Barbeiro",
  "email": "carlos@email.com",
  "barbershopId": 1,
  "barbershopName": "Navalha de Ouro",
  "barbershopAddress": "Av. T-63, 1234",
  "barbershopPhone": "(62) 3333-4444",
  "cpf": "123.456.789-00",
  "birthDate": "1990-05-15",
  "phone": "(62) 98888-7777"
}
```

---

### 📅 Agendamentos

#### 8. Listar Agendamentos do Cliente
```http
GET /api/appointments/client/{clientId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "appointments": [
    {
      "id": 1,
      "barbershopName": "Navalha de Ouro",
      "barbershopAddress": "Av. T-63, 1234",
      "service": "Corte + Barba",
      "date": "2025-10-25",
      "time": "14:30",
      "duration": 45,
      "price": 50.00,
      "status": "confirmed",
      "barberName": "João Silva",
      "barbershopPhone": "(62) 3333-4444"
    }
  ]
}
```

#### 9. Criar Novo Agendamento
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": 1,
  "barbershopId": 1,
  "barberId": 1,
  "serviceId": 1,
  "date": "2025-12-25",
  "time": "14:30"
}
```

#### 10. Cancelar Agendamento
```http
PUT /api/appointments/{id}/cancel
Authorization: Bearer {token}
```

#### 11. Reagendar Agendamento
```http
PUT /api/appointments/{id}/reschedule
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2025-12-26",
  "time": "15:00"
}
```

#### 12. Buscar Horários Disponíveis
```http
GET /api/appointments/available-slots?barbershopId=1&date=2025-12-25
```

---

## 🎯 Funcionalidades

### Para Clientes
- ✅ Cadastro e Login
- ✅ Buscar barbearias próximas
- ✅ Ver detalhes e avaliações
- ✅ Visualizar serviços e preços
- ✅ Gerenciar agendamentos
- ✅ Cancelar/Reagendar
- ✅ Visualizar histórico

### Para Barbeiros
- ✅ Cadastro e Login
- ✅ Dashboard com estatísticas
- ✅ Visualizar barbearia associada
- ✅ Gerenciar agendamentos
- ✅ Confirmar/Concluir atendimentos

---

## ⚙️ Configurações Importantes

### 🔧 Backend - Spring Security

**Arquivo: `SecurityConfig.java`**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .authorizeHttpRequests(auth -> auth
                // Endpoints PÚBLICOS (sem autenticação)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/clients/register").permitAll()
                .requestMatchers("/barbers/register").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/barbershops").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/barbershops/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/barbers/**").permitAll()
                
                // Endpoints PROTEGIDOS (requerem token)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 🌐 Backend - CORS

**Arquivo: `CorsConfig.java`**

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(false)
                    .maxAge(3600);
            }
        };
    }
}
```

---

## 📊 Estrutura de Dados

### Barbearia
```json
{
  "id": 1,
  "name": "string",
  "rating": "number (0-5)",
  "reviews": "number",
  "price": "number",
  "address": "string",
  "cep": "string (00000-000)",
  "phone": "string ((00) 00000-0000)",
  "openingHours": "string",
  "latitude": "number",
  "longitude": "number",
  "services": ["string"],
  "image": "string (URL)"
}
```

### Agendamento
```json
{
  "id": 1,
  "clientId": "number",
  "barbershopId": "number",
  "barberId": "number",
  "serviceId": "number",
  "date": "string (YYYY-MM-DD)",
  "time": "string (HH:mm)",
  "duration": "number (minutos)",
  "price": "number",
  "status": "pending | confirmed | completed | cancelled"
}
```

---

## 🚨 Troubleshooting

### Problema: Backend não responde
**Solução:**
1. Verifique se o backend está rodando na porta 8080
2. Teste diretamente: `http://localhost:8080/api/barbershops`
3. Verifique os logs do Spring Boot

### Problema: Erro 403 (Forbidden)
**Solução:**
- Configure os endpoints como públicos no `SecurityConfig.java`

### Problema: Erro CORS
**Solução:**
- Adicione `CorsConfig.java` no backend
- Adicione `.cors().and()` no `SecurityConfig.java`

### Problema: Barbearias não carregam no cadastro
**Solução:**
- Endpoint `/api/barbershops` deve ser PÚBLICO
- Backend deve retornar formato: `{ "barbershops": [...] }`

---

## 📝 Checklist de Deploy

### Frontend
- [ ] Configurar `REACT_APP_API_URL` para produção
- [ ] Executar `npm run build`
- [ ] Testar build localmente
- [ ] Deploy para servidor (Netlify, Vercel, etc)

### Backend
- [ ] Configurar CORS para domínio de produção
- [ ] Configurar Spring Security
- [ ] Testar todos os endpoints
- [ ] Configurar banco de dados
- [ ] Deploy para servidor (Heroku, AWS, etc)

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do console (F12)
2. Consulte esta documentação
3. Verifique os logs do Spring Boot

---

**Desenvolvido com ❤️ para BarberShop System**

*Última atualização: Dezembro 2025*

