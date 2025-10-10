# Sistema de Login e Cadastro - BarberShop

Sistema completo de autenticação para barbearia desenvolvido em React.js com integração para API REST Spring Boot.

## 🚀 Funcionalidades

### ✅ Página de Login
- Validação de email e senha
- Integração com API Spring Boot
- Estados de loading e tratamento de erros
- Design responsivo e moderno

### ✅ Página de Cadastro
- Campos: email, senha, CPF, nome completo, apelido, telefone e cidade
- Validação em tempo real
- Máscaras automáticas para CPF e telefone
- Validação de CPF com algoritmo completo
- Integração com API Spring Boot

### ✅ Recursos Avançados
- Autenticação com JWT
- Persistência de sessão
- Tratamento de erros da API
- Estados de loading
- Design responsivo
- Validação de formulários

## 🛠️ Tecnologias Utilizadas

- **React 19.2.0** - Biblioteca principal
- **Axios 1.6.0** - Cliente HTTP
- **CSS3** - Estilização com Flexbox e Grid
- **JavaScript ES6+** - Programação moderna

## 📁 Estrutura do Projeto

```
meu-projeto-react/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Login.js          # Componente de login
│   │   ├── Login.css         # Estilos do login
│   │   ├── Register.js       # Componente de cadastro
│   │   └── Register.css      # Estilos do cadastro
│   ├── services/
│   │   └── api.js            # Serviços de API
│   ├── config/
│   │   └── apiConfig.js      # Configurações da API
│   ├── App.js                # Componente principal
│   ├── App.css               # Estilos globais
│   └── index.js              # Ponto de entrada
├── API_DOCUMENTATION.md      # Documentação da API
└── README.md                 # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Spring Boot API rodando na porta 8080

### Instalação e Execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar API (opcional):**
   ```bash
   # Copiar arquivo de exemplo
   cp env.example .env.local
   
   # Ou criar manualmente o arquivo .env.local
   echo "REACT_APP_API_URL=http://localhost:8080/api" > .env.local
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

4. **Acessar a aplicação:**
   ```
   http://localhost:3000
   ```

### ⚠️ Solução de Problemas

**Erro: "Module not found: Error: Can't resolve 'axios'"**

Se você encontrar este erro, execute:

```bash
# Instalar axios manualmente
npm install axios

# Ou reinstalar todas as dependências
rm -rf node_modules package-lock.json
npm install
```

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm test` - Executa os testes
- `npm run eject` - Remove o Create React App (não recomendado)

## 🔌 Integração com Spring Boot

### Endpoints Necessários

A aplicação se conecta aos seguintes endpoints:

#### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário

#### Usuários
- `POST /api/users/register` - Cadastro de usuário
- `GET /api/users/{id}` - Buscar usuário por ID
- `PUT /api/users/{id}` - Atualizar usuário
- `DELETE /api/users/{id}` - Deletar usuário

#### Validação
- `POST /api/validation/cpf` - Validar CPF
- `POST /api/validation/email` - Validar email

### Configuração da API

Por padrão, a aplicação se conecta a `http://localhost:8080/api`. Para alterar:

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione: `REACT_APP_API_URL=http://seu-servidor:porta/api`

### Documentação Completa

Consulte o arquivo `API_DOCUMENTATION.md` para:
- Especificação completa dos endpoints
- Exemplos de request/response
- Códigos de implementação Spring Boot
- Configurações de segurança e CORS

## 🎨 Design e UX

### Características Visuais
- **Gradiente moderno** (azul/roxo)
- **Animações suaves** (slideUp, hover effects)
- **Formulários responsivos** (grid adaptativo)
- **Validação visual** (campos com erro destacados)
- **Estados de loading** (spinner animado)

### Responsividade
- **Desktop**: Layout em grid 2 colunas
- **Tablet**: Layout adaptativo
- **Mobile**: Layout em coluna única

## 🔒 Segurança

### Recursos de Segurança
- **Validação client-side** e server-side
- **Autenticação JWT** com interceptors
- **Sanitização de dados** de entrada
- **Tratamento de erros** robusto
- **Timeout de requisições** (10s)

### Validações Implementadas
- **Email**: Formato válido e obrigatório
- **Senha**: Mínimo 6 caracteres
- **CPF**: Algoritmo completo de validação
- **Telefone**: Máscara automática
- **Nome**: Mínimo 2 palavras

## 🚀 Deploy

### Build para Produção
```bash
npm run build
```

### Variáveis de Ambiente
```bash
# Produção
REACT_APP_API_URL=https://sua-api.com/api
REACT_APP_ENV=production
```

## 📝 Próximos Passos

1. **Implementar backend Spring Boot** usando a documentação fornecida
2. **Configurar banco de dados** (MySQL/PostgreSQL)
3. **Implementar autenticação JWT** no backend
4. **Adicionar testes unitários** e de integração
5. **Configurar CI/CD** para deploy automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para o BarberShop**