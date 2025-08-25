-- Script para atualizar o nome do usuário admin
-- Execute no Supabase SQL Editor

-- Atualizar o nome do usuário admin
UPDATE users 
SET nome = 'Jonatha Vieira' 
WHERE email = 'jonatha.vieira@starbem.app';

-- Verificar se foi atualizado
SELECT id, nome, email, role FROM users WHERE email = 'jonatha.vieira@starbem.app';
