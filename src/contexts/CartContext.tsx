'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/types'
import { cartApiService, BackendCartItem } from '@/services/cartApiService'

interface CartState {
  items: CartItem[]
  totalPrice: number
  totalItems: number
  sessionId: string | null
  userId: string
  isSyncing: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartItem[] }
  | { type: 'SYNC_FROM_BACKEND'; payload: { items: CartItem[]; totalPrice: number; totalItems: number } }
  | { type: 'SET_SESSION'; payload: { sessionId: string; userId: string } }
  | { type: 'SET_SYNCING'; payload: boolean }

interface CartContextType extends CartState {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  setSession: (sessionId: string, userId: string) => void
  syncWithBackend: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        
        return { ...state, items: updatedItems, totalPrice, totalItems }
      }
      
      const newItem: CartItem = { ...action.payload, quantity: 1 }
      const newItems = [...state.items, newItem]
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: newItems, totalPrice, totalItems }
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      const totalPrice = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: filteredItems, totalPrice, totalItems }
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id })
      }
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: updatedItems, totalPrice, totalItems }
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [], totalPrice: 0, totalItems: 0 }
    
    case 'LOAD_FROM_STORAGE': {
      const totalPrice = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      
      return { ...state, items: action.payload, totalPrice, totalItems }
    }
    
    case 'SYNC_FROM_BACKEND':
      return {
        ...state,
        items: action.payload.items,
        totalPrice: action.payload.totalPrice,
        totalItems: action.payload.totalItems,
        isSyncing: false
      }
    
    case 'SET_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        userId: action.payload.userId
      }
    
    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload }
    
    default:
      return state
  }
}

// Helper function to convert backend cart item to frontend cart item
const convertBackendCartItem = (backendItem: BackendCartItem): CartItem => {
  return {
    id: backendItem.product_id,
    name: backendItem.name,
    brand: backendItem.brand,
    price: backendItem.price,
    quantity: backendItem.quantity,
    image: backendItem.image_url || '',
    description: '',
    notes: [],
    category: backendItem.concentration || 'general'
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalPrice: 0,
    totalItems: 0,
    sessionId: null,
    userId: 'guest',
    isSyncing: false
  })

  const [isCartOpen, setIsCartOpen] = React.useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedCart })
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const setSession = (sessionId: string, userId: string) => {
    dispatch({ type: 'SET_SESSION', payload: { sessionId, userId } })
  }

  const syncWithBackend = async () => {
    if (!state.sessionId || !state.userId) {
      console.warn('Cannot sync cart: session not initialized')
      return
    }

    try {
      dispatch({ type: 'SET_SYNCING', payload: true })
      
      const backendCart = await cartApiService.getCartSummary(state.userId, state.sessionId)
      
      // Convert backend items to frontend format
      const frontendItems = backendCart.items.map(convertBackendCartItem)
      
      dispatch({
        type: 'SYNC_FROM_BACKEND',
        payload: {
          items: frontendItems,
          totalPrice: backendCart.total_amount,
          totalItems: backendCart.total_items
        }
      })
    } catch (error) {
      console.warn('Backend cart sync skipped (cart API not available):', error)
      dispatch({ type: 'SET_SYNCING', payload: false })
      // Silently fail - local cart state is preserved
    }
  }

  const addItem = async (product: Product) => {
    // Add to local state immediately for responsive UI
    dispatch({ type: 'ADD_ITEM', payload: product })

    // Sync with backend if session is available (optional - chatbot doesn't have cart API yet)
    if (state.sessionId && state.userId) {
      try {
        await cartApiService.addToCart(state.userId, state.sessionId, product.id, 1)
        // Sync to get updated cart state from backend
        await syncWithBackend()
      } catch (error) {
        console.warn('Backend cart sync failed (expected if chatbot cart API not implemented):', error)
        // Keep local state even if backend fails - this is OK for chatbot recommendations
      }
    }
  }

  const removeItem = async (productId: string) => {
    // Remove from local state immediately
    dispatch({ type: 'REMOVE_ITEM', payload: productId })

    // Sync with backend if session is available
    if (state.sessionId && state.userId) {
      try {
        await cartApiService.removeFromCart(state.userId, state.sessionId, productId)
        await syncWithBackend()
      } catch (error) {
        console.warn('Backend cart sync failed:', error)
      }
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    // Update local state immediately
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })

    // Sync with backend if session is available
    if (state.sessionId && state.userId) {
      try {
        await cartApiService.updateQuantity(state.userId, state.sessionId, productId, quantity)
        await syncWithBackend()
      } catch (error) {
        console.warn('Backend cart sync failed:', error)
      }
    }
  }

  const clearCart = async () => {
    // Clear local state immediately
    dispatch({ type: 'CLEAR_CART' })

    // Sync with backend if session is available
    if (state.sessionId && state.userId) {
      try {
        await cartApiService.clearCart(state.userId, state.sessionId)
      } catch (error) {
        console.warn('Backend cart sync failed:', error)
      }
    }
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    setSession,
    syncWithBackend
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}