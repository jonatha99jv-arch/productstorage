import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isMockMode, getSession } from '../lib/auth'

// Dados mock para desenvolvimento local
const mockRoadmapItems = [
  {
    id: '1',
    nome: 'Sistema de Login Aprimorado',
    inputOutputMetric: 'Redução de 50% nos problemas de autenticação',
    teseProduto: 'Melhorar a experiência de login e segurança do sistema',
    produto: 'aplicativo',
    subProduto: '',
    status: 'em_andamento',
    dataInicio: new Date('2024-01-15'),
    dataFim: new Date('2024-03-15'),
    okrId: '1',
    subitens: ['Implementar 2FA', 'Design responsivo', 'Testes automatizados']
  },
  {
    id: '2',
    nome: 'Dashboard Executivo',
    inputOutputMetric: 'Aumento de 30% na velocidade de tomada de decisão',
    teseProduto: 'Painel gerencial com métricas em tempo real',
    produto: 'web',
    subProduto: 'backoffice',
    status: 'planejado',
    dataInicio: new Date('2024-03-01'),
    dataFim: new Date('2024-06-01'),
    okrId: '2',
    subitens: ['Gráficos interativos', 'Filtros avançados', 'Exportação PDF']
  },
  {
    id: '3',
    nome: 'Integração com IA',
    inputOutputMetric: 'Automação de 40% dos processos manuais',
    teseProduto: 'Implementar assistente de IA para otimização',
    produto: 'ai',
    subProduto: '',
    status: 'concluido',
    dataInicio: new Date('2023-11-01'),
    dataFim: new Date('2024-03-01'),
    okrId: '1',
    subitens: ['Análise preditiva', 'Chatbot inteligente', 'Automação de relatórios']
  }
]

const mockOKRs = [
  {
    id: '1',
    objetivo: 'Melhorar Experiência do Usuário',
    keyResults: [
      'Reduzir tempo de carregamento em 40%',
      'Aumentar satisfação do usuário para 4.5/5',
      'Diminuir taxa de abandono para 15%'
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    objetivo: 'Aumentar Eficiência Operacional',
    keyResults: [
      'Automatizar 50% dos processos manuais',
      'Reduzir custos operacionais em 25%',
      'Implementar 3 novos dashboards gerenciais'
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T10:30:00Z'
  }
]

export const useSupabaseData = () => {
  const [roadmapItems, setRoadmapItems] = useState([])
  const [okrs, setOkrs] = useState([])
  const [solicitacoes, setSolicitacoes] = useState([])
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar dados do Supabase na inicialização
  useEffect(() => {
    loadData()
    loadSolicitacoes()
  }, [])

  // Normalização de texto (remove acentos, lowercase, trim)
  const normalizeText = (value) => {
    if (!value) return ''
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  // Normalização para produtos (ids canônicos usados na UI)
  const normalizeProduct = (value) => {
    const key = normalizeText(value)
    switch (key) {
      case 'aplicativo':
      case 'web':
      case 'parcerias':
      case 'ai':
      case 'automacao': // cobre "automação" -> "automacao"
        return key
      default:
        return 'aplicativo'
    }
  }

  // Normalização de subprodutos Web/Aplicativo
  const normalizeSubProduct = (value) => {
    const key = normalizeText(value)
    if (key === 'portal estrela' || key === 'portal_estrela') return 'portal_estrela'
    if (key === 'backoffice') return 'backoffice'
    if (key === 'doctor') return 'doctor'
    if (key === 'company') return 'company'
    if (key === 'brasil') return 'brasil'
    if (key === 'global') return 'global'
    if (key === 'geral') return 'geral'
    return ''
  }

  const mapDbToApp = (dbItem) => {
    // Descompactar descricao caso esteja em JSON com campos adicionais
    let inputOutputMetric = ''
    let teseProduto = ''
    try {
      if (dbItem.descricao && typeof dbItem.descricao === 'string' && dbItem.descricao.trim().startsWith('{')) {
        const extra = JSON.parse(dbItem.descricao)
        inputOutputMetric = extra.inputOutputMetric || ''
        teseProduto = extra.teseProduto || ''
      } else if (dbItem.descricao) {
        teseProduto = dbItem.descricao
      }
    } catch (_) {
      // Ignorar parse errors e manter descricao como teseProduto
      teseProduto = dbItem.descricao || ''
    }

    // Reconstituir subitens e dataFim a partir de tags
    const tags = Array.isArray(dbItem.tags) ? dbItem.tags : []
    let dataFim = null
    const subitens = []
    for (const tag of tags) {
      if (typeof tag === 'string' && tag.startsWith('dataFim:')) {
        const parts = tag.split(':')
        if (parts[1]) {
          const [yy, mm, dd] = parts[1].split('-').map(Number)
          if (yy && mm && dd) {
            dataFim = new Date(yy, mm - 1, dd)
          }
        }
      } else if (typeof tag === 'string') {
        subitens.push(tag)
      }
    }

    // data_inicio pode vir como 'YYYY-MM-DD' (string). Construir Date local sem UTC.
    let dataInicioLocal = null
    if (dbItem.data_inicio) {
      if (typeof dbItem.data_inicio === 'string') {
        const [yy, mm, dd] = dbItem.data_inicio.split('-').map(Number)
        if (yy && mm && dd) {
          dataInicioLocal = new Date(yy, mm - 1, dd)
        }
      } else {
        const d = new Date(dbItem.data_inicio)
        if (!Number.isNaN(d.getTime())) dataInicioLocal = d
      }
    }

    // data_fim pode vir como 'YYYY-MM-DD' (string). Construir Date local sem UTC.
    let dataFimLocal = null
    if (dbItem.data_fim) {
      if (typeof dbItem.data_fim === 'string') {
        const [yy, mm, dd] = dbItem.data_fim.split('-').map(Number)
        if (yy && mm && dd) {
          dataFimLocal = new Date(yy, mm - 1, dd)
        }
      } else {
        const d = new Date(dbItem.data_fim)
        if (!Number.isNaN(d.getTime())) dataFimLocal = d
      }
    }

    return {
      id: dbItem.id,
      nome: dbItem.titulo || '',
      inputOutputMetric,
      teseProduto,
      produto: normalizeProduct(dbItem.produto || 'aplicativo'),
      subProduto: normalizeSubProduct(dbItem.sub_produto || ''),
      status: dbItem.status || 'nao_iniciado',
      dataInicio: dataInicioLocal,
      dataFim: dataFimLocal,
      okrId: dbItem.okr_id || '',
      subitens,
    }
  }

  const mapAppToDb = (appItem) => {
    console.log('🔍 mapAppToDb - appItem recebido:', appItem)
    console.log('🔍 mapAppToDb - dataFim:', appItem.dataFim, 'tipo:', typeof appItem.dataFim)
    
    const descricao = JSON.stringify({
      inputOutputMetric: appItem.inputOutputMetric || '',
      teseProduto: appItem.teseProduto || ''
    })

    const tags = Array.isArray(appItem.subitens) ? [...appItem.subitens] : []
    if (appItem.dataFim && appItem.dataFim instanceof Date) {
      tags.push(`dataFim:${appItem.dataFim.getFullYear()}-${String(appItem.dataFim.getMonth() + 1).padStart(2, '0')}-${String(appItem.dataFim.getDate()).padStart(2, '0')}`);
    }

    const toLocalDateString = (dateLike) => {
      console.log('🔍 toLocalDateString - dateLike:', dateLike, 'tipo:', typeof dateLike)
      if (!dateLike) return null
      const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike
      if (Number.isNaN(d.getTime())) return null
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const produtoNormalizado = normalizeProduct(appItem.produto || 'aplicativo')
    const subProdutoNormalizado = (produtoNormalizado === 'web' || produtoNormalizado === 'aplicativo')
      ? normalizeSubProduct(appItem.subProduto || '')
      : null

    return {
      // id é autogerado no insert; em update não enviar id no payload
      titulo: appItem.nome || '',
      descricao,
      produto: produtoNormalizado,
      sub_produto: subProdutoNormalizado,
      status: appItem.status || 'nao_iniciado',
      prioridade: appItem.prioridade || 'media',
      data_inicio: toLocalDateString(appItem.dataInicio),
              // data_fim é obrigatória para o novo sistema
      data_fim: toLocalDateString(appItem.dataFim),
      responsavel: appItem.responsavel || null,
      okr_id: appItem.okrId ? Number(appItem.okrId) : null,
      tags,
      updated_at: new Date().toISOString(),
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isMockMode()) {
        // Modo mock para desenvolvimento local
        console.log('🎭 Usando dados MOCK para desenvolvimento local')
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Carregar dados do localStorage se existirem, senão usar dados mock
        const savedItems = localStorage.getItem('mockRoadmapItems')
        const savedOKRs = localStorage.getItem('mockOKRs')
        
        if (savedItems) {
          setRoadmapItems(JSON.parse(savedItems))
        } else {
          setRoadmapItems(mockRoadmapItems)
          localStorage.setItem('mockRoadmapItems', JSON.stringify(mockRoadmapItems))
        }
        
        if (savedOKRs) {
          setOkrs(JSON.parse(savedOKRs))
        } else {
          setOkrs(mockOKRs)
          localStorage.setItem('mockOKRs', JSON.stringify(mockOKRs))
        }
        
        return
      }

      // Modo real com Supabase
      // Carregar itens do roadmap
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('roadmap_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (roadmapError) {
        console.error('Erro ao carregar itens do roadmap:', roadmapError)
        // Fallback para localStorage se houver erro
        const savedItems = localStorage.getItem('roadmapItems')
        if (savedItems) {
          setRoadmapItems(JSON.parse(savedItems))
        }
      } else {
        const mapped = (roadmapData || []).map(mapDbToApp)
        setRoadmapItems(mapped)
      }

      // Carregar OKRs
      const { data: okrData, error: okrError } = await supabase
        .from('okrs')
        .select('*')
        .order('created_at', { ascending: false })

      if (okrError) {
        console.error('Erro ao carregar OKRs:', okrError)
        // Fallback para localStorage se houver erro
        const savedOKRs = localStorage.getItem('okrs')
        if (savedOKRs) {
          setOkrs(JSON.parse(savedOKRs))
        }
      } else {
        const mappedOkrs = (okrData || []).map(db => ({
          id: db.id,
          objetivo: db.objetivo || db.titulo || '',
          keyResults: Array.isArray(db.key_results) ? db.key_results : [],
          created_at: db.created_at,
          updated_at: db.updated_at,
        }))
        setOkrs(mappedOkrs)
      }

    } catch (err) {
      console.error('Erro geral ao carregar dados:', err)
      setError(err.message)
      
      // Fallback para localStorage em caso de erro
      const savedItems = localStorage.getItem('roadmapItems')
      const savedOKRs = localStorage.getItem('okrs')
      
      if (savedItems) {
        setRoadmapItems(JSON.parse(savedItems))
      }
      
      if (savedOKRs) {
        setOkrs(JSON.parse(savedOKRs))
      }
    } finally {
      setLoading(false)
    }
  }

  /** Solicitações **/
  const loadSolicitacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar solicitações:', error)
        setSolicitacoes([])
        setMinhasSolicitacoes([])
        return
      }

      const session = getSession()
      const all = Array.isArray(data) ? data : []
      setSolicitacoes(all)
      if (session?.id) {
        setMinhasSolicitacoes(all.filter(s => s.user_id === session.id))
      } else if (session?.email) {
        setMinhasSolicitacoes(all.filter(s => s.email_solicitante === session.email))
      } else {
        setMinhasSolicitacoes([])
      }
    } catch (err) {
      console.error('Erro geral ao carregar solicitações:', err)
      setSolicitacoes([])
      setMinhasSolicitacoes([])
    }
  }

  const deleteOwnSolicitacao = async (solicitacaoId) => {
    try {
      const session = getSession()
      const userId = session?.id
      if (!userId) throw new Error('Usuário não autenticado')
      // Apenas do próprio usuário
      const { error } = await supabase
        .from('solicitacoes')
        .delete()
        .eq('id', solicitacaoId)
        .eq('user_id', userId)
      if (error) throw error
      await loadSolicitacoes()
    } catch (e) {
      console.error('Erro ao excluir solicitação:', e)
      throw e
    }
  }

  const uploadSolicitacaoFile = async (file, userId) => {
    if (!file) return { file_url: null, file_name: null, file_type: null }
    try {
      const bucket = 'solicitacoes'
      const ext = file.name.split('.').pop()
      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
      const path = `${userId || 'anon'}/${Date.now()}_${safeName}`
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || undefined,
      })
      if (upErr) {
        console.warn('Falha no upload (seguindo sem arquivo):', upErr)
        return { file_url: null, file_name: null, file_type: null }
      }
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
      return { file_url: pub?.publicUrl || null, file_name: file.name, file_type: file.type || ext }
    } catch (e) {
      console.warn('Erro no upload (seguindo sem arquivo):', e)
      return { file_url: null, file_name: null, file_type: null }
    }
  }

  const createSolicitacao = async (payload, file) => {
    try {
      const session = getSession()
      const userId = session?.id || null
      const fileMeta = await uploadSolicitacaoFile(file, userId)
      const toDb = {
        user_id: userId,
        nome_solicitante: payload.nomeSolicitante || '',
        email_solicitante: payload.emailSolicitante || '',
        departamento: payload.departamento || '',
        produto: normalizeProduct(payload.produto || 'aplicativo'),
        sub_produto: (payload.produto === 'web' || payload.produto === 'aplicativo') ? normalizeSubProduct(payload.subProduto || '') : null,
        titulo: payload.titulo || '',
        descricao: payload.descricao || '',
        retorno_esperado: payload.retornoEsperado || '',
        file_url: fileMeta.file_url,
        file_name: fileMeta.file_name,
        file_type: fileMeta.file_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase
        .from('solicitacoes')
        .insert([toDb])
        .select()
      if (error) throw error
      await loadSolicitacoes()
      return data?.[0] || null
    } catch (err) {
      console.error('Erro ao criar solicitação:', err)
      throw err
    }
  }

  const saveRoadmapItem = async (itemData) => {
    try {
      if (isMockMode()) {
        // Modo mock - usar localStorage
        console.log('💾 Salvando item em modo MOCK:', itemData.nome)
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const currentItems = JSON.parse(localStorage.getItem('mockRoadmapItems') || '[]')
        
        if (itemData.id && itemData.id !== 'new') {
          // Atualizar item existente
          const updatedItems = currentItems.map(item => 
            item.id === itemData.id ? { ...itemData } : item
          )
          setRoadmapItems(updatedItems)
          localStorage.setItem('mockRoadmapItems', JSON.stringify(updatedItems))
        } else {
          // Criar novo item
          const newItem = {
            ...itemData,
            id: Date.now().toString()
          }
          const newItems = [...currentItems, newItem]
          setRoadmapItems(newItems)
          localStorage.setItem('mockRoadmapItems', JSON.stringify(newItems))
        }
        return
      }
      
      // Modo real com Supabase
      if (itemData.id && itemData.id !== 'new') {
        // Atualizar item existente
        const payload = mapAppToDb(itemData)
        const { data, error } = await supabase
          .from('roadmap_items')
          .update(payload)
          .eq('id', itemData.id)
          .select()

        if (error) {
          console.error('Erro ao atualizar item:', error)
          // Fallback para localStorage
          setRoadmapItems(items => 
            items.map(item => 
              item.id === itemData.id ? itemData : item
            )
          )
          localStorage.setItem('roadmapItems', JSON.stringify(roadmapItems))
        } else {
          const updated = mapDbToApp(data[0])
          setRoadmapItems(items => items.map(item => item.id === itemData.id ? updated : item))
        }
      } else {
        // Criar novo item
        const payload = mapAppToDb(itemData)
        const { data, error } = await supabase
          .from('roadmap_items')
          .insert([payload])
          .select()

        if (error) {
          console.error('Erro ao criar item:', error)
          // Fallback para localStorage
          const fallbackItem = {
            ...itemData,
            id: Date.now().toString()
          }
          setRoadmapItems(items => [...items, fallbackItem])
          localStorage.setItem('roadmapItems', JSON.stringify([...roadmapItems, fallbackItem]))
        } else {
          const created = mapDbToApp(data[0])
          setRoadmapItems(items => [...items, created])
        }
      }
    } catch (err) {
      console.error('Erro ao salvar item:', err)
      setError(err.message)
    }
  }

  const deleteRoadmapItem = async (itemId) => {
    try {
      if (isMockMode()) {
        // Modo mock - usar localStorage
        console.log('🗑️ Deletando item em modo MOCK:', itemId)
        
        const currentItems = JSON.parse(localStorage.getItem('mockRoadmapItems') || '[]')
        const updatedItems = currentItems.filter(item => item.id !== itemId)
        
        setRoadmapItems(updatedItems)
        localStorage.setItem('mockRoadmapItems', JSON.stringify(updatedItems))
        return
      }
      
      // Modo real com Supabase
      const { error } = await supabase
        .from('roadmap_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Erro ao deletar item:', error)
      }
      
      // Atualizar estado local independentemente do resultado
      setRoadmapItems(items => items.filter(item => item.id !== itemId))
      localStorage.setItem('roadmapItems', JSON.stringify(roadmapItems.filter(item => item.id !== itemId)))
    } catch (err) {
      console.error('Erro ao deletar item:', err)
      setError(err.message)
    }
  }

  const deleteRoadmapItemsBulk = async (itemIds) => {
    try {
      if (!Array.isArray(itemIds) || itemIds.length === 0) return
      const { error } = await supabase
        .from('roadmap_items')
        .delete()
        .in('id', itemIds)

      if (error) {
        console.error('Erro ao deletar itens em massa:', error)
      }

      setRoadmapItems(items => items.filter(item => !itemIds.includes(item.id)))
      const remaining = roadmapItems.filter(item => !itemIds.includes(item.id))
      localStorage.setItem('roadmapItems', JSON.stringify(remaining))
    } catch (err) {
      console.error('Erro ao deletar itens em massa:', err)
      setError(err.message)
    }
  }

  const updateRoadmapItemStatus = async (itemId, newStatus) => {
    try {
      if (isMockMode()) {
        // Modo mock - usar localStorage
        console.log('🔄 Atualizando status em modo MOCK:', itemId, newStatus)
        
        const currentItems = JSON.parse(localStorage.getItem('mockRoadmapItems') || '[]')
        const updatedItems = currentItems.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
        
        setRoadmapItems(updatedItems)
        localStorage.setItem('mockRoadmapItems', JSON.stringify(updatedItems))
        return
      }
      
      // Modo real com Supabase
      const { error } = await supabase
        .from('roadmap_items')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) {
        console.error('Erro ao atualizar status:', error)
      }
      
      // Atualizar estado local
      setRoadmapItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      )
      localStorage.setItem('roadmapItems', JSON.stringify(roadmapItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )))
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      setError(err.message)
    }
  }

  const saveOKR = async (okrData) => {
    try {
      const toDb = (okr) => ({
        objetivo: okr.objetivo,
        titulo: okr.objetivo, // compat: alguns esquemas exigem titulo NOT NULL
        key_results: okr.keyResults || [],
        updated_at: new Date().toISOString(),
      })
      if (okrData.id && okrData.id !== 'new') {
        // Atualizar OKR existente
        const { data, error } = await supabase
          .from('okrs')
          .update(toDb(okrData))
          .eq('id', okrData.id)
          .select()

        if (error) {
          console.error('Erro ao atualizar OKR:', error)
          // Fallback para localStorage
          setOkrs(okrs => 
            okrs.map(okr => 
              okr.id === okrData.id ? okrData : okr
            )
          )
          localStorage.setItem('okrs', JSON.stringify(okrs))
        } else {
          const updated = {
            id: data[0].id,
            objetivo: data[0].objetivo || data[0].titulo || '',
            keyResults: Array.isArray(data[0].key_results) ? data[0].key_results : [],
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
          }
          setOkrs(okrs => okrs.map(okr => okr.id === okrData.id ? updated : okr))
        }
      } else {
        // Criar novo OKR
        const payload = {
          ...toDb(okrData),
          created_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('okrs')
          .insert([payload])
          .select()

        if (error) {
          console.error('Erro ao criar OKR:', error)
          // Fallback para localStorage
          const fallbackOKR = {
            ...okrData,
            id: Date.now().toString()
          }
          setOkrs(okrs => [...okrs, fallbackOKR])
          localStorage.setItem('okrs', JSON.stringify([...okrs, fallbackOKR]))
        } else {
          const created = {
            id: data[0].id,
            objetivo: data[0].objetivo || data[0].titulo || '',
            keyResults: Array.isArray(data[0].key_results) ? data[0].key_results : [],
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
          }
          setOkrs(okrs => [...okrs, created])
        }
      }
    } catch (err) {
      console.error('Erro ao salvar OKR:', err)
      setError(err.message)
    }
  }

  const deleteOKR = async (okrId) => {
    try {
      const { error } = await supabase
        .from('okrs')
        .delete()
        .eq('id', okrId)

      if (error) {
        console.error('Erro ao deletar OKR:', error)
      }
      
      // Atualizar estado local
      setOkrs(okrs => okrs.filter(okr => okr.id !== okrId))
      localStorage.setItem('okrs', JSON.stringify(okrs.filter(okr => okr.id !== okrId)))
      
      // Remover vinculação dos itens do roadmap
      setRoadmapItems(items =>
        items.map(item =>
          item.okrId === okrId ? { ...item, okrId: null } : item
        )
      )
    } catch (err) {
      console.error('Erro ao deletar OKR:', err)
      setError(err.message)
    }
  }

  return {
    roadmapItems,
    okrs,
    solicitacoes,
    minhasSolicitacoes,
    loading,
    error,
    saveRoadmapItem,
    deleteRoadmapItem,
    deleteRoadmapItemsBulk,
    updateRoadmapItemStatus,
    saveOKR,
    deleteOKR,
    reloadData: loadData,
    loadSolicitacoes,
    deleteOwnSolicitacao,
    createSolicitacao,
    /**
     * Upsert por chave natural: titulo + produto + data_inicio
     * Evita duplicação em importações
     */
    upsertRoadmapItemByKey: async (appItem) => {
      try {
        const dateStr = (() => {
          if (!appItem.dataInicio) return null
          const d = appItem.dataInicio instanceof Date ? appItem.dataInicio : new Date(appItem.dataInicio)
          if (Number.isNaN(d.getTime())) return null
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${day}`
        })()

        if (!appItem.nome || !appItem.produto) {
          throw new Error('Item e Produto são obrigatórios')
        }

        let existingId = null
        if (dateStr) {
          const { data: found, error: findError } = await supabase
            .from('roadmap_items')
            .select('id')
            .eq('titulo', appItem.nome)
            .eq('produto', appItem.produto)
            .eq('data_inicio', dateStr)
            .limit(1)

          if (findError) {
            console.warn('Falha ao buscar item existente (prosseguindo com insert):', findError)
          } else if (found && found.length > 0) {
            existingId = found[0].id
          }
        }

        if (existingId) {
          return await saveRoadmapItem({ ...appItem, id: existingId })
        }
        return await saveRoadmapItem({ ...appItem, id: undefined })
      } catch (e) {
        console.error('Erro no upsert do item:', e)
        throw e
      }
    }
  }
}

