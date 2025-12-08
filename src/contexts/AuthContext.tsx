'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import authService, { LoginRequest, SignupRequest } from '../services/auth'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error?: Error | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  signup: (data: SignupRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      setIsLoading(true)
      
      if (authService.isAuthenticated()) {
        const userId = authService.getCurrentUserId()
        if (userId) {
          setUser({
            id: userId,
            email: '',
            name: '',
            role: 'CUSTOMER'
          })
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      setError(err instanceof Error ? err : new Error('Authentication check failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.login(credentials)
      
      const userId = authService.getCurrentUserId()
      if (userId) {
        setUser({
          id: userId,
          email: credentials.email,
          name: '',
          role: 'CUSTOMER'
        })
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('로그인 실패')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (data: SignupRequest) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await authService.signup(data)
      
      await login({ email: data.email, password: data.password })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('회원가입 실패')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
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