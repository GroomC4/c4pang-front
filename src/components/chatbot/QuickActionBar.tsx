'use client'

import React from 'react'
import { QuickActionItem } from '@/types/chatbot'
import { QuickActionButton } from './QuickActionButton'

interface QuickActionBarProps {
  actions: QuickActionItem[]
  onActionClick: (action: QuickActionItem) => void
}

export function QuickActionBar({ actions, onActionClick }: QuickActionBarProps) {
  if (!actions || actions.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px'
      }}
    >
      {actions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          onClick={onActionClick}
        />
      ))}
    </div>
  )
}
