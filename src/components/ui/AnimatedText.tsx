'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  type?: 'word' | 'char'
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  type = 'word'
}) => {
  const words = text.split(' ')
  const chars = text.split('')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: type === 'word' ? 0.1 : 0.05
      }
    }
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  }

  if (type === 'word') {
    return (
      <motion.div
        className={className}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  )
}

export default AnimatedText