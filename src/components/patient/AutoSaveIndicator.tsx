import { Loader2, Check, CloudOff, CloudUpload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutoSaveStatus } from '@/hooks/use-auto-save'

interface Props {
  status: AutoSaveStatus
}

const CONFIG: Record<
  AutoSaveStatus,
  { icon: typeof Check; text: string; className: string; spin?: boolean }
> = {
  idle: { icon: CloudUpload, text: 'Tudo salvo', className: 'text-slate-400' },
  saving: { icon: Loader2, text: 'Salvando...', className: 'text-[#D4AF37]', spin: true },
  saved: { icon: Check, text: 'Tudo salvo', className: 'text-green-600' },
  error: {
    icon: CloudOff,
    text: 'Conexão perdida — progresso não salvo',
    className: 'text-red-500',
  },
}

export function AutoSaveIndicator({ status }: Props) {
  const { icon: Icon, text, className, spin } = CONFIG[status]

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium transition-all duration-300',
        className,
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', spin && 'animate-spin')} />
      <span className="hidden sm:inline">{text}</span>
    </div>
  )
}
