import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp } from 'lucide-react'

const OKRProgress = ({ okrs, roadmapItems }) => {
  // Calcular progresso de cada OKR baseado nos itens concluídos
  const calculateOKRProgress = (okrId) => {
    const linkedItems = roadmapItems.filter(item => item.okrId === okrId)
    if (linkedItems.length === 0) return 0
    
    const completedItems = linkedItems.filter(item => item.status === 'concluida')
    return Math.round((completedItems.length / linkedItems.length) * 100)
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-company-orange'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getLinkedItemsCount = (okrId) => {
    return roadmapItems.filter(item => item.okrId === okrId).length
  }

  const getCompletedItemsCount = (okrId) => {
    return roadmapItems.filter(item => item.okrId === okrId && item.status === 'concluida').length
  }

  if (okrs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-company-dark-blue">
            <Target className="h-5 w-5" />
            <span>Progresso dos OKRs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum OKR cadastrado ainda.</p>
            <p className="text-sm">Crie OKRs para acompanhar o progresso.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-company-dark-blue">
          <Target className="h-5 w-5" />
          <span>Progresso dos OKRs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {okrs.map(okr => {
            const progress = calculateOKRProgress(okr.id)
            const linkedCount = getLinkedItemsCount(okr.id)
            const completedCount = getCompletedItemsCount(okr.id)
            
            return (
              <div key={okr.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-company-dark-blue">{okr.objetivo}</h4>
                    <div className="text-sm text-gray-600 mt-1">
                      {completedCount} de {linkedCount} itens concluídos
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-company-orange" />
                    <span className="font-semibold text-company-dark-blue">{progress}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Key Results */}
                <div className="ml-4 space-y-1">
                  <div className="text-xs font-medium text-gray-700">Key Results:</div>
                  {okr.keyResults.map((kr, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                      <span className="text-company-orange">•</span>
                      <span>{kr}</span>
                    </div>
                  ))}
                </div>
                
                {linkedCount > 0 && (
                  <div className="ml-4 space-y-1">
                    <div className="text-xs font-medium text-gray-700">Itens Vinculados:</div>
                    {roadmapItems
                      .filter(item => item.okrId === okr.id)
                      .map(item => (
                        <div key={item.id} className="text-xs text-gray-600 flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'concluida' ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span>{item.nome}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default OKRProgress

