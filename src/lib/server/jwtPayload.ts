import type { AuthUser } from '@/stores/authStore'

/** 不校验签名，仅从 JWT payload 兜底解析用户信息（session 接口在后端无 /user 时使用） */
export const userFromJwtPayload = (token: string): AuthUser | null => {
  try {
    const p = token.split('.')[1]
    const json = Buffer.from(p, 'base64url').toString('utf8')
    const pl = JSON.parse(json) as Record<string, unknown>
    const userName = String(pl.userName ?? pl.name ?? pl.preferred_username ?? pl.sub ?? '用户')
    const userId = Number(pl.userId ?? pl.sub ?? 0) || 0
    return {
      userId,
      userName,
      mobile: String(pl.mobile ?? ''),
      gender: Number(pl.gender ?? 0) || 0,
      avatar: String(pl.avatar ?? ''),
      status: Number(pl.status ?? 0) || 0,
      createdAt: String(pl.createdAt ?? ''),
      updatedAt: String(pl.updatedAt ?? ''),
      deletedAt: String(pl.deletedAt ?? ''),
    }
  } catch {
    return null
  }
}
