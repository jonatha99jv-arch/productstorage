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
        setRoadmapItems(roadmapData || [])
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
        const { data, error } = await supabase
          .from('roadmap_items')
          .update(itemData)
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
          setRoadmapItems(items => 
            items.map(item => 
              item.id === itemData.id ? data[0] : item
            )
          )
        }
      } else {
        // Criar novo item
        const newItem = {
          ...itemData,
          id: undefined, // Deixar o Supabase gerar o ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('roadmap_items')
          .insert([newItem])
          .select()

        if (error) {
          console.error('Erro ao criar item:', error)
          // Fallback para localStorage
          const fallbackItem = {
            ...newItem,
            id: Date.now().toString()
          }
          setRoadmapItems(items => [...items, fallbackItem])
          localStorage.setItem('roadmapItems', JSON.stringify([...roadmapItems, fallbackItem]))
        } else {
          setRoadmapItems(items => [...items, data[0]])
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

