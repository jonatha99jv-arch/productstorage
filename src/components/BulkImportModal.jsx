import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const REQUIRED_HEADERS = [
  'Item',
  'Data de Início',
  'Data Final',
  'Input/Output Metric',
  'Tese de Produto',
  'Status',
  'Produto'
]

// Cabeçalhos opcionais
const OPTIONAL_HEADERS = ['Subproduto', 'Duração', 'Descrição', 'Subitens', 'Ano'] // 'Descrição', 'Subitens' e 'Ano' são opcionais

const subProductMap = {
  'geral': 'geral',
  'backoffice': 'backoffice',
  'portal estrela': 'portal_estrela',
  'portal_estrela': 'portal_estrela',
  'doctor': 'doctor',
  'company': 'company',
  'brasil': 'brasil',
  'global': 'global',
  'nr1': 'nr1',
}

const normalizeText = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const normalizeProduct = (value) => {
  const key = normalizeText(value)
  if (['aplicativo','jornada_profissional','parcerias','hr_experience','ai','automacao'].includes(key)) return key
  return 'aplicativo'
}

// Função para migrar produtos/subprodutos baseado nas novas regras
const migrateProductSubProduct = (item) => {
  const { produto, subProduto, nome } = item
  
  // Mapeamento de subprodutos para produtos corretos
  const subProductToProductMap = {
    'company': 'hr_experience',
    'nr1': 'hr_experience',
    'portal_estrela': 'aplicativo',
    'brasil': 'aplicativo',
    'global': 'aplicativo',
    'backoffice': 'jornada_profissional',
    'doctor': 'jornada_profissional'
  }
  
  // Se temos um subproduto, determinar o produto correto baseado nele
  if (subProduto && subProductToProductMap[subProduto]) {
    const produtoCorreto = subProductToProductMap[subProduto]
    
    // Se o produto atual não é o correto, migrar
    if (produto !== produtoCorreto) {
      console.log(`🔄 Migrando item "${nome}" de ${produto}/${subProduto} para ${produtoCorreto}/${subProduto}`)
      return {
        ...item,
        produto: produtoCorreto,
        subProduto: subProduto
      }
    }
  }
  
  // Casos específicos de migração baseados no produto atual
  // Se o subproduto é 'company' e o produto é 'jornada_profissional', migrar para 'hr_experience'
  if (subProduto === 'company' && produto === 'jornada_profissional') {
    console.log(`🔄 Migrando item "${nome}" de Jornada do Profissional/Company para HR Experience/Company`)
    return {
      ...item,
      produto: 'hr_experience',
      subProduto: 'company'
    }
  }
  
  // Se o subproduto é 'portal_estrela' e o produto é 'jornada_profissional', migrar para 'aplicativo'
  if (subProduto === 'portal_estrela' && produto === 'jornada_profissional') {
    console.log(`🔄 Migrando item "${nome}" de Jornada do Profissional/Portal Estrela para Jornada do Paciente/Portal Estrela`)
    return {
      ...item,
      produto: 'aplicativo',
      subProduto: 'portal_estrela'
    }
  }
  
  // Retornar item sem alterações se não precisar de migração
  return item
}

const statusMap = {
  'Não Iniciado': 'nao_iniciado',
  'Proxima Sprint': 'proxima_sprint',
  'Próxima Sprint': 'proxima_sprint',
  'Sprint Atual': 'sprint_atual',
  'Em Finalização': 'em_finalizacao',
  'Concluída': 'concluida',
  'Concluida': 'concluida'
}

function normalizeDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  // Tentar parse dd/mm/yyyy
  if (typeof value === 'string' && value.includes('/')) {
    const [dd, mm, yyyy] = value.split('/').map(Number)
    if (dd && mm && yyyy) return new Date(yyyy, mm - 1, dd)
  }
  // Datas numéricas do Excel
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value)
    if (d) return new Date(d.y, d.m - 1, d.d)
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const BulkImportModal = ({ onImport, onUpsert }) => {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = async (file) => {
    setIsProcessing(true)
    setLogs([])
    setSuccessCount(0)
    setErrorCount(0)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      if (rows.length < 2) throw new Error('Planilha vazia')
      const headers = rows[0].map(h => String(h || '').trim())
      const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h))
      if (missing.length) throw new Error(`Colunas obrigatórias ausentes: ${missing.join(', ')}`)

      const idx = Object.fromEntries(headers.map((h, i) => [h, i]))

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row || row.length === 0) continue
        const item = String(row[idx['Item']] || '').trim()
        const dataInicio = normalizeDate(row[idx['Data de Início']])
        const dataFinal = normalizeDate(row[idx['Data Final']])
        const duracao = String(row[idx['Duração']] || '').trim() // Manter para compatibilidade
        const metric = String(row[idx['Input/Output Metric']] || '').trim()
        const tese = String(row[idx['Tese de Produto']] || '').trim()
        const descricao = idx['Descrição'] != null ? String(row[idx['Descrição']] || '').trim() : ''
        const statusLabel = String(row[idx['Status']] || '').trim()
        const produto = normalizeProduct(row[idx['Produto']])
        const subProdCell = idx['Subproduto'] != null ? row[idx['Subproduto']] : ''
        const subitensCell = idx['Subitens'] != null ? row[idx['Subitens']] : ''
        const anoCell = idx['Ano'] != null ? row[idx['Ano']] : ''
        const anoRef = (() => {
          const parsed = Number(anoCell)
          if (Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100) return parsed
          return null
        })()
        let subProduto = ''
        if (produto === 'jornada_profissional' || produto === 'aplicativo' || produto === 'hr_experience') {
          const key = normalizeText(subProdCell || 'geral')
          subProduto = subProductMap[key] || ''
        }

        // Processar subitens se fornecidos
        let subitens = []
        if (subitensCell) {
          const subitensList = String(subitensCell).split(';').map(s => s.trim()).filter(s => s)
          subitens = subitensList.map(subitem => ({ texto: subitem, status: 'nao_iniciado' }))
        }

        if (!item) {
          setLogs(prev => [...prev, `Linha ${r + 1}: Item vazio`])
          setErrorCount(c => c + 1)
          continue
        }

        // Processar data final - priorizar "Data Final", mas manter compatibilidade com "Duração"
        let dataFim = dataFinal
        const applyYear = (d) => {
          if (!d || !anoRef) return d
          const clone = new Date(d)
          if (Number.isNaN(clone.getTime())) return d
          clone.setFullYear(anoRef)
          return clone
        }
        const dataInicioAdj = applyYear(dataInicio)
        const dataFimAdj = applyYear(dataFim)
        let dataInicioFinal = dataInicioAdj
        let dataFimFinal = dataFimAdj

        // Se não tiver "Data Final", tentar calcular a partir de "Duração" (para compatibilidade)
        if (!dataFimFinal && duracao && dataInicioFinal) {
          const duracaoStr = String(duracao).trim().replace(',', '.')
          const duracaoNum = Math.ceil(parseFloat(duracaoStr))
          if (Number.isFinite(duracaoNum) && duracaoNum > 0) {
            const endDate = new Date(dataInicioFinal)
            endDate.setMonth(endDate.getMonth() + duracaoNum)
            dataFimFinal = endDate
          }
        }

        // Validar que a data final é posterior à data de início
        if (dataFimFinal && dataInicioFinal && dataFimFinal <= dataInicioFinal) {
          setLogs(prev => [...prev, `Linha ${r + 1}: Data Final deve ser posterior à Data de Início`])
          setErrorCount(c => c + 1)
          continue
        }

        const payload = migrateProductSubProduct({
          nome: item,
          inputOutputMetric: metric,
          teseProduto: tese,
          descricao,
          dataFim: dataFimFinal,
          dataInicio: dataInicioFinal,
          status: statusMap[statusLabel] || 'nao_iniciado',
          okrId: '',
          produto,
          subProduto,
          subitens
        })

        try {
          // Preferir upsert se fornecido para evitar duplicações
          if (onUpsert) {
            await onUpsert(payload)
          } else {
            await onImport(payload)
          }
          setSuccessCount(c => c + 1)
        } catch (e) {
          setLogs(prev => [...prev, `Linha ${r + 1}: ${e.message || 'Erro ao salvar'}`])
          setErrorCount(c => c + 1)
        }
      }
    } catch (e) {
      setLogs(prev => [...prev, e.message || 'Falha ao processar arquivo'])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white text-company-dark-blue border-white hover:bg-gray-100">Importar Planilha</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Itens via Planilha</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
            disabled={isProcessing}
          />
          <p className="text-sm text-gray-600">
            Colunas obrigatórias: {REQUIRED_HEADERS.join(', ')}
            <br />
            <span className="text-xs text-gray-500">
              Nota: Se não tiver "Data Final", pode usar "Duração" (em meses) que será convertida automaticamente
              <br />
              Coluna "Ano" (opcional): se preenchido, força o ano de início/fim (útil para planilhas sem ano).
              <br />
              Coluna "Subitens" (opcional): Use ponto e vírgula (;) para separar múltiplos subitens. Ex: "Subitem 1; Subitem 2; Subitem 3"
            </span>
          </p>
          {(successCount > 0 || errorCount > 0 || logs.length > 0) && (
            <Alert>
              <AlertDescription>
                <div className="text-sm">
                  <div>Sucessos: {successCount} | Erros: {errorCount}</div>
                  {logs.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {logs.map((l, i) => (<li key={i}>{l}</li>))}
                    </ul>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)} disabled={isProcessing}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkImportModal


