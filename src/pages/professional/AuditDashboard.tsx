import { useState, useEffect, useCallback } from 'react'
import { getAuditLogs, type AuditLog } from '@/services/audit_logs'
import { useRealtime } from '@/hooks/use-realtime'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShieldCheck, Loader2, ChevronLeft, ChevronRight, Activity, User } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Login',
  CREATE_QUESTIONNAIRE: 'Questionário Criado',
  UPDATE_QUESTIONNAIRE: 'Questionário Atualizado',
  DELETE_QUESTIONNAIRE: 'Questionário Excluído',
  ACCESS_PATIENT_DATA: 'Acesso a Dados do Paciente',
  UPDATE_QUESTIONNAIRE_CONFIG: 'Config de Questionário Editada',
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-700',
  CREATE_QUESTIONNAIRE: 'bg-emerald-100 text-emerald-700',
  UPDATE_QUESTIONNAIRE: 'bg-amber-100 text-amber-700',
  DELETE_QUESTIONNAIRE: 'bg-rose-100 text-rose-700',
  ACCESS_PATIENT_DATA: 'bg-purple-100 text-purple-700',
  UPDATE_QUESTIONNAIRE_CONFIG: 'bg-indigo-100 text-indigo-700',
}

export default function AuditDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionFilter, setActionFilter] = useState<string>('all')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const filter = actionFilter === 'all' ? undefined : actionFilter
      const result = await getAuditLogs(page, 30, filter)
      setLogs(result.items)
      setTotalPages(result.totalPages)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('audit_logs', () => {
    load()
  })

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getMetadata = (log: AuditLog): Record<string, unknown> => {
    if (typeof log.metadata === 'string') {
      try {
        return JSON.parse(log.metadata)
      } catch {
        return {}
      }
    }
    return (log.metadata as Record<string, unknown>) || {}
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full inline-block" />
            Trilha de Auditoria
          </h1>
          <p className="text-slate-600">
            Registro de todas as ações sensíveis — conformidade CFM e LGPD.
          </p>
        </div>
        <div className="w-full md:w-64">
          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {Object.entries(ACTION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhum registro de auditoria encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="text-left py-3 px-4 font-semibold text-primary">Data/Hora</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Usuário</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Ação</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Recurso</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = getMetadata(log)
                  const actorName = log.expand?.actor?.name || 'Sistema'
                  return (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(log.created)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-700 font-medium">{actorName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'} border-none`}
                        >
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                        {log.resource_id ? log.resource_id.substring(0, 8) + '...' : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs max-w-xs">
                        {meta.week_number !== undefined && (
                          <span>Semana {String(meta.week_number)}</span>
                        )}
                        {meta.changes && (
                          <span className="ml-2 text-amber-600">
                            {Object.keys(meta.changes as object).length} campo(s) alterado(s)
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
