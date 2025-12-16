import { useState } from 'react'
import { Input } from '@/components/ui/input'
import OKRManager from './OKRManager'
import OKRProgress from './OKRProgress'

const OKRsPage = ({ okrs, roadmapItems, onSaveOKR, onDeleteOKR }) => {
  const [activeTab, setActiveTab] = useState('manage')

  return (
    <div className="w-full space-y-6">
      {/* Abas no mesmo layout das abas de produto do Roadmap */}
      <div className="product-tabs">
        <div className="flex space-x-0">
          <button
            className={`product-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Gerenciar OKRs
          </button>
          <button
            className={`product-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progresso OKRs
          </button>
        </div>
      </div>

      {/* Barra de controles semelhante (busca alinhada) */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2"></div>
        <div className="relative ml-auto">
          <Input className="pl-8 w-64" placeholder="Buscar OKRs..." />
        </div>
      </div>

      {/* Conteúdo */}
      {activeTab === 'manage' ? (
        <div className="bg-white p-6 rounded-lg border">
          <OKRManager
            okrs={okrs}
            roadmapItems={roadmapItems}
            onSaveOKR={onSaveOKR}
            onDeleteOKR={onDeleteOKR}
            asPage={true}
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border">
          <OKRProgress okrs={okrs} roadmapItems={roadmapItems} />
        </div>
      )}
    </div>
  )
}

export default OKRsPage


