'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

interface AuthContextType {
  user: any
  isLoading: boolean
  error?: Error | null
  isAuthenticated: boolean
  loginWithRedirect: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, error, isLoading } = useUser()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(!!user && !isLoading)
  }, [user, isLoading])

  const loginWithRedirect = () => {
    window.location.href = '/api/auth/login'
  }

  const logout = () => {
    window.location.href = '/api/auth/logout'
  }

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    loginWithRedirect,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}