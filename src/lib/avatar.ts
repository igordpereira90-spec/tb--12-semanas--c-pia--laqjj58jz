export function getAvatarUrl(user: { id: string; avatar?: string } | null | undefined): string {
  if (!user) return ''
  if (user.avatar) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
  }
  return ''
}

export function getUserInitials(name?: string | null): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
