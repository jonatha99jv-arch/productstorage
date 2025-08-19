import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useSupabaseData = () => {
  const [roadmapItems, setRoadmapItems] = useState([])
  const [okrs, setOkrs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar dados do Supabase na inicialização
  useEffect(() => {
    loadData()
  }, [])

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

    // Reconstituir subitens e duracao a partir de tags
    const tags = Array.isArray(dbItem.tags) ? dbItem.tags : []
    let duracaoMeses = ''
    const subitens = []
    for (const tag of tags) {
      if (typeof tag === 'string' && tag.startsWith('duracao:')) {
        const parts = tag.split(':')
        if (parts[1]) duracaoMeses = parts[1]
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

    return {
      id: dbItem.id,
      nome: dbItem.titulo || '',
      inputOutputMetric,
      teseProduto,
      produto: dbItem.produto || 'aplicativo',
      subProduto: dbItem.sub_produto || '',
      status: dbItem.status || 'nao_iniciado',
      dataInicio: dataInicioLocal,
      duracaoMeses,
      okrId: dbItem.okr_id || '',
      subitens,
    }
  }

  const mapAppToDb = (appItem) => {
    const descricao = JSON.stringify({
      inputOutputMetric: appItem.inputOutputMetric || '',
      teseProduto: appItem.teseProduto || ''
    })

    const tags = Array.isArray(appItem.subitens) ? [...appItem.subitens] : []
    if (appItem.duracaoMeses) tags.push(`duracao:${appItem.duracaoMeses}`)

    const toLocalDateString = (dateLike) => {
      if (!dateLike) return null
      const d = typeof dateLike === 'string' ? new Date(dateLike) : dateLike
      if (Number.isNaN(d.getTime())) return null
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    return {
      // id é autogerado no insert; em update não enviar id no payload
      titulo: appItem.nome || '',
      descricao,
      produto: appItem.produto || 'aplicativo',
      sub_produto: appItem.subProduto || null,
      status: appItem.status || 'nao_iniciado',
      prioridade: appItem.prioridade || 'media',
      data_inicio: toLocalDateString(appItem.dataInicio),
      // data_fim poderia ser calculada a partir da duração, mas manteremos null
      data_fim: null,
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
        setOkrs(okrData || [])
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

  const saveRoadmapItem = async (itemData) => {
    try {
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

  const updateRoadmapItemStatus = async (itemId, newStatus) => {
    try {
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
      if (okrData.id && okrData.id !== 'new') {
        // Atualizar OKR existente
        const { data, error } = await supabase
          .from('okrs')
          .update(okrData)
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
          setOkrs(okrs => 
            okrs.map(okr => 
              okr.id === okrData.id ? data[0] : okr
            )
          )
        }
      } else {
        // Criar novo OKR
        const newOKR = {
          ...okrData,
          id: undefined, // Deixar o Supabase gerar o ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('okrs')
          .insert([newOKR])
          .select()

        if (error) {
          console.error('Erro ao criar OKR:', error)
          // Fallback para localStorage
          const fallbackOKR = {
            ...newOKR,
            id: Date.now().toString()
          }
          setOkrs(okrs => [...okrs, fallbackOKR])
          localStorage.setItem('okrs', JSON.stringify([...okrs, fallbackOKR]))
        } else {
          setOkrs(okrs => [...okrs, data[0]])
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
    loading,
    error,
    saveRoadmapItem,
    deleteRoadmapItem,
    updateRoadmapItemStatus,
    saveOKR,
    deleteOKR,
    reloadData: loadData
  }
}

