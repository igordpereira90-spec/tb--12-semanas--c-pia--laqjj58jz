import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Award, Flame, BookOpen, Trophy, Star, Lock } from 'lucide-react'
import { BADGE_DEFINITIONS } from '@/services/gamification'

const icons: Record<string, typeof Award> = {
  Award,
  Flame,
  BookOpen,
  Trophy,
  Star,
}

interface BadgesGalleryProps {
  earnedBadges: string[]
}

export function BadgesGallery({ earnedBadges }: BadgesGalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {BADGE_DEFINITIONS.map((badge) => {
        const earned = earnedBadges.includes(badge.id)
        const Icon = icons[badge.icon] || Award
        return (
          <Card
            key={badge.id}
            className={cn(
              'p-4 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden group',
              earned
                ? 'bg-gradient-to-b from-white to-amber-50/40 border-amber-200/60 hover:shadow-lg hover:scale-[1.03]'
                : 'bg-slate-50 opacity-60',
            )}
          >
            {earned && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
            )}
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                earned ? 'bg-amber-100 text-amber-500 shadow-sm' : 'bg-slate-200 text-slate-400',
              )}
            >
              {earned ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
            </div>
            <h3 className="font-semibold text-xs text-slate-800">
              {earned ? '🏅 ' : ''}
              {badge.name}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">{badge.desc}</p>
          </Card>
        )
      })}
    </div>
  )
}
