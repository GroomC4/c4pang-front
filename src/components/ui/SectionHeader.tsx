'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon?: LucideIcon
  badge?: string
  title: string
  subtitle?: string
  className?: string
  centered?: boolean
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  badge,
  title,
  subtitle,
  className = '',
  centered = true
}) => {
  return (
    <motion.div
      className={`${centered ? 'text-center' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Badge */}
      {(Icon || badge) && (
        <div className={`flex items-center gap-2 mb-6 ${centered ? 'justify-center' : ''}`}>
          {Icon && <Icon className="w-6 h-6 text-pink-500" />}
          {badge && (
            <span className="text-sm font-medium text-gray-600 bg-white/70 px-4 py-2 rounded-full backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>
      )}
      
      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        {title}
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

export default SectionHeader