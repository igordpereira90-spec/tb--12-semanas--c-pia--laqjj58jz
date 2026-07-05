import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAvatarUrl, getUserInitials } from '@/lib/avatar'
import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface UserAvatarProps {
  user: { id: string; avatar?: string; name?: string } | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showRing?: boolean
  src?: string
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs', icon: 'w-4 h-4' },
  md: { container: 'w-10 h-10', text: 'text-sm', icon: 'w-5 h-5' },
  lg: { container: 'w-16 h-16', text: 'text-lg', icon: 'w-8 h-8' },
  xl: { container: 'w-24 h-24', text: 'text-2xl', icon: 'w-12 h-12' },
}

export function UserAvatar({
  user,
  size = 'md',
  className,
  showRing = true,
  src,
}: UserAvatarProps) {
  const url = src ?? getAvatarUrl(user)
  const initials = getUserInitials(user?.name)
  const s = sizeMap[size]

  return (
    <Avatar
      className={cn(s.container, showRing && 'ring-2 ring-primary/20 ring-offset-2', className)}
    >
      {url && <AvatarImage src={url} alt={user?.name || 'Usuário'} />}
      <AvatarFallback
        className={cn(
          s.text,
          'bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold',
        )}
      >
        {initials || <User className={s.icon} />}
      </AvatarFallback>
    </Avatar>
  )
}
