import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { useSupabaseData } from './hooks/useSupabaseData'
import { Button } from '@/components/ui/button.jsx'
import { Plus, Settings, BarChart3, RefreshCw, Users, User, LogOut } from 'lucide-react'
import RoadmapTableImproved from './components/RoadmapTableImproved'
import OKRManager from './components/OKRManager'
import BulkImportModal from './components/BulkImportModal'
import OKRProgress from './components/OKRProgress'
import ItemModalImproved from './components/ItemModalImproved'
import ProductTabs from './components/ProductTabs'
import DatabaseSetup from './components/DatabaseSetup'
import './App.css'
import Login from './components/Login'
import UsersAdmin from './components/UsersAdmin'
import ProfileEdit from './components/ProfileEdit'
import { getSession, requireRole, logout } from './lib/auth'

function App() {
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false)
  const [databaseReady, setDatabaseReady] = useState(false)
  
  const {
    roadmapItems,
    okrs,
    loading,
    error,
    saveRoadmapItem,
    deleteRoadmapItem,
    updateRoadmapItemStatus,
    saveOKR,
    deleteOKR,
    reloadData,
    deleteRoadmapItemsBulk
  } = useSupabaseData()

  const [showOKRManager, setShowOKRManager] = useState(false)
  const [showOKRProgress, setShowOKRProgress] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [currentProduct, setCurrentProduct] = useState('aplicativo')
  const [currentSubProduct, setCurrentSubProduct] = useState('')

  // Verificar se o banco de dados está configurado
  useEffect(() => {
    checkDatabaseSetup()
  }, [])

  const checkDatabaseSetup = async () => {
    try {
      // Tentar fazer uma consulta simples para verificar se as tabelas existem
      const { error: okrError } = await supabase
        .from('okrs')
        .select('id')
        .limit(1)

      const { error: roadmapError } = await supabase
        .from('roadmap_items')
        .select('id')
        .limit(1)

      if (okrError || roadmapError) {
        // Se houver erro, provavelmente as tabelas não existem
        if ((okrError && okrError.code === '42P01') || (roadmapError && roadmapError.code === '42P01')) {
          setShowDatabaseSetup(true)
        } else {
          // Outros erros, assumir que o banco está configurado
          setDatabaseReady(true)
        }
      } else {
        // Sem erros, banco está configurado
        setDatabaseReady(true)
      }
    } catch (error) {
      console.error('Erro ao verificar configuração do banco:', error)
      setShowDatabaseSetup(true)
    }
  }

  const handleDatabaseSetupComplete = () => {
    setShowDatabaseSetup(false)
    setDatabaseReady(true)
  }

  const session = getSession()
  if (!session) {
    return <Login onSuccess={() => window.location.reload()} />
  }

  // Se precisar configurar o banco, mostrar tela de configuração
  if (showDatabaseSetup) {
    return <DatabaseSetup onSetupComplete={handleDatabaseSetupComplete} />
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setShowItemModal(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowItemModal(true)
  }

  const handleSaveItem = async (itemData) => {
    await saveRoadmapItem(itemData)
    setShowItemModal(false)
    setEditingItem(null)
  }

  const handleDeleteItem = async (itemId) => {
    await deleteRoadmapItem(itemId)
  }

  const handleDeleteBulk = async (ids) => {
    if (!ids || ids.length === 0) return
    if (window.confirm(`Excluir ${ids.length} item(ns)?`)) {
      // função vem do hook
      if (typeof deleteRoadmapItemsBulk === 'function') {
        await deleteRoadmapItemsBulk(ids)
      }
    }
  }

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    await updateRoadmapItemStatus(itemId, newStatus)
  }

  const handleSaveOKR = async (okrData) => {
    await saveOKR(okrData)
  }

  const handleDeleteOKR = async (okrId) => {
    await deleteOKR(okrId)
  }

  const handleProductChange = (productId) => {
    setCurrentProduct(productId)
    setCurrentSubProduct('')
  }

  const handleSubProductChange = (subProductId) => {
    setCurrentSubProduct(subProductId)
  }

  // Filtrar itens baseado no produto e sub-produto atual
  const getFilteredItems = () => {
    return roadmapItems.filter(item => {
      const matchesProduct = item.produto === currentProduct
      
      if (currentProduct === 'web') {
        if (currentSubProduct === 'geral') {
          return matchesProduct && (!item.subProduto || item.subProduto === '')
        } else {
          return matchesProduct && item.subProduto === currentSubProduct
        }
      }
      
      return matchesProduct
    })
  }

  const getPageTitle = () => {
    let title = currentProduct.charAt(0).toUpperCase() + currentProduct.slice(1)
    
    if (currentProduct === 'web' && currentSubProduct && currentSubProduct !== 'geral') {
      const subProductLabels = {
        'backoffice': 'Backoffice',
        'portal_estrela': 'Portal Estrela',
        'doctor': 'Doctor',
        'company': 'Company'
      }
      title += ` - ${subProductLabels[currentSubProduct] || currentSubProduct}`
    }
    
    return title
  }

  const [activePage, setActivePage] = useState('roadmap')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden sm:block w-64 bg-white border-r p-4 space-y-2">
        <div className="text-lg font-semibold text-company-dark-blue mb-2">Menu</div>
        {requireRole('admin') && (
          <button onClick={()=>setActivePage('users')} className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${activePage==='users'?'bg-gray-100':''}`}>
            <Users className="h-4 w-4" />
            Gerenciar Usuários
          </button>
        )}
        <button onClick={()=>setActivePage('profile')} className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${activePage==='profile'?'bg-gray-100':''}`}>
          <User className="h-4 w-4" />
          Edição de Perfil
        </button>
        <div className="pt-6" />
        <button onClick={()=>{ logout(); window.location.reload() }} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-red-600 mt-auto">
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </aside>
      <div className="flex-1">
      {/* Header */}
      <header className="bg-company-dark-blue shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Roadmap Interativo - {getPageTitle()}
            </h1>
            <div className="flex space-x-3">
              {error && (
                <div className="text-red-300 text-sm bg-red-600 px-3 py-1 rounded">
                  Erro: {error}
                </div>
              )}
              <Button
                onClick={reloadData}
                variant="outline"
                className="flex items-center space-x-2 bg-white text-company-dark-blue border-white hover:bg-gray-100"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </Button>
              <Button
                onClick={() => setShowOKRProgress(true)}
                variant="outline"
                className="flex items-center space-x-2 bg-white text-company-dark-blue border-white hover:bg-gray-100"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Progresso OKRs</span>
              </Button>
              {requireRole('admin') && (
                <Button
                  onClick={() => setShowOKRManager(true)}
                  variant="outline"
                  className="flex items-center space-x-2 bg-white text-company-dark-blue border-white hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4" />
                  <span>Gerenciar Usuários</span>
                </Button>
              )}
              <Button onClick={() => { logout(); window.location.reload() }} variant="outline" className="bg-white text-company-dark-blue border-white hover:bg-gray-100">Sair</Button>
              <Button
                onClick={handleAddItem}
                className="flex items-center space-x-2 bg-company-orange hover:bg-company-red-orange text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Item</span>
              </Button>
              <BulkImportModal onImport={handleSaveItem} onUpsert={async (payload) => {
                await saveRoadmapItem(payload)
              }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage==='roadmap' && loading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-company-dark-blue" />
              <span className="text-company-dark-blue">Carregando dados...</span>
            </div>
          </div>
        )}
        
        {!loading && activePage==='roadmap' && (
          <>
            {/* Abas de Produtos */}
            <ProductTabs
              currentProduct={currentProduct}
              currentSubProduct={currentSubProduct}
              onProductChange={handleProductChange}
              onSubProductChange={handleSubProductChange}
            />

            {/* Tabela do Roadmap */}
            <RoadmapTableImproved
              items={getFilteredItems()}
              okrs={okrs}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onUpdateItemStatus={handleUpdateItemStatus}
              currentProduct={currentProduct}
              currentSubProduct={currentSubProduct}
              onDeleteBulk={handleDeleteBulk}
            />
            {activePage==='users' && requireRole('admin') && (
              <div className="mt-6">
                <UsersAdmin />
              </div>
            )}
          </>
        )}
        {activePage==='profile' && (
          <ProfileEdit />
        )}
      </main>

      {/* Modals */}
      {showItemModal && (
        <ItemModalImproved
          item={editingItem}
          okrs={okrs}
          onSave={handleSaveItem}
          onClose={() => {
            setShowItemModal(false)
            setEditingItem(null)
          }}
        />
      )}

      {showOKRManager && (
        <OKRManager
          okrs={okrs}
          roadmapItems={roadmapItems}
          onSaveOKR={handleSaveOKR}
          onDeleteOKR={handleDeleteOKR}
          onClose={() => setShowOKRManager(false)}
        />
      )}

      {showOKRProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-company-dark-blue">Progresso dos OKRs</h2>
              <Button
                variant="outline"
                onClick={() => setShowOKRProgress(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <OKRProgress okrs={okrs} roadmapItems={roadmapItems} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App


// Teste git