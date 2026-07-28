import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  authLoading: boolean
  firebaseReady: boolean
  signInWithGoogle: () => Promise<void>
  signOutGoogle: () => Promise<void>
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err && 'code' in err
      ? String((err as { code: string }).code)
      : ''
  if (code === 'auth/popup-closed-by-user') {
    return '로그인 창이 닫혔습니다.'
  }
  if (code === 'auth/popup-blocked') {
    return '팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.'
  }
  if (code === 'auth/cancelled-popup-request') {
    return '이미 로그인 요청이 진행 중입니다.'
  }
  if (err instanceof Error && err.message) return err.message
  return 'Google 로그인에 실패했습니다.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const firebaseReady = isFirebaseConfigured()

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setAuthLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    const auth = getFirebaseAuth()
    if (!auth) {
      setAuthError('Firebase 설정이 없습니다. .env의 VITE_FIREBASE_* 값을 확인하세요.')
      return
    }
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setAuthError(mapAuthError(err))
    }
  }, [])

  const signOutGoogle = useCallback(async () => {
    setAuthError(null)
    const auth = getFirebaseAuth()
    if (!auth) return
    await firebaseSignOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      authLoading,
      firebaseReady,
      signInWithGoogle,
      signOutGoogle,
      authError,
      clearAuthError: () => setAuthError(null),
    }),
    [user, authLoading, firebaseReady, signInWithGoogle, signOutGoogle, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
