import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const REQUIRED_HEADERS = [
  'Item',
  'Data de Início',
  'Duração',
  'Input/Output Metric',
  'Tese de Produto',
  'Status',
  'Produto'
]

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
        const duracao = String(row[idx['Duração']] || '').trim()
        const metric = String(row[idx['Input/Output Metric']] || '').trim()
        const tese = String(row[idx['Tese de Produto']] || '').trim()
        const statusLabel = String(row[idx['Status']] || '').trim()
        const produto = String(row[idx['Produto']] || '').trim().toLowerCase() || 'aplicativo'

        if (!item) {
          setLogs(prev => [...prev, `Linha ${r + 1}: Item vazio`])
          setErrorCount(c => c + 1)
          continue
        }

        // normalizar duracao (inteiro >=1)
        const duracaoMeses = String(duracao || '').trim()
        const duracaoParsed = parseInt(duracaoMeses, 10)
        const normalizedDuracao = Number.isFinite(duracaoParsed) && duracaoParsed > 0 ? String(duracaoParsed) : ''

        const payload = {
          nome: item,
          inputOutputMetric: metric,
          teseProduto: tese,
          duracaoMeses: normalizedDuracao,
          dataInicio,
          status: statusMap[statusLabel] || 'nao_iniciado',
          okrId: '',
          produto,
          subProduto: produto === 'web' ? '' : ''
        }

        try {
          // Preferir upsert se fornecido para evitar duplicações
          /* eslint-disable no-await-in-loop */
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
          <p className="text-sm text-gray-600">Colunas obrigatórias: {REQUIRED_HEADERS.join(', ')}</p>
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


