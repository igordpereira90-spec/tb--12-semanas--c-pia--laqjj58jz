import pb from '@/lib/pocketbase/client'

export interface AvatarOption {
  id: string
  url: string
}

export interface AvatarGallery {
  anime: AvatarOption[]
  profissional: AvatarOption[]
  natureza: AvatarOption[]
  minimalista: AvatarOption[]
}

export async function getAvatarGallery(): Promise<AvatarGallery> {
  return pb.send('/backend/v1/avatar-gallery', { method: 'GET' })
}

export async function downloadAvatarAsFile(url: string): Promise<File> {
  const proxyUrl = `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/avatar-download?url=${encodeURIComponent(url)}`
  const res = await fetch(proxyUrl, {
    headers: {
      Authorization: pb.authStore.token || '',
    },
  })
  if (!res.ok) throw new Error('Falha ao baixar imagem')
  const blob = await res.blob()
  const contentType = blob.type || 'image/png'
  const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png'
  return new File([blob], `avatar.${ext}`, { type: contentType })
}
