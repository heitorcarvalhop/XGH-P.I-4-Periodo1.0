# BarberShop

Sistema web de gestao e agendamento para barbearias.

## Estrutura

- `src/`: frontend React;
- `../../api/api/`: API Spring Boot;
- `../../api/api/docker-compose.yml`: PostgreSQL local.

## Requisitos

- Node.js e npm;
- Java 21 ou superior;
- Maven;
- Docker Desktop.

## Banco de dados

Na pasta `api/api`:

```powershell
docker compose up -d
```

O banco local usa as configuracoes de `api/api/.env.example` como referencia.

## Backend

Na pasta `api/api`:

```powershell
mvn.cmd spring-boot:run
```

A API fica disponivel em `http://localhost:8080`.

## Frontend

Nesta pasta:

```powershell
npm.cmd install
npm.cmd start
```

A interface fica disponivel em `http://localhost:3000`.

Para gerar o build de producao:

```powershell
npm.cmd run build
```

## Configuracao

Use `env.example` como referencia para configurar a URL da API.

O mapa usa Leaflet com tiles do OpenStreetMap e nao exige chave de API.
Mantenha visivel a atribuicao exibida automaticamente no canto do mapa.

## Testes

Frontend:

```powershell
npm.cmd test
```

Backend:

```powershell
mvn.cmd test
```
