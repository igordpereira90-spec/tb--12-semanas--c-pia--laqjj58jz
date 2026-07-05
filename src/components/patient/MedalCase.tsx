import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Award, Flame, BookOpen, Trophy } from 'lucide-react'

const icons = {
  Award,
  Flame,
  BookOpen,
  Trophy,
}

export function MedalCase({ medals }: { medals: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {medals.map((medal) => {
        const Icon = icons[medal.icon as keyof typeof icons] || Award
        return (
          <Card
            key={medal.id}
            className={cn(
              'p-4 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden group',
              medal.earned
                ? 'bg-gradient-to-b from-white to-amber-50/30 border-amber-200/50 hover:shadow-lg hover:scale-[1.02]'
                : 'bg-slate-50 opacity-60 grayscale',
            )}
          >
            {medal.earned && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
            )}
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm',
                medal.earned ? 'bg-amber-100 text-amber-500' : 'bg-slate-200 text-slate-400',
              )}
            >
              <Icon className={cn('w-7 h-7', medal.earned && 'drop-shadow-sm')} />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 mb-1">{medal.name}</h3>
            <p className="text-xs text-slate-500">{medal.desc}</p>
          </Card>
        )
      })}
    </div>
  )
}
