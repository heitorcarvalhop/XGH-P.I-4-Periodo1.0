# Testes Iniciais do Projeto Barber Hub

## Objetivo

Este documento registra a primeira etapa de testes automatizados implementada no backend do projeto.

A finalidade desta suíte inicial é validar os fluxos centrais já existentes no sistema e criar uma base segura para evolução futura do código, reduzindo o risco de regressões durante novas implementações.

## Escopo desta etapa

Nesta fase, foram criados testes unitários para as principais regras de negócio do backend:

- autenticação de clientes e barbeiros
- cadastro de clientes
- cadastro de barbeiros
- criação e atualização de status de agendamentos
- cálculo de horários disponíveis

## Tecnologias utilizadas

- Java 21
- JUnit 5
- Mockito
- AssertJ
- Maven Wrapper

## Estratégia adotada

Os testes desta etapa foram implementados como testes unitários isolados, com uso de mocks para repositórios e dependências externas.

Essa abordagem foi escolhida para:

- validar rapidamente a lógica de negócio dos services
- evitar dependência de banco real nesta primeira fase
- permitir execução rápida e previsível da suíte
- facilitar manutenção e evolução da cobertura

## Arquivos de teste criados

- `XGH-P.I-4-Periodo1.0/api/api/src/test/java/br/com/barbershop/api/service/AuthServiceTest.java`
- `XGH-P.I-4-Periodo1.0/api/api/src/test/java/br/com/barbershop/api/service/ClientServiceTest.java`
- `XGH-P.I-4-Periodo1.0/api/api/src/test/java/br/com/barbershop/api/service/BarberServiceTest.java`
- `XGH-P.I-4-Periodo1.0/api/api/src/test/java/br/com/barbershop/api/service/AppointmentServiceTest.java`

## Casos de teste implementados

### 1. AuthServiceTest

Responsável por validar o comportamento do serviço de autenticação.

Casos cobertos:

- login com cliente existente deve retornar token, tipo `CLIENT` e dados básicos do cliente
- login com barbeiro existente deve retornar token, tipo `BARBER` e dados do barbeiro

Validações realizadas:

- chamada do `AuthenticationManager`
- geração de token com o tipo correto de usuário
- retorno consistente do objeto `AuthResponseDTO`

### 2. ClientServiceTest

Responsável por validar o cadastro de clientes.

Casos cobertos:

- cadastro de cliente com dados válidos
- tentativa de cadastro com email já existente

Validações realizadas:

- senha codificada antes de persistir
- criação correta do `Client`
- retorno do `ClientResponseDTO`
- bloqueio de duplicidade por email

### 3. BarberServiceTest

Responsável por validar o cadastro de barbeiros.

Casos cobertos:

- cadastro de barbeiro com dados válidos e barbearia existente
- tentativa de cadastro com CPF já existente

Validações realizadas:

- senha codificada antes de persistir
- vínculo correto entre barbeiro e barbearia
- retorno do `BarberResponseDTO`
- bloqueio de duplicidade por CPF

### 4. AppointmentServiceTest

Responsável por validar as principais regras de agendamento atualmente implementadas.

Casos cobertos:

- criação de agendamento com status inicial `PENDING`
- cálculo automático de horário final com base na duração do serviço
- reagendamento de agendamento
- cancelamento de agendamento
- confirmação de agendamento
- conclusão de agendamento
- geração de horários disponíveis ignorando horários já ocupados

Validações realizadas:

- composição correta do objeto `Appointment`
- cálculo de `startTime` e `endTime`
- atualização correta do status do agendamento
- remoção de slots ocupados na consulta de horários disponíveis

## Como executar os testes

Na pasta do backend:

```powershell
cd XGH-P.I-4-Periodo1.0\api\api
.\mvnw.cmd test
```

## Resultado da execução atual

Resultado validado na execução mais recente:

- `BUILD SUCCESS`
- `11` testes executados com sucesso
- `0` falhas
- `0` erros

## Limitações atuais

Esta suíte inicial ainda não cobre todos os cenários do sistema.

Ainda não foram implementados nesta etapa:

- testes de controller com `MockMvc`
- testes de integração com banco de dados
- testes de frontend
- testes end-to-end
- testes de segurança de endpoints protegidos
- teste de bloqueio de conflito de horário na criação de agendamentos

Observação importante:

O cenário de conflito de horário ainda não foi documentado como teste automatizado porque a implementação atual do `AppointmentService` ainda não possui essa regra de negócio.

## Finalidade deste documento

Este arquivo serve como registro técnico da evolução de qualidade do projeto.

Seu uso é recomendado para:

- controle de cobertura já implementada
- apoio em commits e histórico do projeto
- documentação acadêmica
- base para expansão do plano de testes
- alinhamento entre manutenção, refatoração e novas funcionalidades

## Próximos passos sugeridos

As próximas camadas recomendadas para evolução dos testes são:

1. testes unitários para conflito de horário em agendamentos
2. testes de controller com `MockMvc`
3. testes de autenticação e autorização com JWT
4. testes de integração com banco isolado
5. testes do frontend com React Testing Library
6. testes end-to-end dos fluxos principais
