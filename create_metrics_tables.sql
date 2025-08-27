-- ============================================
-- SCRIPT PARA CRIAR TABELAS DE MÉTRICAS NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. TABELA DE TIMES
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE SPRINTS
CREATE TABLE IF NOT EXISTS sprints (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE MÉTRICAS DAS SPRINTS
CREATE TABLE IF NOT EXISTS sprint_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id TEXT NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    value TEXT NOT NULL,
    raw_value DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint para evitar métricas duplicadas na mesma sprint
    UNIQUE(sprint_id, metric_name)
);

-- ============================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sprints_team_id ON sprints(team_id);
CREATE INDEX IF NOT EXISTS idx_sprints_start_date ON sprints(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_sprint_metrics_sprint_id ON sprint_metrics(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_metrics_name ON sprint_metrics(metric_name);

-- ============================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para teams
CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON teams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para sprints
CREATE TRIGGER update_sprints_updated_at 
    BEFORE UPDATE ON sprints 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para sprint_metrics
CREATE TRIGGER update_sprint_metrics_updated_at 
    BEFORE UPDATE ON sprint_metrics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (ROW LEVEL SECURITY) - OPCIONAL
-- ============================================

-- Habilitar RLS se necessário (descomente se quiser usar)
-- ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sprints ENABLE ROW LEVEL SECURITY; 
-- ALTER TABLE sprint_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (descomente se habilitar RLS)
-- CREATE POLICY "Allow read access for authenticated users" ON teams FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow full access for authenticated users" ON teams FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INSERIR DADOS INICIAIS (TIMES PADRÃO)
-- ============================================

INSERT INTO teams (id, name, color) VALUES 
    ('aplicativo', 'Time Aplicativo', 'orange'),
    ('integracoes', 'Time Integrações', 'blue'),  
    ('web', 'Time Web', 'purple')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Sprint de exemplo para o Time Aplicativo
INSERT INTO sprints (id, team_id, name, period, start_date, end_date) VALUES 
    ('aplicativo-sprint-10', 'aplicativo', 'Sprint 10', 'Set 2024', '2024-09-01', '2024-09-14')
ON CONFLICT (id) DO NOTHING;

-- Métricas de exemplo para a Sprint 10
INSERT INTO sprint_metrics (sprint_id, metric_name, value, raw_value, unit) VALUES 
    ('aplicativo-sprint-10', 'cycleTime', '1sem 4d 11.3h', 11.3, 'time'),
    ('aplicativo-sprint-10', 'velocity', '320', 320, 'points'),
    ('aplicativo-sprint-10', 'wip', '18', 18, 'items'),
    ('aplicativo-sprint-10', 'bugRate', '8', 8, 'bugs'),
    ('aplicativo-sprint-10', 'timeToResolveBugs', '10.5h', 10.5, 'time'),
    ('aplicativo-sprint-10', 'scopeCreep', '3', 3, 'points')
ON CONFLICT (sprint_id, metric_name) DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS (OPCIONAL)
-- ============================================

-- View para sprints com informações do time
CREATE OR REPLACE VIEW sprints_with_teams AS
SELECT 
    s.*,
    t.name as team_name,
    t.color as team_color
FROM sprints s
JOIN teams t ON s.team_id = t.id;

-- View para métricas com informações da sprint e time
CREATE OR REPLACE VIEW metrics_with_context AS
SELECT 
    sm.*,
    s.name as sprint_name,
    s.period as sprint_period,
    s.start_date,
    s.end_date,
    t.name as team_name,
    t.color as team_color
FROM sprint_metrics sm
JOIN sprints s ON sm.sprint_id = s.id
JOIN teams t ON s.team_id = t.id;
