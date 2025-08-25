import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  Target, 
  BookOpen, 
  Users, 
  TrendingUp,
  FileText,
  ExternalLink,
  UserCheck,
  Briefcase,
  X
} from 'lucide-react'

export const CareerModal = ({ level, status, isOpen, onClose }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        )
      case 'current':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Posição Atual
          </Badge>
        )
      case 'next':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Target className="w-3 h-3 mr-1" />
            Próximo Nível
          </Badge>
        )
      case 'future':
        return (
          <Badge variant="secondary">
            <TrendingUp className="w-3 h-3 mr-1" />
            Nível Futuro
          </Badge>
        )
    }
  }

  const getTrackLabel = (track) => {
    return track === 'technical' ? 'Especialista Técnico' : 'Gestão'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                One Pager - Papel do {level.title} na Starbem
              </h2>
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(status)}
                <Badge variant="outline">
                  {getTrackLabel(level.track)}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8 pb-6">
            {/* Visão Geral */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Visão Geral
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {level.description}
              </p>
            </div>

            {/* Responsabilidades */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Responsabilidades
              </h3>
              <ul className="space-y-3">
                {level.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    <span className="text-gray-900">• {responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Uso de Inteligência Artificial */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Uso de Inteligência Artificial
              </h3>
              <ul className="space-y-2">
                <li className="text-sm leading-relaxed">
                  <span className="text-gray-600">
                    • Implementa soluções baseadas em IA para otimização de processos internos e desenvolvimento de produtos.
                  </span>
                </li>
                <li className="text-sm leading-relaxed">
                  <span className="text-gray-600">
                    • Pesquisa novas abordagens e ferramentas de IA para melhorar a produtividade e eficiência da empresa.
                  </span>
                </li>
                <li className="text-sm leading-relaxed">
                  <span className="text-gray-600">
                    • Define padrões de uso de IA e contribui para a capacitação do time no uso dessas tecnologias.
                  </span>
                </li>
                <li className="text-sm leading-relaxed">
                  <span className="text-gray-600">
                    • Avalia riscos e melhores práticas de governança e segurança relacionados ao uso de IA.
                  </span>
                </li>
              </ul>
            </div>

            {/* Impacto no Negócio */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Impacto no Negócio
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                O {level.title} na Starbem não apenas lidera tecnicamente, mas também direciona o futuro 
                tecnológico da empresa. Seu papel é essencial para garantir que a tecnologia suporte o 
                crescimento do negócio, melhore a experiência do usuário e aumente a eficiência operacional de 
                maneira sustentável.
              </p>
            </div>

            {/* Habilidades Técnicas */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Habilidades Técnicas Requeridas
              </h3>
              <div className="flex flex-wrap gap-2">
                {level.technicalSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Habilidades Comportamentais */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Habilidades Comportamentais
              </h3>
              <div className="flex flex-wrap gap-2">
                {level.behavioralSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Indicadores de Performance */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Indicadores de Performance
              </h3>
              <div className="grid gap-2">
                {level.performanceIndicators.map((indicator, index) => (
                  <div key={index} className="text-sm leading-relaxed">
                    <span className="text-gray-600">• {indicator}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusão */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Conclusão
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Ser um {level.title} na Starbem significa atuar na interseção entre tecnologia e estratégia 
                em seu nível mais alto, influenciando decisões críticas e garantindo que a empresa se mantenha 
                inovadora e competitiva.
              </p>
            </div>

            {/* Recursos de Desenvolvimento */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {/* Cursos */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-company-dark-blue" />
                  Cursos Recomendados
                </h4>
                <div className="space-y-2">
                  {level.resources.courses.map((course, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                      {course}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Mentores */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-company-dark-blue" />
                  Mentores Sugeridos
                </h4>
                <div className="space-y-2">
                  {level.resources.mentors.map((mentor, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                      {mentor}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Projetos */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-company-dark-blue" />
                  Projetos de Desenvolvimento
                </h4>
                <div className="space-y-2">
                  {level.resources.projects.map((project, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                      {project}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t flex-shrink-0">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button className="bg-company-dark-blue hover:bg-company-dark-blue/90">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Plano de Desenvolvimento
          </Button>
        </div>
      </div>
    </div>
  )
}
