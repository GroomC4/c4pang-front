'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  totalPrice: number
  totalItems: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartItem[] }

interface CartContextType extends CartState {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
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
        
        return { items: updatedItems, totalPrice, totalItems }
      }
      
      const newItem: CartItem = { ...action.payload, quantity: 1 }
      const newItems = [...state.items, newItem]
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { items: newItems, totalPrice, totalItems }
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload)
      const totalPrice = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return { items: filteredItems, totalPrice, totalItems }
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
      
      return { items: updatedItems, totalPrice, totalItems }
    }
    
    case 'CLEAR_CART':
      return { items: [], totalPrice: 0, totalItems: 0 }
    
    case 'LOAD_FROM_STORAGE': {
      const totalPrice = action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      
      return { items: action.payload, totalPrice, totalItems }
    }
    
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalPrice: 0,
    totalItems: 0
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

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
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
    closeCart
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