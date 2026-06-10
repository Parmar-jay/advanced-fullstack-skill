/**
 * AuthContext — global authentication state.
 *
 * Provides:
 *   user         — current user object or null
 *   isLoading    — true while checking auth on mount
 *   isAuthenticated — derived boolean
 *   login(data)  — store tokens + user, update state
 *   logout()     — clear tokens, call API, redirect
 *   updateUser(u)— update user in state + localStorage
 */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authAPI } from '../api/endpoints'

export const AuthContext = createContext(null)

const TOKEN_KEY   = 'access_token'
const REFRESH_KEY = 'refresh_token'
const USER_KEY    = 'user'

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setLoading] = useState(true)

  // ── On mount: restore session ──
  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY)
    const token  = localStorage.getItem(TOKEN_KEY)

    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        _clearStorage()
      }
    }
    setLoading(false)
  }, [])

  // ── Helpers ──
  function _clearStorage() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  }

  /** Called after successful login/signup with the API response data */
  const login = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY,   data.access_token)
    localStorage.setItem(REFRESH_KEY, data.refresh_token)
    localStorage.setItem(USER_KEY,    JSON.stringify(data.user))
    setUser(data.user)
  }, [])

  /** Logout: revoke server-side tokens then clear state */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // best-effort — clear locally regardless
    } finally {
      _clearStorage()
      setUser(null)
      window.location.href = '/login'
    }
  }, [])

  /** Update user in state + localStorage (e.g. after profile update) */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
