export interface UserPreferences {
  fragranceTypes: string[]
  priceRange: {
    min: number
    max: number
  }
  favoriteNotes: string[]
  preferredBrands: string[]
  occasions: string[]
  intensity: 'light' | 'medium' | 'strong'
  purchaseHistory: string[]
  viewHistory: string[]
  cartHistory: string[]
}

export interface RecommendationScore {
  productId: string
  score: number
  reasons: string[]
  matchedPreferences: string[]
}

export interface PersonalizedRecommendation {
  product: Product
  score: number
  reasons: string[]
  matchType: 'preference' | 'history' | 'trending' | 'similar'
}

export interface RecommendationFilters {
  category?: string
  maxPrice?: number
  minPrice?: number
  brands?: string[]
  excludeViewed?: boolean
}

import { Product } from '@/types'