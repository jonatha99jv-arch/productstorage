-- Script para adicionar o campo 'nome' à tabela users existente
-- Execute este script no Supabase SQL Editor se a tabela já existir

-- Adicionar coluna nome se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'nome'
    ) THEN
        ALTER TABLE users ADD COLUMN nome VARCHAR(255) NOT NULL DEFAULT 'Usuário';
    END IF;
END $$;

-- Atualizar usuários existentes com um nome padrão se necessário
UPDATE users SET nome = 'Usuário' WHERE nome IS NULL OR nome = '';

-- Criar índice para o campo nome
CREATE INDEX IF NOT EXISTS idx_users_nome ON users(nome);
