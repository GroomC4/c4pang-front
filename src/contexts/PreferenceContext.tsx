'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { UserPreferences } from '@/types/recommendation'

interface PreferenceState extends UserPreferences {
  isInitialized: boolean
  lastUpdated: Date | null
}

type PreferenceAction =
  | { type: 'SET_FRAGRANCE_TYPES'; payload: string[] }
  | { type: 'SET_PRICE_RANGE'; payload: { min: number; max: number } }
  | { type: 'SET_FAVORITE_NOTES'; payload: string[] }
  | { type: 'SET_PREFERRED_BRANDS'; payload: string[] }
  | { type: 'SET_OCCASIONS'; payload: string[] }
  | { type: 'SET_INTENSITY'; payload: 'light' | 'medium' | 'strong' }
  | { type: 'ADD_PURCHASE'; payload: string }
  | { type: 'ADD_VIEW'; payload: string }
  | { type: 'ADD_TO_CART_HISTORY'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: UserPreferences }
  | { type: 'RESET_PREFERENCES' }

interface PreferenceContextType extends PreferenceState {
  setFragranceTypes: (types: string[]) => void
  setPriceRange: (range: { min: number; max: number }) => void
  setFavoriteNotes: (notes: string[]) => void
  setPreferredBrands: (brands: string[]) => void
  setOccasions: (occasions: string[]) => void
  setIntensity: (intensity: 'light' | 'medium' | 'strong') => void
  addPurchase: (productId: string) => void
  addView: (productId: string) => void
  addToCartHistory: (productId: string) => void
  resetPreferences: () => void
  hasMinimalPreferences: () => boolean
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined)

const defaultPreferences: UserPreferences = {
  fragranceTypes: [],
  priceRange: { min: 0, max: 300000 },
  favoriteNotes: [],
  preferredBrands: [],
  occasions: [],
  intensity: 'medium',
  purchaseHistory: [],
  viewHistory: [],
  cartHistory: []
}

const preferenceReducer = (state: PreferenceState, action: PreferenceAction): PreferenceState => {
  switch (action.type) {
    case 'SET_FRAGRANCE_TYPES':
      return { ...state, fragranceTypes: action.payload, lastUpdated: new Date() }
    
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload, lastUpdated: new Date() }
    
    case 'SET_FAVORITE_NOTES':
      return { ...state, favoriteNotes: action.payload, lastUpdated: new Date() }
    
    case 'SET_PREFERRED_BRANDS':
      return { ...state, preferredBrands: action.payload, lastUpdated: new Date() }
    
    case 'SET_OCCASIONS':
      return { ...state, occasions: action.payload, lastUpdated: new Date() }
    
    case 'SET_INTENSITY':
      return { ...state, intensity: action.payload, lastUpdated: new Date() }
    
    case 'ADD_PURCHASE': {
      const updatedPurchaseHistory = [...state.purchaseHistory]
      if (!updatedPurchaseHistory.includes(action.payload)) {
        updatedPurchaseHistory.push(action.payload)
      }
      return { ...state, purchaseHistory: updatedPurchaseHistory, lastUpdated: new Date() }
    }
    
    case 'ADD_VIEW': {
      const updatedViewHistory = [...state.viewHistory]
      const index = updatedViewHistory.indexOf(action.payload)
      if (index > -1) {
        updatedViewHistory.splice(index, 1)
      }
      updatedViewHistory.unshift(action.payload)
      // 최근 50개만 유지
      if (updatedViewHistory.length > 50) {
        updatedViewHistory.splice(50)
      }
      return { ...state, viewHistory: updatedViewHistory, lastUpdated: new Date() }
    }
    
    case 'ADD_TO_CART_HISTORY': {
      const updatedCartHistory = [...state.cartHistory]
      if (!updatedCartHistory.includes(action.payload)) {
        updatedCartHistory.unshift(action.payload)
        // 최근 30개만 유지
        if (updatedCartHistory.length > 30) {
          updatedCartHistory.splice(30)
        }
      }
      return { ...state, cartHistory: updatedCartHistory, lastUpdated: new Date() }
    }
    
    case 'LOAD_FROM_STORAGE':
      return { 
        ...action.payload, 
        isInitialized: true, 
        lastUpdated: new Date() 
      }
    
    case 'RESET_PREFERENCES':
      return { 
        ...defaultPreferences, 
        isInitialized: true, 
        lastUpdated: new Date() 
      }
    
    default:
      return state
  }
}

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(preferenceReducer, {
    ...defaultPreferences,
    isInitialized: false,
    lastUpdated: null
  })

  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        const parsedPreferences: UserPreferences = JSON.parse(savedPreferences)
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedPreferences })
      } catch (error) {
        console.error('Failed to parse user preferences:', error)
        dispatch({ type: 'RESET_PREFERENCES' })
      }
    } else {
      dispatch({ type: 'RESET_PREFERENCES' })
    }
  }, [])

  useEffect(() => {
    if (state.isInitialized) {
      const { isInitialized, lastUpdated, ...preferencesToSave } = state
      localStorage.setItem('userPreferences', JSON.stringify(preferencesToSave))
    }
  }, [state])

  const setFragranceTypes = (types: string[]) => {
    dispatch({ type: 'SET_FRAGRANCE_TYPES', payload: types })
  }

  const setPriceRange = (range: { min: number; max: number }) => {
    dispatch({ type: 'SET_PRICE_RANGE', payload: range })
  }

  const setFavoriteNotes = (notes: string[]) => {
    dispatch({ type: 'SET_FAVORITE_NOTES', payload: notes })
  }

  const setPreferredBrands = (brands: string[]) => {
    dispatch({ type: 'SET_PREFERRED_BRANDS', payload: brands })
  }

  const setOccasions = (occasions: string[]) => {
    dispatch({ type: 'SET_OCCASIONS', payload: occasions })
  }

  const setIntensity = (intensity: 'light' | 'medium' | 'strong') => {
    dispatch({ type: 'SET_INTENSITY', payload: intensity })
  }

  const addPurchase = (productId: string) => {
    dispatch({ type: 'ADD_PURCHASE', payload: productId })
  }

  const addView = (productId: string) => {
    dispatch({ type: 'ADD_VIEW', payload: productId })
  }

  const addToCartHistory = (productId: string) => {
    dispatch({ type: 'ADD_TO_CART_HISTORY', payload: productId })
  }

  const resetPreferences = () => {
    dispatch({ type: 'RESET_PREFERENCES' })
  }

  const hasMinimalPreferences = (): boolean => {
    return state.fragranceTypes.length > 0 || 
           state.favoriteNotes.length > 0 || 
           state.preferredBrands.length > 0 ||
           state.purchaseHistory.length > 0 ||
           state.viewHistory.length > 2
  }

  const value: PreferenceContextType = {
    ...state,
    setFragranceTypes,
    setPriceRange,
    setFavoriteNotes,
    setPreferredBrands,
    setOccasions,
    setIntensity,
    addPurchase,
    addView,
    addToCartHistory,
    resetPreferences,
    hasMinimalPreferences
  }

  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>
}

export const usePreferences = () => {
  const context = useContext(PreferenceContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferenceProvider')
  }
  return context
}