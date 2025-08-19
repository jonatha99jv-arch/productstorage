-- Esquema do banco de dados para o Roadmap Interativo

-- Usuários e controle de acesso
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- viewer | editor | admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabela para armazenar os OKRs (criada PRIMEIRO pois é referenciada por roadmap_items)
CREATE TABLE IF NOT EXISTS okrs (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    objetivo TEXT NOT NULL,
    key_results TEXT[] NOT NULL, -- Array de key results
    trimestre VARCHAR(10),
    ano INTEGER,
    progresso INTEGER DEFAULT 0, -- Progresso em porcentagem (0-100)
    status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar os itens do roadmap
CREATE TABLE IF NOT EXISTS roadmap_items (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    produto VARCHAR(100) NOT NULL,
    sub_produto VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planejado',
    prioridade VARCHAR(20) DEFAULT 'media',
    data_inicio DATE,
    data_fim DATE,
    responsavel VARCHAR(255),
    okr_id INTEGER REFERENCES okrs(id),
    tags TEXT[], -- Array de tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_roadmap_items_produto ON roadmap_items(produto);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_status ON roadmap_items(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_okr_id ON roadmap_items(okr_id);
CREATE INDEX IF NOT EXISTS idx_okrs_status ON okrs(status);
CREATE INDEX IF NOT EXISTS idx_okrs_ano_trimestre ON okrs(ano, trimestre);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roadmap_items_updated_at 
    BEFORE UPDATE ON roadmap_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_okrs_updated_at 
    BEFORE UPDATE ON okrs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;

-- Permitir todas as operações para usuários autenticados (você pode ajustar conforme necessário)
CREATE POLICY "Permitir todas as operações para roadmap_items" ON roadmap_items
    FOR ALL USING (true);

CREATE POLICY "Permitir todas as operações para okrs" ON okrs
    FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE roadmap_items IS 'Tabela para armazenar os itens do roadmap de produtos';
COMMENT ON TABLE okrs IS 'Tabela para armazenar os OKRs (Objectives and Key Results)';
COMMENT ON COLUMN roadmap_items.produto IS 'Tipo de produto: aplicativo, web, etc.';
COMMENT ON COLUMN roadmap_items.sub_produto IS 'Sub-produto para categorização adicional';
COMMENT ON COLUMN roadmap_items.status IS 'Status do item: planejado, em_andamento, concluido, cancelado';
COMMENT ON COLUMN roadmap_items.prioridade IS 'Prioridade: baixa, media, alta, critica';
COMMENT ON COLUMN okrs.progresso IS 'Progresso do OKR em porcentagem (0-100)';