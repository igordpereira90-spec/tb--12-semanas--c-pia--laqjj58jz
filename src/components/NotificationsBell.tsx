import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/services/notifications'
import { cn } from '@/lib/utils'

export function NotificationsBell() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadCount = useCallback(async () => {
    if (!user?.id) return
    try {
      const count = await getUnreadCount(user.id)
      setUnreadCount(count)
    } catch {
      /* collection may not exist yet */
    }
  }, [user?.id])

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const result = await getNotifications(user.id)
      setNotifications(result.items)
    } catch {
      /* collection may not exist yet */
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadCount()
  }, [loadCount])

  useRealtime('notifications', () => {
    loadCount()
    if (open) loadNotifications()
  })

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (o) loadNotifications()
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      /* ignore */
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return
    try {
      await markAllAsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      /* ignore */
    }
  }

  const getIcon = (type: string) => {
    if (type === 'alert') return <AlertCircle className="w-4 h-4 text-rose-500" />
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    return <Info className="w-4 h-4 text-blue-500" />
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins}min atrás`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="w-3 h-3 mr-1" /> Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">Nenhuma notificação.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 p-4 hover:bg-slate-50/50 transition-colors cursor-pointer',
                    !n.read && 'bg-primary/5',
                  )}
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium text-slate-800',
                        !n.read && 'font-semibold',
                      )}
                    >
                      {n.title}
                    </p>
                    {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{formatTime(n.created)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
