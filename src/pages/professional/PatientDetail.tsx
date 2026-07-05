import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getUser } from '@/services/users'
import { getQuestionnaires, updateQuestionnaire } from '@/services/questionnaires'
import { AccessManagement } from '@/components/professional/AccessManagement'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Save,
  Loader2,
  Table2,
  History,
  Lock,
} from 'lucide-react'
import { PatientChart } from '@/components/professional/PatientChart'
import { LongitudinalTable } from '@/components/professional/LongitudinalTable'
import { QuestionnaireHistory } from '@/components/professional/QuestionnaireHistory'
import { QuestionnaireEditDialog } from '@/components/professional/QuestionnaireEditDialog'
import { WeeklyEvolution } from '@/components/professional/WeeklyEvolution'
import { useToast } from '@/hooks/use-toast'
import { getAlerts, getCurrentWeek } from '@/lib/patient-utils'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { logAction } from '@/services/audit_logs'
import { useAuth } from '@/hooks/use-auth'
import { getNotes, createNote, updateNote } from '@/services/professional_notes'
import type { AppUser } from '@/services/users'
import type { Questionnaire } from '@/services/questionnaires'
import { UserAvatar } from '@/components/UserAvatar'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patient, setPatient] = useState<AppUser | null>(null)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [editingQ, setEditingQ] = useState<Questionnaire | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [noteId, setNoteId] = useState<string | null>(null)
  const [savingNotes, setSavingNotes] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [p, qs] = await Promise.all([getUser(id), getQuestionnaires(id)])
      setPatient(p)
      setQuestionnaires(qs)
    } catch {
      setPatient(null)
      setQuestionnaires([])
    } finally {
      setLoading(false)
    }
    try {
      const noteList = await getNotes(id)
      if (noteList.length > 0) {
        setNotes(noteList[0].content)
        setNoteId(noteList[0].id)
      } else {
        setNotes('')
        setNoteId(null)
      }
    } catch {
      setNotes('')
      setNoteId(null)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('questionnaires', () => {
    loadData()
  })
  useRealtime('professional_notes', () => {
    loadData()
  })

  useEffect(() => {
    if (id) logAction('ACCESS_PATIENT_DATA', id).catch(() => {})
  }, [id])

  const handleEditSubmit = async (data: Record<string, unknown>) => {
    if (!editingQ) return
    try {
      await updateQuestionnaire(editingQ.id, data)
      setEditingQ(null)
      setEditDialogOpen(false)
      toast({ title: 'Sucesso!', description: 'Questionário atualizado com sucesso.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao atualizar', description: getErrorMessage(err) })
    }
  }

  const handleSaveNotes = async () => {
    if (!id || !user?.id) return
    setSavingNotes(true)
    try {
      if (noteId) {
        await updateNote(noteId, notes)
      } else {
        const created = await createNote(id, user.id, notes)
        setNoteId(created.id)
      }
      toast({ title: 'Notas salvas', description: 'Observações atualizadas.' })
    } catch (err) {
      toast({ title: 'Erro ao salvar', description: getErrorMessage(err) })
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!patient) {
    return <div className="text-center py-12 text-slate-500">Paciente não encontrado.</div>
  }

  const sorted = [...questionnaires].sort((a, b) => a.week_number - b.week_number)
  const latest = sorted[sorted.length - 1]
  const alerts = latest ? getAlerts(latest) : { hasAlert: false, reasons: [] }
  const currentWeek = getCurrentWeek(questionnaires)

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <UserAvatar user={patient} size="lg" />
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
            {alerts.hasAlert && (
              <Badge variant="destructive" className="animate-pulse">
                Atenção Requerida
              </Badge>
            )}
          </div>
          <p className="text-slate-500">
            Semana atual: {currentWeek} de 12 • {questionnaires.length} questionários preenchidos
          </p>
        </div>
      </div>

      {alerts.hasAlert && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-900">
          <AlertTriangle className="h-5 w-5 !text-rose-600" />
          <AlertTitle className="text-rose-800 font-semibold">
            Alerta Clínico — Semana {latest.week_number}
          </AlertTitle>
          <AlertDescription className="text-rose-700 mt-1">
            {alerts.reasons.join('. ')}.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 border-primary/10 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 flex items-center text-slate-800">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" /> Evolução Clínica (Scores 0-10)
        </h2>
        <PatientChart questionnaires={sorted} />
      </Card>

      <WeeklyEvolution questionnaires={sorted} patientId={patient.id} />

      <Card className="p-6 border-primary/10 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
          <Table2 className="w-5 h-5 mr-2 text-primary" /> Comparativo Longitudinal
        </h2>
        <LongitudinalTable questionnaires={sorted} />
      </Card>

      <Card className="p-6 border-primary/10 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
          <History className="w-5 h-5 mr-2 text-primary" /> Histórico de Questionários
        </h2>
        <QuestionnaireHistory
          questionnaires={sorted}
          onEdit={(q) => {
            setEditingQ(q)
            setEditDialogOpen(true)
          }}
        />
      </Card>

      <Card className="p-6 border-primary/10 shadow-sm bg-primary/5">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-slate-800">
          <Lock className="w-5 h-5 mr-2 text-primary" /> Gestão de Acesso
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Libere manualmente semanas para este paciente.
        </p>
        <AccessManagement patientId={patient.id} />
      </Card>

      <Card className="p-6 border-primary/10 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
          Notas Profissionais (Privado)
        </h2>
        <Textarea
          placeholder="Registre aqui suas observações clínicas..."
          className="min-h-[150px] mb-4 bg-slate-50/50"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
          >
            {savingNotes ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}{' '}
            Salvar Notas
          </Button>
        </div>
      </Card>
      <QuestionnaireEditDialog
        questionnaire={editingQ}
        open={editDialogOpen}
        onOpenChange={(o) => {
          setEditDialogOpen(o)
          if (!o) setEditingQ(null)
        }}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
