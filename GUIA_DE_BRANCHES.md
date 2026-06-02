# Guia de Branches e Commits do Projeto

## Objetivo

Este guia define o fluxo simplificado de branches usado pelo time para manter
o projeto organizado e preservar uma versao estavel para demonstracoes.

## Papel de cada branch

- `main`: versao estavel e demonstravel do sistema.
- `develop`: integracao das melhorias concluidas e testadas.
- `feature/nome-da-melhoria`: desenvolvimento isolado de uma funcionalidade.
- `fix/nome-do-problema`: correcao isolada de um defeito.

Nao desenvolva diretamente em `main` ou `develop`.

## Fluxo padrao

1. Atualize a branch `develop`.
2. Crie uma branch `feature/*` ou `fix/*` a partir de `develop`.
3. Desenvolva e teste a alteracao nessa branch.
4. Faca commits pequenos e focados.
5. Envie a branch para o GitHub quando precisar compartilhar o trabalho.
6. Revise e integre a branch em `develop`.
7. Leve `develop` para `main` somente quando houver uma versao demonstravel.

## Comandos para iniciar uma melhoria

```powershell
git switch develop
git pull
git switch -c feature/nome-da-melhoria
```

## Comandos para compartilhar a melhoria

```powershell
git push -u origin feature/nome-da-melhoria
```

## Integracao de uma melhoria concluida

Depois de revisar os arquivos alterados e executar os testes aplicaveis:

```powershell
git switch develop
git pull
git merge feature/nome-da-melhoria
git push origin develop
```

## Publicacao de uma versao demonstravel

Quando o conjunto integrado em `develop` estiver estavel:

```powershell
git switch main
git pull
git merge develop
git push origin main
git switch develop
```

## Exemplos de branches

- `feature/selecao-multiplos-servicos`
- `feature/dashboard-barbeiro`
- `fix/validacao-email`
- `fix/mapa-localizacao`

## Regras de commit

Os commits devem ser pequenos, claros e focados em uma unica mudanca logica.

Exemplos:

- `feat: permite selecionar multiplos servicos`
- `fix: corrige validacao de email do cliente`
- `test: adiciona cenarios de conflito de horario`
- `docs: atualiza guia de branches`

## Antes de integrar

Confira:

- se a tarefa esta concluida;
- se os arquivos alterados pertencem ao escopo da tarefa;
- se os testes aplicaveis foram executados;
- se nao existem arquivos locais ou gerados indevidamente;
- se a aplicacao continua funcionando.

## Resumo

- novas tarefas saem de `develop`;
- melhorias concluidas voltam para `develop`;
- `main` recebe somente versoes demonstraveis;
- cada alteracao deve ser revisada e testada antes da integracao.
