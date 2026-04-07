# Guia de Ambiente Local

## Objetivo

Este guia define o padrao de configuracao local do projeto para evitar o problema de funcionar em uma maquina e falhar em outra.

## Regra do time

Todo o time deve usar o mesmo padrao local para banco e backend.

Padrao oficial:

- Banco: PostgreSQL via Docker
- Host: `localhost`
- Porta: `5432`
- Database: `barbershop_db`
- Usuario: `postgres`
- Senha: `123`
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

## Backend

O backend agora aceita variaveis de ambiente com valores padrao.

Variaveis suportadas:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`

Se nenhuma variavel for informada, o backend usa os valores oficiais do projeto.

Arquivo de exemplo:

- `api/api/.env.example`

## Banco com Docker

Na pasta `api/api`, execute:

```powershell
docker compose up -d
```

Para verificar:

```powershell
docker compose ps
```

## Subir o backend

Na pasta `api/api`, execute:

```powershell
.\mvnw.cmd spring-boot:run
```

## Frontend

O frontend deve usar como URL base:

```env
REACT_APP_API_URL=http://localhost:8080
```

Importante:

- nao usar `/api` no final da URL base
- os endpoints ja adicionam esse prefixo no codigo

## Fluxo recomendado antes de apresentacao

1. Subir o banco com Docker.
2. Subir o backend.
3. Subir o frontend.
4. Testar login.
5. Testar cadastro.
6. Testar listagem de barbearias.
7. Testar agendamento.

## O que evitar

- mudar credenciais do banco direto no projeto sem alinhar com o time
- usar ngrok como fluxo padrao
- deixar cada integrante com um usuario/senha diferente
- alterar a URL da API de forma inconsistente entre backend, frontend e documentacao

## Boa pratica do time

Se alguem precisar usar outro banco ou outra porta localmente, deve fazer isso por variaveis de ambiente e nao alterando o padrao oficial do projeto.
