import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { request } from '@/lib/httpClient'

/** 业务用户信息（与后端 data.user 一致） */
export type AuthUser = {
  userId: number
  userName: string
  mobile: string
  gender: number
  avatar: string
  status: number
  createdAt: string
  updatedAt: string
  deletedAt: string
}

/** 登录接口 data（后端完整结构，BFF 会剥掉 token 再给前端） */
export type LoginData = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  refreshIn: number
  tokenType: string
  user: AuthUser
}

/** 前端仅保存用户信息，JWT 只在 HttpOnly Cookie 中 */
export type LoginDataPublic = Omit<LoginData, 'accessToken' | 'refreshToken'>

/** 登录接口完整响应 */
export type LoginApiResponse = {
  success: boolean
  data?: LoginData | LoginDataPublic
  error?: string
  message?: string
}

type AuthState = {
  user: AuthUser | null
  /** persist 恢复完成 */
  _hasHydrated: boolean
  /** /api/auth/session 已跑完（成功或失败） */
  _sessionReady: boolean
  setUser: (user: AuthUser | null) => void
  /** 登录成功后仅写入用户（token 已由 BFF 写入 Cookie） */
  setUserFromLogin: (data: LoginDataPublic) => void
  logout: () => void
  setHydrated: (v: boolean) => void
  setSessionReady: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      _sessionReady: false,
      setUser: (user) => set({ user }),
      setUserFromLogin: (data) =>
        set({
          user: data.user,
        }),
      logout: () => set({ user: null }),
      setHydrated: (v) => set({ _hasHydrated: v }),
      setSessionReady: (v) => set({ _sessionReady: v }),
    }),
    {
      name: 'todo-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      skipHydration: true,
    }
  )
)

export const fetchAuthSession = async () => {
  const { setUser, logout, setSessionReady, user } = useAuthStore.getState()

  try {
    // 与后端 /api/get-user 一致：POST + { userId }；无本地 user 时传 0，由 BFF 从 JWT 补全
    const json = await request<{ success?: boolean; data?:  AuthUser  }>('/api/get-user', {
      body: { userId: user?.userId ?? 0 },
      cache: 'no-store',
    })
    if (json.success && json.data) {
      setUser(json.data)
    } else {
      logout()
    }
  } catch {
    logout()
  } finally {
    setSessionReady(true)
  }
}

/** 在客户端 _app 中调用：先恢复本地 user，再拉 session 与 Cookie 对齐 */
export const rehydrateAuthStore = async () => {
  await useAuthStore.persist.rehydrate()
  useAuthStore.getState().setHydrated(true)
  await fetchAuthSession()
}

export const selectIsAuthenticated = (state: AuthState) => {
  return Boolean(state.user)
}
