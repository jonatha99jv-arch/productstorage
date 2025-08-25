-- Script direto para criar a coluna 'nome' na tabela users
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a coluna existe
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'nome';

-- 2. Se a coluna não existir, criar
ALTER TABLE users ADD COLUMN IF NOT EXISTS nome VARCHAR(255);

-- 3. Definir como NOT NULL com valor padrão
ALTER TABLE users ALTER COLUMN nome SET NOT NULL;
ALTER TABLE users ALTER COLUMN nome SET DEFAULT 'Usuário';

-- 4. Atualizar registros existentes
UPDATE users SET nome = 'Usuário' WHERE nome IS NULL OR nome = '';

-- 5. Verificar novamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'nome';

-- 6. Verificar dados
SELECT id, nome, email, role FROM users LIMIT 5;
