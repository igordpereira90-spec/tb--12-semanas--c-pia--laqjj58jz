import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PlayCircle, Moon, Brain, Pencil, Gift } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { BonusEditDialog } from '@/components/professional/BonusEditDialog'
import { getBonuses, type Bonus } from '@/services/bonuses'

function convertToEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

const ICONS = [PlayCircle, Moon, Brain] as const
const ICON_COLORS = ['text-rose-500', 'text-indigo-500', 'text-purple-500']
const ICON_BGS = ['bg-rose-50', 'bg-indigo-50', 'bg-purple-50']

export default function Bonus() {
  const { user } = useAuth()
  const isProfessional = user?.role === 'professional'
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Bonus | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadBonuses = useCallback(async () => {
    try {
      const data = await getBonuses()
      setBonuses(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBonuses()
  }, [loadBonuses])

  useRealtime('bonuses', () => {
    loadBonuses()
  })

  const handleEdit = (bonus: Bonus) => {
    setEditTarget(bonus)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">🎁 Bônus</h1>
        <p className="text-slate-600">
          Recursos complementares para apoiar o seu tratamento e bem-estar.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <Card key={i} className="p-6 border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="w-full h-48 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : (
        bonuses.map((bonus, idx) => {
          const Icon = ICONS[idx % ICONS.length]
          const iconColor = ICON_COLORS[idx % ICON_COLORS.length]
          const iconBg = ICON_BGS[idx % ICON_BGS.length]
          const embedUrl = convertToEmbedUrl(bonus.video_url)

          return (
            <Card key={bonus.id} className="overflow-hidden border-slate-100 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${iconBg}`}
                    >
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">{bonus.title}</h2>
                  </div>
                  {isProfessional && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(bonus)}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </Button>
                  )}
                </div>

                {embedUrl ? (
                  <div
                    className="relative w-full overflow-hidden rounded-xl bg-black shadow-md mb-4"
                    style={{ aspectRatio: '16 / 9' }}
                  >
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={embedUrl}
                      title={bonus.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : null}

                <div
                  className="prose prose-sm max-w-none text-slate-600
                    [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-700 [&_h3]:mt-4 [&_h3]:mb-2
                    [&_p]:my-2 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                    [&_li]:my-1 [&_li]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: bonus.content }}
                />
              </div>
            </Card>
          )
        })
      )}

      {!loading && bonuses.length === 0 && (
        <Card className="p-12 border-slate-100 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center">
            <Gift className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-400">Nenhum conteúdo bônus disponível no momento.</p>
          </div>
        </Card>
      )}

      {isProfessional && editTarget && (
        <BonusEditDialog
          bonus={editTarget}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={loadBonuses}
        />
      )}
    </div>
  )
}
