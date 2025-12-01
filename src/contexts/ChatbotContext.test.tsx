/**
 * Property-Based Tests for ChatbotContext
 * 
 * **Feature: chatbot-purchase-flow, Property 1: Preference storage consistency**
 * For any user preference input (fragrance type, price range, brand, occasion), 
 * storing the preference in ConversationContext should result in that preference 
 * being retrievable from the context
 * **Validates: Requirements 1.2**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import fc from 'fast-check'
import { ChatbotProvider, useChatbot } from './ChatbotContext'
import { UserPreferences } from '@/types/recommendation'

// Helper to render the hook with provider
const renderChatbotHook = () => {
  return renderHook(() => useChatbot(), {
    wrapper: ({ children }) => <ChatbotProvider>{children}</ChatbotProvider>,
  })
}

// Clear sessionStorage before and after each test
beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  sessionStorage.clear()
})

describe('ChatbotContext - Preference Storage', () => {
  /**
   * **Feature: chatbot-purchase-flow, Property 1: Preference storage consistency**
   * For any user preference input (fragrance type, price range, brand, occasion), 
   * storing the preference in ConversationContext should result in that preference 
   * being retrievable from the context
   * **Validates: Requirements 1.2**
   */
  it('should store and retrieve fragrance types consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        (fragranceTypes) => {
          const { result } = renderChatbotHook()

          // Store the preference using the proper API
          act(() => {
            result.current.updatePreferences({ fragranceTypes })
          })

          // Retrieve and verify
          const storedFragranceTypes = result.current.state.conversationContext.preferences.fragranceTypes
          
          return (
            storedFragranceTypes.length === fragranceTypes.length &&
            storedFragranceTypes.every((type, index) => type === fragranceTypes[index])
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store and retrieve price range consistently', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500000 }),
        fc.integer({ min: 0, max: 500000 }),
        (minPrice, maxPrice) => {
          const [min, max] = minPrice <= maxPrice ? [minPrice, maxPrice] : [maxPrice, minPrice]
          const { result } = renderChatbotHook()

          // Store the preference using the proper API
          act(() => {
            result.current.updatePreferences({ priceRange: { min, max } })
          })

          // Retrieve and verify
          const storedPriceRange = result.current.state.conversationContext.preferences.priceRange
          
          return storedPriceRange.min === min && storedPriceRange.max === max
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store and retrieve preferred brands consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 15 }),
        (preferredBrands) => {
          const { result } = renderChatbotHook()

          // Store the preference using the proper API
          act(() => {
            result.current.updatePreferences({ preferredBrands })
          })

          // Retrieve and verify
          const storedBrands = result.current.state.conversationContext.preferences.preferredBrands
          
          return (
            storedBrands.length === preferredBrands.length &&
            storedBrands.every((brand, index) => brand === preferredBrands[index])
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store and retrieve occasions consistently', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom('데이트', '출근', '캐주얼', '파티', '운동', '여행'),
          { minLength: 0, maxLength: 6 }
        ),
        (occasions) => {
          const { result } = renderChatbotHook()

          // Store the preference using the proper API
          act(() => {
            result.current.updatePreferences({ occasions })
          })

          // Retrieve and verify
          const storedOccasions = result.current.state.conversationContext.preferences.occasions
          
          return (
            storedOccasions.length === occasions.length &&
            storedOccasions.every((occasion, index) => occasion === occasions[index])
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store and retrieve favorite notes consistently', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 20 }),
        (favoriteNotes) => {
          const { result } = renderChatbotHook()

          // Store the preference using the proper API
          act(() => {
            result.current.updatePreferences({ favoriteNotes })
          })

          // Retrieve and verify
          const storedNotes = result.current.state.conversationContext.preferences.favoriteNotes
          
          return (
            storedNotes.length === favoriteNotes.length &&
            storedNotes.every((note, index) => note === favoriteNotes[index])
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store and retrieve intensity consistently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'medium', 'strong'),
        (intensity) => {
          const { result } = renderChatbotHook()

          // Store the preference using the proper API
          act(() => {
            result.current.updatePreferences({ intensity })
          })

          // Retrieve and verify
          const storedIntensity = result.current.state.conversationContext.preferences.intensity
          
          return storedIntensity === intensity
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should store and retrieve multiple preferences consistently', () => {
    fc.assert(
      fc.property(
        fc.record({
          fragranceTypes: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
          priceRange: fc.record({
            min: fc.integer({ min: 0, max: 250000 }),
            max: fc.integer({ min: 250000, max: 500000 })
          }),
          preferredBrands: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 15 }),
          occasions: fc.array(
            fc.constantFrom('데이트', '출근', '캐주얼', '파티', '운동', '여행'),
            { minLength: 0, maxLength: 6 }
          ),
          favoriteNotes: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 20 }),
          intensity: fc.constantFrom('light', 'medium', 'strong')
        }),
        (preferences) => {
          const { result } = renderChatbotHook()

          // Store all preferences using the proper API
          act(() => {
            result.current.updatePreferences(preferences)
          })

          // Retrieve and verify all preferences
          const stored = result.current.state.conversationContext.preferences
          
          return (
            stored.fragranceTypes.length === preferences.fragranceTypes.length &&
            stored.fragranceTypes.every((type, i) => type === preferences.fragranceTypes[i]) &&
            stored.priceRange.min === preferences.priceRange.min &&
            stored.priceRange.max === preferences.priceRange.max &&
            stored.preferredBrands.length === preferences.preferredBrands.length &&
            stored.preferredBrands.every((brand, i) => brand === preferences.preferredBrands[i]) &&
            stored.occasions.length === preferences.occasions.length &&
            stored.occasions.every((occasion, i) => occasion === preferences.occasions[i]) &&
            stored.favoriteNotes.length === preferences.favoriteNotes.length &&
            stored.favoriteNotes.every((note, i) => note === preferences.favoriteNotes[i]) &&
            stored.intensity === preferences.intensity
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
