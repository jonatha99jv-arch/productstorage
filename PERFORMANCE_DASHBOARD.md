# 📊 Dashboard de Performance - Documentação

## Visão Geral

O Dashboard de Performance foi implementado para monitorar e visualizar métricas dos times de desenvolvimento da Starbem, seguindo o protótipo fornecido e mantendo a consistência com o design system da aplicação.

## 🎯 Funcionalidades Implementadas

### 1. Dashboard Principal (`PerformanceDashboard.jsx`)
- **Resumo Executivo**: Visão geral com score de performance, alertas críticos e comparativo entre times
- **Dashboards por Time**: Visualização detalhada das métricas de cada time (Aplicativo, Integrações, Web)
- **Sistema de Tabs**: Navegação entre resumo executivo e dashboards específicos
- **Insights & Recomendações**: Análises automáticas baseadas nas métricas

### 2. Interface de Gerenciamento (`MetricsAdmin.jsx`)
- **CRUD de Métricas**: Criar, editar e excluir métricas de performance
- **Controle de Acesso**: Disponível apenas para editores e administradores
- **Formulários Dinâmicos**: Interface intuitiva para cadastro de métricas
- **Validações**: Campos obrigatórios e validações de formato

### 3. Dados Mock (`performanceData.js`)
- **Estrutura Completa**: Dados de exemplo para todos os times e métricas
- **Helper Functions**: Funções auxiliares para manipulação dos dados
- **Queries Preparadas**: Estrutura SQL preparada para integração com Supabase

## 📋 Métricas Monitoradas

### Times Disponíveis:
- **Time Aplicativo**
- **Time Integrações** 
- **Time Web**

### Métricas por Time:
1. **Cycle Time**: Tempo do início ao fim de uma feature
2. **Velocity**: Pontos de história entregues por sprint
3. **WIP**: Work in Progress - itens em andamento
4. **Bug Rate**: Taxa de bugs por entrega
5. **Time to Resolve Bugs**: Tempo médio para resolver bugs
6. **Scope Creep**: Mudanças de escopo durante o desenvolvimento

## 🎨 Design e UX

### Cores por Status:
- 🟢 **Verde**: Métricas que melhoraram
- 🔴 **Vermelho**: Métricas que pioraram
- 🔵 **Azul**: Próximo nível/estável
- ⚫ **Cinza**: Sem dados anteriores

### Componentes Visuais:
- **Cards de Métricas**: Com tendências e comparações
- **Badges de Status**: Indicadores visuais de performance
- **Gradientes**: Headers com cores distintivas por time
- **Ícones Lucide**: Consistência com o resto da aplicação

## 🔗 Integração com Supabase (Produção)

### Estrutura de Tabelas Sugerida:

```sql
-- Tabela de métricas de performance
CREATE TABLE performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    metric_name VARCHAR(50) NOT NULL,
    current_value VARCHAR(100) NOT NULL,
    previous_value VARCHAR(100),
    trend_percentage DECIMAL(5,2),
    status VARCHAR(20) CHECK (status IN ('improved', 'declined', 'stable')),
    period VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Tabela de insights dos times
CREATE TABLE team_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    insight_type VARCHAR(20) CHECK (insight_type IN ('success', 'warning', 'info')),
    message TEXT NOT NULL,
    period VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Tabela de alertas críticos
CREATE TABLE performance_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(20) CHECK (alert_type IN ('critical', 'warning')),
    metric_name VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id)
);
```

### Políticas RLS (Row Level Security):

```sql
-- Todos podem ler métricas de performance
CREATE POLICY "Allow read performance_metrics" ON performance_metrics FOR SELECT USING (true);

-- Apenas editores e admins podem modificar métricas
CREATE POLICY "Allow insert performance_metrics" ON performance_metrics FOR INSERT 
WITH CHECK (auth.role() IN ('editor', 'admin'));

CREATE POLICY "Allow update performance_metrics" ON performance_metrics FOR UPDATE 
USING (auth.role() IN ('editor', 'admin'));

CREATE POLICY "Allow delete performance_metrics" ON performance_metrics FOR DELETE 
USING (auth.role() IN ('admin'));
```

### Hooks Personalizados para Supabase:

```javascript
// usePerformanceData.js
export const usePerformanceData = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [performanceData, setPerformanceData] = useState(null)

  const fetchPerformanceData = async (period = 'current') => {
    try {
      setLoading(true)
      
      // Buscar métricas
      const { data: metrics, error: metricsError } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('period', period)
      
      if (metricsError) throw metricsError

      // Buscar insights
      const { data: insights, error: insightsError } = await supabase
        .from('team_insights')
        .select('*')
        .eq('period', period)
        .eq('is_active', true)
      
      if (insightsError) throw insightsError

      // Buscar alertas
      const { data: alerts, error: alertsError } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('is_active', true)
        .order('severity', { ascending: false })
      
      if (alertsError) throw alertsError

      // Processar e organizar dados
      const processedData = processPerformanceData(metrics, insights, alerts)
      setPerformanceData(processedData)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    performanceData,
    loading,
    error,
    fetchPerformanceData,
    // ... outras funções
  }
}
```

## 🚀 Como Usar

### 1. Visualização do Dashboard
1. Acesse a aplicação
2. Clique em "Performance" na sidebar
3. Navegue pelas abas: Resumo Executivo, Time Aplicativo, etc.
4. Clique nos cards para ver detalhes das métricas

### 2. Gerenciamento de Métricas (Admin/Editor)
1. Acesse "Gerenciar Métricas" na sidebar (apenas para editores/admins)
2. Clique em "Nova Métrica" para adicionar
3. Preencha o formulário com os dados da métrica
4. Salve - os dados aparecerão automaticamente no dashboard

### 3. Períodos e Histórico
- O sistema suporta diferentes períodos (Jul/Ago 2024, Set/Out 2024, etc.)
- As métricas anteriores são mantidas para comparação
- Trends são calculados automaticamente

## 🔧 Customização

### Adicionando Novos Times:
1. Edite `performanceData.js`
2. Adicione novo team no objeto `teams`
3. Configure métricas específicas do time
4. Adicione cor temática personalizada

### Adicionando Novas Métricas:
1. Edite `metricTypes` em `MetricsAdmin.jsx`
2. Adicione novo tipo de métrica
3. Configure validações específicas
4. Implemente visualização no dashboard

### Personalizando Insights:
1. Edite lógica em `performanceData.js`
2. Configure regras automáticas de insights
3. Personalize tipos de alertas
4. Ajuste prioridades e severidades

## 📱 Responsividade

O dashboard é totalmente responsivo:
- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Grid adaptativo, sidebar colapsível  
- **Mobile**: Cards empilhados, navegação otimizada

## 🎛️ Configurações Avançadas

### Refresh Automático:
- Botão de atualização manual implementado
- Estrutura preparada para refresh automático via WebSocket
- Timestamp de última atualização sempre visível

### Exportação de Dados:
- Estrutura preparada para export PDF/Excel
- Botões de ação já implementados
- APIs prontas para implementação futura

## 🔍 Troubleshooting

### Problemas Comuns:
1. **Dashboard não carrega**: Verificar se o usuário tem permissões adequadas
2. **Métricas não aparecem**: Confirmar período selecionado e dados cadastrados
3. **Botão "Gerenciar Métricas" não aparece**: Usuário deve ter role 'editor' ou 'admin'

### Debug Mode:
- Console logs implementados para desenvolvimento
- Mock data sempre disponível como fallback
- Modo offline funcional para testes

---

## 🎉 Resultado Final

✅ **Dashboard completo** baseado no protótipo fornecido
✅ **Design system consistente** com a aplicação existente
✅ **Estrutura preparada** para produção com Supabase
✅ **Interface de administração** para editores e admins
✅ **Dados mock realistas** para desenvolvimento e testes
✅ **Código documentado** e bem estruturado
✅ **Totalmente responsivo** e acessível

O dashboard está pronto para uso imediato e expansão futura! 🚀
