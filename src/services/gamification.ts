import pb from '@/lib/pocketbase/client'

export interface BadgeDefinition {
  id: string
  name: string
  desc: string
  icon: string
}

export interface UserBadges {
  earnedBadges: string[]
  readMaterials: string[]
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_milestone', name: 'Primeiro Marco', desc: 'Completou a Semana 0', icon: 'Award' },
  {
    id: 'consistency_champion',
    name: 'Campeão de Constância',
    desc: '3 questionários completos',
    icon: 'Flame',
  },
  {
    id: 'knowledge_seeker',
    name: 'Buscador de Conhecimento',
    desc: 'Leu 3 materiais educativos',
    icon: 'BookOpen',
  },
  { id: 'halfway_hero', name: 'Herói do Meio', desc: 'Metade do programa concluída', icon: 'Star' },
  {
    id: 'completion_master',
    name: 'Mestre da Conclusão',
    desc: 'Programa completo',
    icon: 'Trophy',
  },
]

export function parseUserBadges(raw: unknown): UserBadges {
  if (!raw) return { earnedBadges: [], readMaterials: [] }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return {
        earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
        readMaterials: Array.isArray(parsed.readMaterials) ? parsed.readMaterials : [],
      }
    } catch {
      return { earnedBadges: [], readMaterials: [] }
    }
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    return {
      earnedBadges: Array.isArray(obj.earnedBadges) ? (obj.earnedBadges as string[]) : [],
      readMaterials: Array.isArray(obj.readMaterials) ? (obj.readMaterials as string[]) : [],
    }
  }
  return { earnedBadges: [], readMaterials: [] }
}

export async function recordMaterialRead(materialId: string) {
  return pb.send('/backend/v1/read-material', {
    method: 'POST',
    body: JSON.stringify({ materialId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function refreshAuthUser() {
  try {
    await pb.collection('users').authRefresh()
  } catch {
    /* token might be expired */
  }
}
