# Guia de Branches e Commits do Projeto

## Objetivo

Este guia define como o time deve trabalhar no projeto a partir de agora para evitar conflitos, sobrescrita de código, bagunça na branch principal e dificuldades futuras de manutenção.

## Regra principal

A branch `main` deve ser tratada como a versão estável do projeto.

Isso significa que:

- ninguém deve desenvolver diretamente na `main`
- toda nova tarefa deve começar em uma branch separada
- só depois de revisar e testar a alteração ela pode entrar na `main`

## Como vamos trabalhar

O fluxo padrão do time será:

1. atualizar a branch `main`
2. criar uma nova branch a partir da `main`
3. desenvolver a tarefa nessa branch
4. fazer commits pequenos e organizados
5. enviar a branch para o GitHub
6. revisar o que foi feito
7. integrar na `main`

## Padrão de nomes para branches

Para manter organização, as branches devem seguir nomes simples e descritivos:

- `feat/nome-da-funcionalidade`
- `fix/nome-do-problema`
- `test/nome-do-teste`
- `docs/nome-da-documentacao`
- `refactor/nome-do-ajuste`

### Exemplos

- `feat/login-backend`
- `feat/agendamento-frontend`
- `fix/cadastro-cliente`
- `test/testes-auth`
- `docs/guia-de-branches`

## Fluxo de comandos recomendado

### 1. Atualizar a `main`

```powershell
git checkout main
git pull
```

### 2. Criar uma nova branch

```powershell
git checkout -b feat/nome-da-tarefa
```

### 3. Trabalhar normalmente nessa branch

Faça as alterações da tarefa e gere commits pequenos.

### 4. Enviar a branch para o GitHub

```powershell
git push -u origin feat/nome-da-tarefa
```

## Regras de commit

Os commits devem ser:

- em português brasileiro
- pequenos
- focados em uma única mudança lógica
- claros o suficiente para qualquer integrante entender

### Padrões recomendados

- `feat: adiciona validacao de conflito de horario`
- `fix: corrige erro no cadastro de cliente`
- `teste: adiciona testes do servico de autenticacao`
- `documentacao: atualiza guia de branches`
- `refatoracao: simplifica fluxo de agendamentos`

## O que deve ser evitado

Para manter o projeto saudável, o time deve evitar:

- trabalhar direto na `main`
- fazer commit com várias mudanças sem relação
- commitar arquivos gerados automaticamente
- commitar configurações locais sem alinhamento com o grupo
- subir código sem testar minimamente

## Quando duas pessoas forem mexer na mesma parte

Se duas pessoas forem atuar em áreas parecidas do projeto:

- alinhar antes no grupo
- definir quem mexe em qual parte
- atualizar a branch com a `main` antes de concluir a tarefa
- revisar conflitos com cuidado antes de integrar

## O que fazer antes de juntar na `main`

Antes de integrar qualquer branch na `main`, conferir:

- se a tarefa realmente está concluída
- se os arquivos alterados fazem sentido
- se os testes foram executados, quando aplicável
- se o commit está organizado
- se não há arquivos locais indevidos entrando junto

## Resumo da regra do time

- `main` = versão estável
- cada tarefa = uma branch própria
- cada alteração = commits pequenos
- integração = somente após revisão e teste

## Benefícios esperados

Seguindo esse fluxo, o grupo ganha:

- menos conflitos
- menos risco de sobrescrever trabalho dos outros
- histórico mais organizado
- manutenção mais fácil
- integração mais segura

