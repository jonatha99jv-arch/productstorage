# Integração do Sistema de Carreira

## Resumo
Foi integrado o sistema de carreira (starbem-career-path) com o projeto principal (productstorage). A integração incluiu:

### Componentes Adicionados
1. **YCareerDiagram** - Componente principal do diagrama de carreira em Y
2. **CareerModal** - Modal detalhado com informações de cada nível de carreira
3. **careerData.js** - Dados dos níveis de carreira e usuário mock

### Navegação
- Adicionada nova seção "Carreira" no menu lateral
- Seção existente "Roadmap" mantida
- Ícone TrendingUp para a seção de carreira

### Estrutura
```
src/
  components/
    YCareerDiagram.jsx     # Diagrama principal de carreira
    CareerModal.jsx        # Modal com detalhes dos níveis
  data/
    careerData.js          # Dados e tipos de carreira
```

### Funcionalidades
- Visualização em formato Y das trilhas técnica e de gestão
- Níveis de carreira: Júnior → Pleno → Sênior → Staff/Manager → Principal/Director
- Modal interativo com detalhes completos de cada posição
- Indicação visual do nível atual do usuário
- Sistema de recursos (cursos, mentores, projetos)

### Tecnologias
- Convertido de TypeScript para JavaScript
- Mantida compatibilidade com os componentes UI existentes
- Utilizando Tailwind CSS para estilização

## Como usar
1. Acesse o sistema e faça login
2. No menu lateral, clique em "Carreira"
3. Visualize o diagrama em Y com as trilhas de carreira
4. Clique em qualquer nível para ver detalhes no modal
5. Use os recursos sugeridos para desenvolvimento profissional
