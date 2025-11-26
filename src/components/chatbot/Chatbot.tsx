'use client'

import React from 'react'
import { useChatbot } from '@/contexts/ChatbotContext'
import ChatContainer from './ChatContainer'
import ChatToggleButton from './ChatToggleButton'

const Chatbot: React.FC = () => {
  const { state, toggleChatbot } = useChatbot()

  return (
    <>
      <ChatContainer 
        isOpen={state.isOpen} 
        onClose={toggleChatbot} 
      />
      <ChatToggleButton />
    </>
  )
}

export default Chatbot