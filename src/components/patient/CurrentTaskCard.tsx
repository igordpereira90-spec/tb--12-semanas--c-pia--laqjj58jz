import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClipboardList, ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react'

interface CurrentTaskCardProps {
  weekNumber: number
  hasQuestionnairePending: boolean
  hasMaterialToRead: boolean
  points: number
  maxXp?: number
  onAction: () => void
}

export function CurrentTaskCard({
  weekNumber,
  hasQuestionnairePending,
  hasMaterialToRead,
  points,
  maxXp = 1000,
  onAction,
}: CurrentTaskCardProps) {
  const taskLabel = hasQuestionnairePending
    ? `📝 Complete o Questionário da Semana ${weekNumber}`
    : hasMaterialToRead
      ? '📖 Leia o material educativo disponível'
      : '✅ Tudo em dia! Aguarde a próxima semana.'

  const taskHint = hasQuestionnairePending
    ? 'Responda com sinceridade — suas respostas ajudam no tratamento.'
    : hasMaterialToRead
      ? 'A psicoeducação é parte fundamental do seu tratamento.'
      : 'Parabéns por concluir suas tarefas desta semana!'

  const Icon = hasQuestionnairePending ? ClipboardList : hasMaterialToRead ? BookOpen : CheckCircle2

  return (
    <Card className="p-6 md:p-8 border-amber-100 bg-gradient-to-br from-white via-amber-50/30 to-white shadow-lg shadow-amber-100/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/20 rounded-full blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-amber-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Sua próxima tarefa</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
              {taskLabel}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{taskHint}</p>
          </div>
        </div>
        {(hasQuestionnairePending || hasMaterialToRead) && (
          <Button
            onClick={onAction}
            size="lg"
            className="w-full md:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20"
          >
            {hasQuestionnairePending ? 'Preencher Agora' : 'Ler Material'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-700">
            ⭐ {points} / {maxXp} XP
          </span>
        </div>
      </div>
    </Card>
  )
}
