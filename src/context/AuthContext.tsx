import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface LocalUser {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: LocalUser | null
  loading: boolean
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => void
}

const USERS_KEY = 'mc_local_users'
const SESSION_KEY = 'mc_local_session'

const AuthContext = createContext<AuthContextValue | null>(null)

interface StoredUser extends LocalUser {
  passwordHash: string
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as StoredUser[]
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as LocalUser | null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const signUp = async (name: string, email: string, password: string) => {
    const cleanName = name.trim()
    const cleanEmail = normalizeEmail(email)

    if (!cleanName) return { error: 'Please enter your name.' }
    if (!cleanEmail || !cleanEmail.includes('@')) return { error: 'Please enter a valid email.' }
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

    const users = loadUsers()
    if (users.some((item) => item.email === cleanEmail)) {
      return { error: 'An account with this email already exists.' }
    }

    setLoading(true)
    try {
      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        passwordHash: await hashPassword(password),
      }
      saveUsers([...users, newUser])
      setUser({ id: newUser.id, name: newUser.name, email: newUser.email })
      return {}
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const cleanEmail = normalizeEmail(email)
    const users = loadUsers()
    const storedUser = users.find((item) => item.email === cleanEmail)

    if (!storedUser) return { error: 'No account found with this email.' }

    setLoading(true)
    try {
      const passwordHash = await hashPassword(password)
      if (passwordHash !== storedUser.passwordHash) {
        return { error: 'Incorrect password.' }
      }

      setUser({
        id: storedUser.id,
        name: storedUser.name,
        email: storedUser.email,
      })
      return {}
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => setUser(null)

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signOut }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
