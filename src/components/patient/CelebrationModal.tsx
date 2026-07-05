import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Award, Sparkles, Flame } from 'lucide-react'

interface CelebrationModalProps {
  open: boolean
  onClose: () => void
  title?: string
  message?: string
  points?: number
  basePoints?: number
  streakBonus?: number
}

const MESSAGES = [
  'Parabéns! Você está cuidando da sua saúde!',
  'Incrível! Continue assim!',
  'Você está investindo no seu bem-estar!',
  'Mais um passo rumo ao equilíbrio!',
  'Excelente! Sua constância faz a diferença!',
]

export function CelebrationModal({
  open,
  onClose,
  title = 'Muito bem!',
  message,
  points,
  basePoints,
  streakBonus,
}: CelebrationModalProps) {
  const displayMessage = message || MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  const confettiPieces = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i / 18) * 100}%`,
    delay: `${(i % 6) * 0.12}s`,
    duration: `${2 + (i % 3) * 0.4}s`,
    color: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#d97706', '#fff7ed'][i % 6],
  }))
  const hasStreak = (streakBonus ?? 0) > 0
  const totalPoints = points ?? (basePoints ?? 0) + (streakBonus ?? 0)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm border-amber-200/60 bg-white p-0 overflow-hidden shadow-2xl shadow-amber-900/10 [&>button]:hidden">
        <div className="celebration-confetti">
          {confettiPieces.map((p, i) => (
            <span
              key={i}
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="h-28 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_60%)]" />
            <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl shadow-amber-900/20 animate-bounce relative z-10">
              <Award className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          <div className="px-7 pb-7 pt-5 text-center space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h2>
              <p className="text-slate-500 mt-1.5 text-sm flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {displayMessage}
              </p>
            </div>

            <div className="py-4">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 bg-clip-text text-transparent tracking-tight">
                +{totalPoints}
              </div>
              <p className="text-sm font-semibold text-amber-700/80 mt-1 uppercase tracking-wider">
                pontos
              </p>
            </div>

            {(basePoints !== undefined || hasStreak) && (
              <div className="flex items-center justify-center gap-3 text-xs">
                {basePoints !== undefined && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium border border-amber-100">
                    <Sparkles className="w-3 h-3" />
                    Base +{basePoints}
                  </span>
                )}
                {hasStreak && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-medium border border-orange-100">
                    <Flame className="w-3 h-3" />
                    Sequência +{streakBonus}
                  </span>
                )}
              </div>
            )}

            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 hover:shadow-amber-500/30"
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
