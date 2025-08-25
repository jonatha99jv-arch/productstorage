import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '@/components/ui/button.jsx'
import { Database, CheckCircle, AlertCircle } from 'lucide-react'

const DatabaseSetup = ({ onSetupComplete }) => {
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupStatus, setSetupStatus] = useState('')
  const [setupError, setSetupError] = useState('')

  const runDatabaseSetup = async () => {
    setIsSetupRunning(true)
    setSetupError('')
    setSetupStatus('Iniciando configuração do banco de dados...')

    try {
      // Verificar se as tabelas já existem
      setSetupStatus('Verificando estrutura do banco de dados...')
      
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['roadmap_items', 'okrs'])

      if (tablesError) {
        console.log('Erro ao verificar tabelas (esperado se não existirem):', tablesError)
      }

      // Criar tabela OKRs primeiro (devido à referência foreign key)
      setSetupStatus('Criando tabela de OKRs...')
      const { error: okrsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS okrs (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT,
            objetivo TEXT NOT NULL,
            key_results TEXT[] NOT NULL,
            trimestre VARCHAR(10),
            ano INTEGER,
            progresso INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'ativo',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      if (okrsError) {
        console.log('Tentativa de criar tabela OKRs via RPC falhou, tentando inserção direta...')
        // Tentar inserir um registro de teste para verificar se a tabela existe
        const { error: testOkrError } = await supabase
          .from('okrs')
          .select('id')
          .limit(1)

        if (testOkrError && testOkrError.code === '42P01') {
          throw new Error('Tabela OKRs não existe e não foi possível criá-la automaticamente. Por favor, execute o script SQL manualmente no painel do Supabase.')
        }
      }

      // Criar tabela roadmap_items
      setSetupStatus('Criando tabela de itens do roadmap...')
      const { error: roadmapError } = await supabase.rpc('exec_sql', {
        sql: `
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
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      if (roadmapError) {
        console.log('Tentativa de criar tabela roadmap_items via RPC falhou, tentando inserção direta...')
        // Tentar inserir um registro de teste para verificar se a tabela existe
        const { error: testRoadmapError } = await supabase
          .from('roadmap_items')
          .select('id')
          .limit(1)

        if (testRoadmapError && testRoadmapError.code === '42P01') {
          throw new Error('Tabela roadmap_items não existe e não foi possível criá-la automaticamente. Por favor, execute o script SQL manualmente no painel do Supabase.')
        }
      }

      // Criar tabela solicitacoes
      setSetupStatus('Criando tabela de solicitações...')
      const { error: requestsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS solicitacoes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            nome_solicitante VARCHAR(255) NOT NULL,
            email_solicitante VARCHAR(255) NOT NULL,
            departamento VARCHAR(255),
            produto VARCHAR(100) NOT NULL,
            sub_produto VARCHAR(100),
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT,
            retorno_esperado TEXT,
            file_url TEXT,
            file_name TEXT,
            file_type TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      if (requestsError) {
        console.log('Tentativa de criar tabela solicitacoes via RPC falhou, testando existência...')
        const { error: testReqError } = await supabase
          .from('solicitacoes')
          .select('id')
          .limit(1)

        if (testReqError && testReqError.code === '42P01') {
          throw new Error('Tabela solicitacoes não existe e não foi possível criá-la automaticamente. Execute o script SQL manualmente no Supabase.')
        }
      }

      // Criar tabela de votos em solicitações
      setSetupStatus('Criando tabela de votos de solicitações...')
      const { error: votesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS solicitacao_votes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            solicitacao_id UUID NOT NULL REFERENCES solicitacoes(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote_per_user ON solicitacao_votes(solicitacao_id, user_id);
          CREATE INDEX IF NOT EXISTS idx_votes_solicitacao ON solicitacao_votes(solicitacao_id);
          ALTER TABLE solicitacao_votes ENABLE ROW LEVEL SECURITY;
        `
      })

      if (votesError) {
        console.log('Tentativa de criar tabela solicitacao_votes via RPC falhou, testando existência...')
        const { error: testVotesError } = await supabase
          .from('solicitacao_votes')
          .select('id')
          .limit(1)

        if (testVotesError && testVotesError.code === '42P01') {
          throw new Error('Tabela solicitacao_votes não existe e não foi possível criá-la automaticamente. Execute o script SQL manualmente no Supabase.')
        }
      }

      setSetupStatus('Configuração concluída com sucesso!')
      setTimeout(() => {
        onSetupComplete()
      }, 2000)

    } catch (error) {
      console.error('Erro na configuração do banco:', error)
      setSetupError(error.message)
      setSetupStatus('Erro na configuração')
    } finally {
      setIsSetupRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <Database className="h-12 w-12 text-company-dark-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-company-dark-blue mb-2">
            Configuração do Banco de Dados
          </h2>
          <p className="text-gray-600">
            É necessário configurar as tabelas no Supabase antes de usar o aplicativo.
          </p>
        </div>

        {setupStatus && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center">
              {setupStatus.includes('sucesso') ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
              )}
              <span className="text-blue-700">{setupStatus}</span>
            </div>
          </div>
        )}

        {setupError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{setupError}</span>
            </div>
            <div className="mt-2 text-sm text-red-600">
              <p>Para configurar manualmente:</p>
              <ol className="list-decimal list-inside mt-1">
                <li>Acesse o painel do Supabase</li>
                <li>Vá para "SQL Editor"</li>
                <li>Execute o script database_schema.sql</li>
                <li>Recarregue esta página</li>
              </ol>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={runDatabaseSetup}
            disabled={isSetupRunning}
            className="w-full bg-company-dark-blue hover:bg-company-dark-blue/90 text-white"
          >
            {isSetupRunning ? 'Configurando...' : 'Configurar Banco de Dados'}
          </Button>
          
          <Button
            onClick={onSetupComplete}
            variant="outline"
            className="w-full"
          >
            Pular (usar localStorage)
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            Se a configuração automática falhar, você pode executar o script SQL manualmente
            no painel do Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DatabaseSetup

