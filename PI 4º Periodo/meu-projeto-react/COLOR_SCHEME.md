# Esquema de Cores - BarberShop

## 🎨 Paleta de Cores

### Cores Principais
- **Preto Principal**: `#1a1a1a` - Fundo principal dos cards
- **Preto Secundário**: `#2d2d2d` - Gradiente e elementos escuros
- **Preto Terciário**: `#3a3a3a` - Estados de foco e hover

### Cores Douradas
- **Dourado Principal**: `#d4af37` - Cor principal para títulos, bordas e botões
- **Dourado Secundário**: `#b8860b` - Gradiente dos botões
- **Dourado Hover**: `#e6c547` - Estado hover dos botões

### Cores Prateadas
- **Prateado Principal**: `#c0c0c0` - Textos secundários e labels
- **Prateado Secundário**: `#444` - Bordas e separadores

### Cores de Erro
- **Vermelho Erro**: `#ff6b6b` - Mensagens de erro e validação

## 🎯 Aplicação das Cores

### Background
- **Fundo Principal**: Padrão de tijolos escuros criado com CSS
- **Overlay**: Gradiente escuro para melhor contraste
- **Cards**: Gradiente preto com bordas douradas

### Tipografia
- **Títulos**: Dourado com brilho (`text-shadow`)
- **Labels**: Dourado com brilho sutil
- **Textos**: Prateado para boa legibilidade
- **Placeholders**: Prateado claro

### Elementos Interativos
- **Botões**: Gradiente dourado com bordas douradas
- **Inputs**: Fundo escuro com bordas prateadas
- **Focus**: Bordas douradas com brilho
- **Hover**: Efeitos de brilho e elevação

### Estados
- **Normal**: Cores padrão da paleta
- **Hover**: Brilho aumentado e elevação
- **Focus**: Bordas douradas com brilho
- **Error**: Bordas vermelhas com fundo escuro
- **Disabled**: Opacidade reduzida

## 🔧 Implementação CSS

### Gradientes Utilizados
```css
/* Fundo dos cards */
background: linear-gradient(145deg, #1a1a1a, #2d2d2d);

/* Botões */
background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);

/* Inputs */
background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
```

### Sombras e Brilhos
```css
/* Brilho dourado */
text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);

/* Sombra dos cards */
box-shadow: 
  0 20px 40px rgba(0, 0, 0, 0.5),
  0 0 20px rgba(212, 175, 55, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

### Bordas e Contornos
```css
/* Bordas douradas */
border: 2px solid #d4af37;

/* Linha superior dos cards */
background: linear-gradient(90deg, #d4af37, #c0c0c0, #d4af37);
```

## 📱 Responsividade

O esquema de cores mantém consistência em todos os tamanhos de tela:
- **Desktop**: Cores completas com todos os efeitos
- **Tablet**: Cores mantidas, efeitos adaptados
- **Mobile**: Cores otimizadas para telas menores

## 🎨 Acessibilidade

- **Contraste**: Alto contraste entre texto e fundo
- **Legibilidade**: Cores prateadas garantem boa leitura
- **Foco**: Bordas douradas claramente visíveis
- **Estados**: Diferenciação clara entre estados normais e de erro

## 🔄 Transições

Todas as mudanças de cor incluem transições suaves:
```css
transition: all 0.3s ease;
```

Isso garante uma experiência fluida e profissional para o usuário.
