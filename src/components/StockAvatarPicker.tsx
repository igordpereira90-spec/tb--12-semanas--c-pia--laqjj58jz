import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImageIcon, Loader2, Sparkles, Users, Leaf, Palette, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAvatarGallery,
  downloadAvatarAsFile,
  type AvatarOption,
  type AvatarGallery,
} from '@/services/avatars'

type AvatarTab = 'people' | 'anime' | 'nature' | 'minimalist'

interface TabConfig {
  label: string
  icon: typeof Users
  activeClass: string
  ringHover: string
  description: string
}

const TAB_CONFIG: Record<AvatarTab, TabConfig> = {
  people: {
    label: 'Profissional',
    icon: Users,
    activeClass: 'bg-primary text-white shadow-md',
    ringHover: 'hover:ring-amber-400',
    description: 'Retratos profissionais para seu perfil',
  },
  anime: {
    label: 'Arte',
    icon: Sparkles,
    activeClass: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md',
    ringHover: 'hover:ring-purple-400',
    description: 'Imagens artísticas e criativas para seu perfil',
  },
  nature: {
    label: 'Natureza',
    icon: Leaf,
    activeClass: 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md',
    ringHover: 'hover:ring-green-400',
    description: 'Paisagens naturais como foto de perfil',
  },
  minimalist: {
    label: 'Minimalista',
    icon: Palette,
    activeClass: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md',
    ringHover: 'hover:ring-indigo-400',
    description: 'Padrões abstratos e minimalistas',
  },
}

const GALLERY_KEY_MAP: Record<AvatarTab, keyof AvatarGallery> = {
  people: 'profissional',
  anime: 'anime',
  nature: 'natureza',
  minimalist: 'minimalista',
}

interface StockAvatarPickerProps {
  onSelect: (file: File, previewUrl: string) => void
}

export function StockAvatarPicker({ onSelect }: StockAvatarPickerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AvatarTab>('people')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [gallery, setGallery] = useState<AvatarGallery | null>(null)
  const [galleryError, setGalleryError] = useState(false)
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())

  const loadGallery = useCallback(() => {
    getAvatarGallery()
      .then((data) => {
        setGallery(data)
        setGalleryError(false)
      })
      .catch(() => setGalleryError(true))
  }, [])

  useEffect(() => {
    if (open && !gallery && !galleryError) {
      loadGallery()
    }
  }, [open, gallery, galleryError, loadGallery])

  const handleSelect = async (url: string, id: string) => {
    setLoading(id)
    setSelectedUrl(url)
    try {
      const file = await downloadAvatarAsFile(url)
      onSelect(file, url)
      setOpen(false)
    } catch {
      setBrokenImages((prev) => new Set(prev).add(id))
    } finally {
      setLoading(null)
      setSelectedUrl(null)
    }
  }

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => new Set(prev).add(id))
  }

  const config = TAB_CONFIG[activeTab]
  const TabIcon = config.icon
  const tabs = Object.entries(TAB_CONFIG) as [AvatarTab, TabConfig][]
  const galleryKey = GALLERY_KEY_MAP[activeTab]
  const avatars = gallery?.[galleryKey] ?? []
  const visibleAvatars = avatars.filter((a) => !brokenImages.has(a.id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          <ImageIcon className="w-4 h-4 mr-2" /> Escolher imagem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Escolha uma imagem</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 pt-2">
          {tabs.map(([tabKey, tabConfig]) => {
            const Icon = tabConfig.icon
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === tabKey
                    ? tabConfig.activeClass
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                <Icon className="w-4 h-4" /> {tabConfig.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
          <TabIcon className="w-3.5 h-3.5" />
          <span>{config.description}</span>
        </div>
        <ScrollArea className="h-[320px] w-full pr-4">
          {galleryError ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
              <p className="text-sm text-slate-500">
                Não foi possível carregar as imagens. Tente novamente.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setGalleryError(false)
                  setGallery(null)
                  loadGallery()
                }}
              >
                Tentar novamente
              </Button>
            </div>
          ) : !gallery ? (
            <div className="flex items-center justify-center h-full py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : visibleAvatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Nenhuma imagem disponível nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 pt-3 pb-2">
              {visibleAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelect(avatar.url, avatar.id)}
                  disabled={loading !== null}
                  className={cn(
                    'rounded-full overflow-hidden ring-2 ring-slate-200 transition-all duration-200 aspect-square',
                    config.ringHover,
                    'hover:scale-105',
                    selectedUrl === avatar.url && 'ring-4 ring-purple-500 scale-105',
                    loading === avatar.id && 'opacity-50',
                    loading !== null && loading !== avatar.id && 'opacity-60',
                  )}
                >
                  {loading === avatar.id ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <img
                      src={avatar.url}
                      alt="Avatar option"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => handleImageError(avatar.id)}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
