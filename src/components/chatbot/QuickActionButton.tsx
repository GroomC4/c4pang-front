'use client'

import React, { useState } from 'react'
import { QuickActionItem } from '@/types/chatbot'
import { 
  ShoppingCart, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Eye,
  CreditCard,
  RotateCcw,
  X,
  ArrowRight
} from 'lucide-react'

interface QuickActionButtonProps {
  action: QuickActionItem
  onClick: (action: QuickActionItem) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'cart': ShoppingCart,
  'bag': ShoppingBag,
  'trash': Trash2,
  'plus': Plus,
  'minus': Minus,
  'eye': Eye,
  'card': CreditCard,
  'retry': RotateCcw,
  'close': X,
  'arrow': ArrowRight
}

export function QuickActionButton({ action, onClick }: QuickActionButtonProps) {
  const [isClicked, setIsClicked] = useState(false)
  const Icon = action.icon ? iconMap[action.icon] : null
  
  // Button is disabled if action.disabled is true OR if it has been clicked
  const isDisabled = action.disabled || isClicked

  const getButtonStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'all 0.2s',
      whiteSpace: 'nowrap' as const
    }

    switch (action.type) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: '#9333ea',
          color: 'white'
        }
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: '#fee2e2',
          color: '#dc2626'
        }
      case 'secondary':
      default:
        return {
          ...baseStyles,
          backgroundColor: '#f3f4f6',
          color: '#374151'
        }
    }
  }

  const handleClick = () => {
    if (!isDisabled) {
      setIsClicked(true)
      onClick(action)
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      e.currentTarget.style.transform = 'scale(1.05)'
      if (action.type === 'primary') {
        e.currentTarget.style.backgroundColor = '#7e22ce'
      } else if (action.type === 'danger') {
        e.currentTarget.style.backgroundColor = '#fecaca'
      } else {
        e.currentTarget.style.backgroundColor = '#e5e7eb'
      }
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)'
    if (action.type === 'primary') {
      e.currentTarget.style.backgroundColor = '#9333ea'
    } else if (action.type === 'danger') {
      e.currentTarget.style.backgroundColor = '#fee2e2'
    } else {
      e.currentTarget.style.backgroundColor = '#f3f4f6'
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      style={getButtonStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={action.label}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{action.label}</span>
    </button>
  )
}
