-- Adicionar campo de ordem manual para permitir reorganização por arrastar e soltar
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna de ordem manual
ALTER TABLE roadmap_items 
ADD COLUMN IF NOT EXISTS manual_order INTEGER DEFAULT 0;

-- 2. Inicializar a ordem baseada na data de criação (mais antigos primeiro)
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_order
  FROM roadmap_items
)
UPDATE roadmap_items 
SET manual_order = ordered.new_order
FROM ordered
WHERE roadmap_items.id = ordered.id;

-- 3. Criar índice para performance na ordenação
CREATE INDEX IF NOT EXISTS idx_roadmap_items_manual_order 
ON roadmap_items(manual_order);

-- 4. Criar índice composto para ordenação por produto/subproduto + ordem manual
CREATE INDEX IF NOT EXISTS idx_roadmap_items_product_order 
ON roadmap_items(produto, sub_produto, manual_order);

