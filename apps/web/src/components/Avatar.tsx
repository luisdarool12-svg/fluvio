import { avatarColor, initials } from '@/lib/helpers'

interface AvatarProps {
  name: string
  size?: number
}

export function Avatar({ name, size = 34 }: AvatarProps) {
  const fs = Math.round(size * 0.4)
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: fs, background: avatarColor(name) }}
    >
      {initials(name)}
    </div>
  )
}
