-- Script simples para criar a coluna nome
-- Execute no Supabase SQL Editor

-- Criar a coluna
ALTER TABLE users ADD COLUMN nome VARCHAR(255) DEFAULT 'Usuário';

-- Verificar se foi criada
SELECT * FROM users LIMIT 1;
