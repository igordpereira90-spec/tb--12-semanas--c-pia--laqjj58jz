import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getPatients } from '@/services/users'
import { getQuestionnaires } from '@/services/questionnaires'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, AlertCircle, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPatientStatus, getCurrentWeek } from '@/lib/patient-utils'
import { QUESTIONNAIRE_WEEKS } from '@/lib/questionnaire-config'
import type { AppUser } from '@/services/users'
import type { Questionnaire } from '@/services/questionnaires'

export default function ProDashboard() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<AppUser[]>([])
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [pats, qs] = await Promise.all([getPatients(), getQuestionnaires()])
      setPatients(pats)
      setQuestionnaires(qs)
    } catch {
      setPatients([])
      setQuestionnaires([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('questionnaires', () => {
    loadData()
  })

  const getPatientQs = (pid: string) => questionnaires.filter((q) => q.patient === pid)

  const filteredPatients = patients.filter((p) => {
    const status = getPatientStatus(getPatientQs(p.id))
    if (filter !== 'all' && status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statusBadge = (status: string) => {
    if (status === 'attention')
      return (
        <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 shadow-sm">
          <AlertCircle className="w-3 h-3 mr-1" /> Atenção
        </Badge>
      )
    if (status === 'pending')
      return (
        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 shadow-sm">
          <Clock className="w-3 h-3 mr-1" /> Pendente
        </Badge>
      )
    return (
      <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 shadow-sm">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Em dia
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
          Painel de Acompanhamento
        </h1>
        <p className="text-slate-600">
          Monitore a evolução dos seus pacientes no ciclo de 12 semanas.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#D4AF37]/20 shadow-sm relative overflow-hidden premium-card">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
          <p className="text-sm text-slate-500 font-medium ml-2">Total Ativos</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">{patients.length}</p>
        </Card>
        <Card className="p-4 bg-white border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <p className="text-sm text-slate-500 font-medium ml-2">Em Atenção</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'attention').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <p className="text-sm text-slate-500 font-medium ml-2">Pendentes</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'pending').length}
          </p>
        </Card>
        <Card className="p-4 bg-white border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <p className="text-sm text-slate-500 font-medium ml-2">Em Dia</p>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {patients.filter((p) => getPatientStatus(getPatientQs(p.id)) === 'ok').length}
          </p>
        </Card>
      </div>

      <Card className="p-6 border border-[#D4AF37]/15 shadow-sm premium-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar paciente..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            onValueChange={setFilter}
            className="w-full md:w-auto overflow-x-auto"
          >
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="attention">Atenção</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="ok">Em dia</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#D4AF37]/5 hover:bg-[#D4AF37]/5 border-[#D4AF37]/10">
                <TableHead className="text-[#B8941F] font-semibold">Paciente</TableHead>
                <TableHead className="text-[#B8941F] font-semibold">E-mail</TableHead>
                <TableHead className="text-[#B8941F] font-semibold">Semana Atual</TableHead>
                <TableHead className="text-[#B8941F] font-semibold">Questionários</TableHead>
                <TableHead className="text-[#B8941F] font-semibold">Status</TableHead>
                <TableHead className="text-right text-[#B8941F] font-semibold">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const pQs = getPatientQs(patient.id)
                const status = getPatientStatus(pQs)
                return (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => navigate(`/pro/patient/${patient.id}`)}
                  >
                    <TableCell className="font-medium text-slate-800">{patient.name}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{patient.email}</TableCell>
                    <TableCell>Semana {getCurrentWeek(pQs)}</TableCell>
                    <TableCell className="text-slate-500">
                      {pQs.length} de {QUESTIONNAIRE_WEEKS.length}
                    </TableCell>
                    <TableCell>{statusBadge(status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#B8941F] hover:text-[#D4AF37]"
                      >
                        Ver detalhes <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
