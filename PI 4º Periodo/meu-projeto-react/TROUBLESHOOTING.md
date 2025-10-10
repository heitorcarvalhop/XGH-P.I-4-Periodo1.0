# Solução de Problemas - Barbearia do João

## 🚨 Problemas Comuns e Soluções

### 1. Erro ao Carregar a Página

**Problema**: A página não carrega ou mostra erro.

**Soluções**:

#### Opção 1: Reinstalar Dependências
```bash
# Navegar para o diretório do projeto
cd "D:\Java_VScode\Meus-Projetos\PI 4º Periodo\meu-projeto-react"

# Remover node_modules e package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstalar dependências
npm install

# Iniciar o servidor
npm start
```

#### Opção 2: Usar Yarn (Alternativa)
```bash
# Instalar yarn globalmente (se não tiver)
npm install -g yarn

# Navegar para o projeto
cd "D:\Java_VScode\Meus-Projetos\PI 4º Periodo\meu-projeto-react"

# Instalar dependências com yarn
yarn install

# Iniciar com yarn
yarn start
```

#### Opção 3: Limpar Cache do NPM
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
npm install

# Iniciar servidor
npm start
```

### 2. Erro de Versão do React

**Problema**: Conflito de versões do React.

**Solução**: Já corrigido no package.json - React 18.2.0 (versão estável).

### 3. Erro de Imagem de Fundo

**Problema**: Imagem de fundo não carrega.

**Solução**: 
- Verificar se `BrickFundo.jpg` está em `public/images/`
- Caminho correto: `/images/BrickFundo.jpg`

### 4. Erro de Axios

**Problema**: "Module not found: Error: Can't resolve 'axios'"

**Solução**:
```bash
# Instalar axios manualmente
npm install axios

# Ou reinstalar tudo
npm install
```

### 5. Erro de CORS

**Problema**: Erro de CORS ao conectar com API.

**Solução**: Configurar CORS no backend Spring Boot (ver API_DOCUMENTATION.md).

## 🔧 Comandos de Diagnóstico

### Verificar Estrutura do Projeto
```bash
# Listar arquivos
dir

# Verificar se node_modules existe
dir node_modules

# Verificar package.json
type package.json
```

### Verificar Logs de Erro
```bash
# Iniciar com logs detalhados
npm start --verbose

# Ou usar yarn
yarn start --verbose
```

### Verificar Porta
```bash
# Verificar se porta 3000 está em uso
netstat -an | findstr :3000

# Matar processo na porta 3000 (se necessário)
taskkill /f /im node.exe
```

## 📋 Checklist de Verificação

- [ ] Node.js instalado (versão 14+)
- [ ] NPM funcionando
- [ ] Projeto na pasta correta
- [ ] package.json válido
- [ ] node_modules instalado
- [ ] Imagem BrickFundo.jpg em public/images/
- [ ] Porta 3000 disponível
- [ ] Sem erros de sintaxe no código

## 🚀 Iniciar Projeto Manualmente

### Passo a Passo:

1. **Abrir PowerShell como Administrador**

2. **Navegar para o projeto**:
   ```powershell
   cd "D:\Java_VScode\Meus-Projetos\PI 4º Periodo\meu-projeto-react"
   ```

3. **Verificar se está no diretório correto**:
   ```powershell
   dir
   ```
   Deve mostrar: package.json, src/, public/, etc.

4. **Instalar dependências**:
   ```powershell
   npm install
   ```

5. **Iniciar servidor**:
   ```powershell
   npm start
   ```

6. **Abrir navegador**:
   ```
   http://localhost:3000
   ```

## 🆘 Se Nada Funcionar

### Criar Novo Projeto:
```bash
# Criar novo projeto React
npx create-react-app barbearia-nova

# Copiar arquivos do projeto atual
# (src/, public/images/, etc.)

# Instalar dependências adicionais
npm install axios
```

### Verificar Logs Detalhados:
```bash
# Iniciar com debug
set DEBUG=* && npm start

# Ou no PowerShell
$env:DEBUG="*"; npm start
```

## 📞 Informações de Suporte

- **Versão do Node**: Verificar com `node --version`
- **Versão do NPM**: Verificar com `npm --version`
- **Sistema**: Windows 10
- **Projeto**: React 18.2.0 + Axios 1.6.0

## ✅ Status Atual

- ✅ Código corrigido
- ✅ Imagem de fundo configurada
- ✅ Dependências atualizadas
- ✅ Estrutura organizada
- ⚠️ Servidor precisa ser iniciado manualmente
