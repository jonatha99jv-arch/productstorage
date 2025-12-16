-- Adicionar campo de resultado obtido para cada item do roadmap
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna de resultado obtido
-- O resultado será armazenado como texto no JSON de descricao (junto com inputOutputMetric e teseProduto)
-- Não precisa de nova coluna no banco, pois já temos o campo descricao que armazena JSON

-- Se preferir uma coluna separada, use:
-- ALTER TABLE roadmap_items 
-- ADD COLUMN IF NOT EXISTS resultado_obtido TEXT DEFAULT '';

-- Nota: A implementação atual usa o campo `descricao` que já armazena JSON com:
-- { inputOutputMetric, teseProduto, descricao, resultadoObtido }
-- Portanto, não é necessário executar nenhum SQL adicional!

