# 🪒 BarberShop System

> Sistema completo de agendamento para barbearias desenvolvido em React.js + Spring Boot

[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node-14%2B-green)](https://nodejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen)](https://spring.io/projects/spring-boot)

---

## 📋 Sobre o Projeto

Sistema web para gerenciamento de barbearias com funcionalidades completas de:

- 🔐 **Autenticação** de Clientes e Barbeiros
- 🏪 **Busca de barbearias** com filtros e geolocalização
- 📅 **Agendamentos** online com confirmação
- 👤 **Perfil** de usuário e barbearia
- ⭐ **Sistema de avaliações**
- 🗺️ **Integração com Google Maps**

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 14+
- npm ou yarn
- Backend Spring Boot rodando em `http://localhost:8080`

### Instalação

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd meu-projeto-react

# 2. Instalar dependências
npm install

# 3. Configurar URL da API (opcional)
# Crie um arquivo .env na raiz:
echo "REACT_APP_API_URL=http://localhost:8080" > .env

# 4. Iniciar o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
meu-projeto-react/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Login.js         # Tela de login
│   │   ├── Register.js      # Cadastro
│   │   ├── HomePage.js      # Página inicial (cliente)
│   │   ├── BarberHomePage.js # Dashboard do barbeiro
│   │   ├── Appointments.js  # Gerenciar agendamentos
│   │   └── ...
│   ├── services/
│   │   └── api.js           # Serviços de API
│   └── config/
│       └── apiConfig.js     # Configurações
├── public/                  # Arquivos públicos
├── API_DOCUMENTATION.md     # Documentação completa da API
├── DOCUMENTACAO.md          # Documentação do projeto ⭐
└── README.md                # Este arquivo
```

---

## 📚 Documentação

### 📖 Documentação Completa
Consulte **[DOCUMENTACAO.md](./DOCUMENTACAO.md)** para:
- ✅ Endpoints da API detalhados
- ✅ Estrutura de dados
- ✅ Configuração do Backend (Spring Security, CORS)
- ✅ Guia de troubleshooting
- ✅ Checklist de deploy

### 📖 Documentação da API Backend
Consulte **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** para:
- ✅ Especificações completas dos endpoints
- ✅ Exemplos de request/response
- ✅ Códigos de implementação Spring Boot

---

## 🛠️ Tecnologias

### Frontend
- **React 19.2.0** - Biblioteca principal
- **Axios 1.6.0** - Cliente HTTP
- **Google Maps API** - Mapas e geolocalização
- **Lucide React** - Ícones modernos

### Backend (Esperado)
- **Spring Boot 3.x** - Framework Java
- **Spring Security** - Autenticação JWT
- **MySQL/PostgreSQL** - Banco de dados

---

## 🎯 Funcionalidades Principais

### Para Clientes 👥
- ✅ Cadastro e login
- ✅ Buscar barbearias próximas
- ✅ Ver detalhes, serviços e preços
- ✅ Fazer agendamentos
- ✅ Cancelar/Reagendar
- ✅ Visualizar histórico

### Para Barbeiros ✂️
- ✅ Cadastro e login
- ✅ Dashboard com estatísticas
- ✅ Visualizar barbearia associada
- ✅ Gerenciar agendamentos
- ✅ Confirmar/Concluir atendimentos

---

## 📝 Scripts Disponíveis

```bash
npm start           # Inicia servidor de desenvolvimento
npm run build       # Build para produção
npm test            # Executa testes
```

---

## 🔧 Configuração do Backend

### Endpoints Públicos (Spring Security)

Configure estes endpoints como públicos no seu `SecurityConfig.java`:

```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/clients/register").permitAll()
.requestMatchers("/barbers/register").permitAll()
.requestMatchers(HttpMethod.GET, "/api/barbershops").permitAll()
.requestMatchers(HttpMethod.GET, "/api/barbers/**").permitAll()
```

### CORS

Adicione configuração de CORS:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .maxAge(3600);
            }
        };
    }
}
```

**⚠️ Consulte [DOCUMENTACAO.md](./DOCUMENTACAO.md) para configuração completa!**

---

## 🚨 Troubleshooting

| Problema | Solução |
|----------|---------|
| Backend não responde | Verifique se está rodando na porta 8080 |
| Erro 403 (Forbidden) | Configure endpoints como públicos no Spring Security |
| Erro CORS | Adicione `CorsConfig.java` no backend |
| Barbearias não carregam | Endpoint `/api/barbershops` deve ser público |

**Para mais detalhes, consulte [DOCUMENTACAO.md](./DOCUMENTACAO.md#troubleshooting)**

---

## 📞 Suporte

- 📚 [Documentação Completa](./DOCUMENTACAO.md)
- 📖 [Documentação da API](./API_DOCUMENTATION.md)
- 🐛 Verifique os logs do console (F12)
- 🔍 Consulte os logs do Spring Boot

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para BarberShop System**

*Última atualização: Dezembro 2025*
