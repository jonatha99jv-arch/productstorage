import { useState } from 'react'
import { CareerModal } from './CareerModal'
import { careerLevels, getCareerStatus } from '../data/careerData'
import { 
  User, 
  Briefcase, 
  Users, 
  Crown, 
  Building, 
  Zap,
  GitBranch 
} from 'lucide-react'

export const YCareerDiagram = ({ user }) => {
  const [selectedLevel, setSelectedLevel] = useState(null)
  
  console.log('YCareerDiagram renderizando com user:', user)
  
  if (!user) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-500">Carregando dados do usuário...</p>
      </div>
    )
  }

  const handleLevelClick = (level) => {
    setSelectedLevel(level)
  }

  const closeModal = () => {
    setSelectedLevel(null)
  }

  // Organizar os níveis de acordo com a estrutura Y
  const juniorLevel = careerLevels.find(l => l.id === 'junior-backend')
  const plenoLevel = careerLevels.find(l => l.id === 'pleno-backend')
  const seniorLevel = careerLevels.find(l => l.id === 'senior-backend')
  
  // Trilha de gestão (lado direito)
  const techLeadLevel = careerLevels.find(l => l.id === 'tech-lead')
  const techManagerLevel = careerLevels.find(l => l.id === 'tech-manager')
  
  // Trilha técnica (lado esquerdo)
  const staffLevel = careerLevels.find(l => l.id === 'staff-backend')
  const principalLevel = careerLevels.find(l => l.id === 'principal-backend')

  const getIconForLevel = (levelId) => {
    switch(levelId) {
      case 'junior-backend': return User
      case 'pleno-backend': return Briefcase
      case 'senior-backend': return Zap
      case 'staff-backend': return Crown
      case 'principal-backend': return User
      case 'tech-lead': return Users
      case 'tech-manager': return Building
      default: return User
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-gray-400 border-gray-400'
      case 'current': return 'bg-green-500 border-green-500'
      case 'next': return 'bg-blue-500 border-blue-500'
      default: return 'bg-gray-200 border-gray-300'
    }
  }

  const renderCareerNode = (level) => {
    if (!level) return null
    
    const status = getCareerStatus(level.id, user.currentLevel)
    const Icon = getIconForLevel(level.id)
    
    return (
      <div 
        className="flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105"
        onClick={() => handleLevelClick(level)}
      >
        <div className={`
          w-16 h-16 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 group-hover:shadow-lg
          ${getStatusColor(status)}
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="mt-3 text-center">
          <div className="font-medium text-sm text-gray-900">{level.title}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GitBranch className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Trilha de Carreira - {user.name}
            </h1>
          </div>
          <p className="text-gray-600 mb-8">
            Posição atual: <strong>{user.currentLevel}</strong>
          </p>
        </div>

        {/* Y Diagram Structure */}
        <div className="relative max-w-4xl mx-auto">
          {/* Headers das Trilhas */}
          <div className="flex justify-between mb-12 px-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Trilha Técnica</h2>
              <p className="text-sm text-gray-500">Especialista em Tecnologia</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-1">Trilha de Gestão</h2>
              <p className="text-sm text-gray-500">Liderança e Estratégia</p>
            </div>
          </div>

          {/* Posições do topo */}
          <div className="flex justify-between mb-16 px-8">
            {/* Principal Engineer */}
            <div className="text-center">
              {renderCareerNode(principalLevel)}
              <div className="mt-2 text-sm text-gray-500">Especialista Principal</div>
            </div>
            
            {/* Tech Manager */}
            <div className="text-center">
              {renderCareerNode(techManagerLevel)}
              <div className="mt-2 text-sm text-gray-500">Gerente de Tecnologia</div>
            </div>
          </div>

          {/* Posições do meio */}
          <div className="flex justify-between mb-16 px-20">
            {/* Staff Engineer */}
            <div className="text-center">
              {renderCareerNode(staffLevel)}
              <div className="mt-2 text-sm text-gray-500">Arquiteto de Software</div>
            </div>
            
            {/* Tech Lead */}
            <div className="text-center">
              {renderCareerNode(techLeadLevel)}
              <div className="mt-2 text-sm text-gray-500">Líder Técnico</div>
            </div>
          </div>

          {/* Linhas de Conexão mais sutis */}
          <svg 
            className="absolute pointer-events-none z-0" 
            style={{ 
              top: '170px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              width: '320px', 
              height: '140px'
            }}
          >
            {/* Staff Engineer para Senior */}
            <path 
              d="M 80 20 Q 120 60 160 100" 
              stroke="#60A5FA" 
              strokeWidth="2"
              fill="none"
              opacity="0.4"
              strokeDasharray="5,5"
            />
            {/* Tech Lead para Senior */}
            <path 
              d="M 240 20 Q 200 60 160 100" 
              stroke="#10B981" 
              strokeWidth="2"
              fill="none"
              opacity="0.4"
              strokeDasharray="5,5"
            />
          </svg>

          {/* Níveis Base Comuns */}
          <div className="flex flex-col items-center space-y-16 relative z-10">
            {/* Senior - Tech Lead */}
            <div className="text-center">
              {renderCareerNode(seniorLevel)}
              <div className="mt-2 text-sm text-gray-500">Desenvolvedor Sênior</div>
              
              {/* Linha vertical para Pleno */}
              <div className="w-px h-12 bg-gray-300 mx-auto mt-6 opacity-40"></div>
            </div>
            
            {/* Pleno */}
            <div className="text-center">
              {renderCareerNode(plenoLevel)}
              <div className="mt-2 text-sm text-gray-500">Desenvolvedor Pleno</div>
              
              {/* Linha vertical para Junior */}
              <div className="w-px h-12 bg-gray-300 mx-auto mt-6 opacity-40"></div>
            </div>
            
            {/* Junior */}
            <div className="text-center">
              {renderCareerNode(juniorLevel)}
              <div className="mt-2 text-sm text-gray-500">Desenvolvedor Júnior</div>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex justify-center mt-16">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Concluído</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Atual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Próximo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></div>
                <span>Futuro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Career Modal */}
        {selectedLevel && (
          <CareerModal
            level={selectedLevel}
            status={getCareerStatus(selectedLevel.id, user.currentLevel)}
            isOpen={!!selectedLevel}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  )
}