import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Plus, Settings, BarChart3 } from 'lucide-react'
import RoadmapTableImproved from './components/RoadmapTableImproved'
import OKRManager from './components/OKRManager'
import OKRProgress from './components/OKRProgress'
import ItemModalImproved from './components/ItemModalImproved'
import ProductTabs from './components/ProductTabs'
import './App.css'

function App() {
  const [roadmapItems, setRoadmapItems] = useState([])
  const [okrs, setOkrs] = useState([])
  const [showOKRManager, setShowOKRManager] = useState(false)
  const [showOKRProgress, setShowOKRProgress] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [currentProduct, setCurrentProduct] = useState('aplicativo')
  const [currentSubProduct, setCurrentSubProduct] = useState('')

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedItems = localStorage.getItem('roadmapItems')
    const savedOKRs = localStorage.getItem('okrs')
    
    if (savedItems) {
      setRoadmapItems(JSON.parse(savedItems))
    }
    
    if (savedOKRs) {
      setOkrs(JSON.parse(savedOKRs))
    }
  }, [])

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('roadmapItems', JSON.stringify(roadmapItems))
  }, [roadmapItems])

  useEffect(() => {
    localStorage.setItem('okrs', JSON.stringify(okrs))
  }, [okrs])

  const handleAddItem = () => {
    setEditingItem(null)
    setShowItemModal(true)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setShowItemModal(true)
  }

  const handleSaveItem = (itemData) => {
    if (editingItem) {
      // Editar item existente
      setRoadmapItems(items => 
        items.map(item => 
          item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item
        )
      )
    } else {
      // Adicionar novo item
      const newItem = {
        ...itemData,
        id: Date.now().toString() // ID simples baseado em timestamp
      }
      setRoadmapItems(items => [...items, newItem])
    }
    setShowItemModal(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (itemId) => {
    setRoadmapItems(items => items.filter(item => item.id !== itemId))
  }

  const handleUpdateItemStatus = (itemId, newStatus) => {
    setRoadmapItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    )
  }

  const handleSaveOKR = (okrData) => {
    if (okrData.id) {
      // Editar OKR existente
      setOkrs(okrs => 
        okrs.map(okr => 
          okr.id === okrData.id ? okrData : okr
        )
      )
    } else {
      // Adicionar novo OKR
      const newOKR = {
        ...okrData,
        id: Date.now().toString()
      }
      setOkrs(okrs => [...okrs, newOKR])
    }
  }

  const handleDeleteOKR = (okrId) => {
    setOkrs(okrs => okrs.filter(okr => okr.id !== okrId))
    // Remover vinculação dos itens do roadmap
    setRoadmapItems(items =>
      items.map(item =>
        item.okrId === okrId ? { ...item, okrId: null } : item
      )
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-company-dark-blue shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">
              Roadmap Interativo - {getPageTitle()}
            </h1>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowOKRProgress(true)}
                variant="outline"
                className="flex items-center space-x-2 bg-white text-company-dark-blue border-white hover:bg-gray-100"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Progresso OKRs</span>
              </Button>
              <Button
                onClick={() => setShowOKRManager(true)}
                variant="outline"
                className="flex items-center space-x-2 bg-white text-company-dark-blue border-white hover:bg-gray-100"
              >
                <Settings className="h-4 w-4" />
                <span>Gerenciar OKRs</span>
              </Button>
              <Button
                onClick={handleAddItem}
                className="flex items-center space-x-2 bg-company-orange hover:bg-company-red-orange text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Item</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        />
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

