/**
 * Property-Based Tests for CartContext
 * 
 * This file contains property-based tests for cart operations including:
 * - Property 6: Cart addition consistency
 * - Property 8: Quantity increment
 * - Property 9: Quantity decrement
 * - Property 10: Zero quantity removal
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import fc from 'fast-check'
import { CartProvider, useCart } from './CartContext'
import { Product } from '@/types'

// Helper to render the hook with provider
const renderCartHook = () => {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
  })
}

// Helper to generate non-whitespace strings
const nonWhitespaceString = (minLength: number, maxLength: number) =>
  fc.string({ minLength, maxLength })
    .filter(s => s.trim().length > 0)

// Arbitrary generator for Product
const productArbitrary = fc.record({
  id: nonWhitespaceString(1, 20),
  name: nonWhitespaceString(1, 50),
  brand: nonWhitespaceString(1, 30),
  price: fc.integer({ min: 1000, max: 500000 }),
  description: nonWhitespaceString(10, 200),
  notes: fc.array(nonWhitespaceString(1, 20), { minLength: 1, maxLength: 10 }),
  image: nonWhitespaceString(1, 100),
  category: fc.constantFrom('floral', 'woody', 'citrus', 'oriental', 'fresh', 'general')
})

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear()
})

describe('CartContext - Property Tests', () => {
  /**
   * **Feature: chatbot-purchase-flow, Property 6: Cart addition consistency**
   * For any product, adding it to the cart should result in a CartItem with 
   * matching productId appearing in the CartContext
   * **Validates: Requirements 3.1**
   */
  describe('Property 6: Cart addition consistency', () => {
    it('should add product to cart with matching productId', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          (product) => {
            // Clear localStorage before each property test run
            localStorage.clear()
            
            const { result } = renderCartHook()

            // Add product to cart
            act(() => {
              result.current.addItem(product)
            })

            // Verify the product appears in cart with matching id
            const cartItem = result.current.items.find(item => item.id === product.id)
            
            return (
              cartItem !== undefined &&
              cartItem.id === product.id &&
              cartItem.name === product.name &&
              cartItem.brand === product.brand &&
              cartItem.price === product.price &&
              cartItem.quantity === 1
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should add multiple different products to cart', () => {
      fc.assert(
        fc.property(
          fc.array(productArbitrary, { minLength: 1, maxLength: 10 }),
          (products) => {
            // Ensure unique product IDs
            const uniqueProducts = products.filter((product, index, self) =>
              index === self.findIndex(p => p.id === product.id)
            )

            if (uniqueProducts.length === 0) return true

            const { result } = renderCartHook()

            // Add all products to cart
            act(() => {
              uniqueProducts.forEach(product => {
                result.current.addItem(product)
              })
            })

            // Verify all products are in cart
            return uniqueProducts.every(product => {
              const cartItem = result.current.items.find(item => item.id === product.id)
              return cartItem !== undefined && cartItem.id === product.id
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should increment quantity when adding same product twice', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          (product) => {
            // Clear localStorage before each property test run
            localStorage.clear()
            
            const { result } = renderCartHook()

            // Add product twice
            act(() => {
              result.current.addItem(product)
              result.current.addItem(product)
            })

            // Verify quantity is 2
            const cartItem = result.current.items.find(item => item.id === product.id)
            
            return (
              cartItem !== undefined &&
              cartItem.quantity === 2 &&
              result.current.items.length === 1
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: chatbot-purchase-flow, Property 8: Quantity increment**
   * For any CartItem, clicking the quantity increase button should result in 
   * the quantity being exactly 1 greater than before
   * **Validates: Requirements 4.1**
   */
  describe('Property 8: Quantity increment', () => {
    it('should increment quantity by exactly 1', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.integer({ min: 1, max: 99 }),
          (product, initialQuantity) => {
            const { result } = renderCartHook()

            // Add product and set initial quantity
            act(() => {
              result.current.addItem(product)
              result.current.updateQuantity(product.id, initialQuantity)
            })

            const beforeQuantity = result.current.items.find(item => item.id === product.id)?.quantity

            // Increment quantity
            act(() => {
              result.current.updateQuantity(product.id, initialQuantity + 1)
            })

            const afterQuantity = result.current.items.find(item => item.id === product.id)?.quantity

            return (
              beforeQuantity === initialQuantity &&
              afterQuantity === initialQuantity + 1
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update totalItems correctly after increment', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.integer({ min: 1, max: 50 }),
          (product, initialQuantity) => {
            const { result } = renderCartHook()

            // Add product and set initial quantity
            act(() => {
              result.current.addItem(product)
              result.current.updateQuantity(product.id, initialQuantity)
            })

            const beforeTotalItems = result.current.totalItems

            // Increment quantity
            act(() => {
              result.current.updateQuantity(product.id, initialQuantity + 1)
            })

            const afterTotalItems = result.current.totalItems

            return afterTotalItems === beforeTotalItems + 1
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: chatbot-purchase-flow, Property 9: Quantity decrement**
   * For any CartItem with quantity > 1, clicking the quantity decrease button 
   * should result in the quantity being exactly 1 less than before
   * **Validates: Requirements 4.2**
   */
  describe('Property 9: Quantity decrement', () => {
    it('should decrement quantity by exactly 1 when quantity > 1', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.integer({ min: 2, max: 100 }),
          (product, initialQuantity) => {
            const { result } = renderCartHook()

            // Add product and set initial quantity
            act(() => {
              result.current.addItem(product)
              result.current.updateQuantity(product.id, initialQuantity)
            })

            const beforeQuantity = result.current.items.find(item => item.id === product.id)?.quantity

            // Decrement quantity
            act(() => {
              result.current.updateQuantity(product.id, initialQuantity - 1)
            })

            const afterQuantity = result.current.items.find(item => item.id === product.id)?.quantity

            return (
              beforeQuantity === initialQuantity &&
              afterQuantity === initialQuantity - 1
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update totalItems correctly after decrement', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          fc.integer({ min: 2, max: 50 }),
          (product, initialQuantity) => {
            const { result } = renderCartHook()

            // Add product and set initial quantity
            act(() => {
              result.current.addItem(product)
              result.current.updateQuantity(product.id, initialQuantity)
            })

            const beforeTotalItems = result.current.totalItems

            // Decrement quantity
            act(() => {
              result.current.updateQuantity(product.id, initialQuantity - 1)
            })

            const afterTotalItems = result.current.totalItems

            return afterTotalItems === beforeTotalItems - 1
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: chatbot-purchase-flow, Property 10: Zero quantity removal**
   * For any CartItem with quantity = 1, decreasing the quantity should result 
   * in the item being removed from the CartContext
   * **Validates: Requirements 4.3**
   */
  describe('Property 10: Zero quantity removal', () => {
    it('should remove item when quantity becomes 0', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          (product) => {
            const { result } = renderCartHook()

            // Add product with quantity 1
            act(() => {
              result.current.addItem(product)
            })

            // Verify item exists
            const beforeItem = result.current.items.find(item => item.id === product.id)
            if (!beforeItem || beforeItem.quantity !== 1) return false

            // Set quantity to 0
            act(() => {
              result.current.updateQuantity(product.id, 0)
            })

            // Verify item is removed
            const afterItem = result.current.items.find(item => item.id === product.id)

            return afterItem === undefined
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should remove item when decreasing quantity from 1 to 0', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          (product) => {
            const { result } = renderCartHook()

            // Add product with quantity 1
            act(() => {
              result.current.addItem(product)
            })

            const itemsBefore = result.current.items.length

            // Decrease quantity to 0
            act(() => {
              result.current.updateQuantity(product.id, 0)
            })

            const itemsAfter = result.current.items.length
            const itemExists = result.current.items.some(item => item.id === product.id)

            return (
              itemsBefore === 1 &&
              itemsAfter === 0 &&
              !itemExists
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update totalItems to 0 when removing last item', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          (product) => {
            const { result } = renderCartHook()

            // Add product with quantity 1
            act(() => {
              result.current.addItem(product)
            })

            // Set quantity to 0
            act(() => {
              result.current.updateQuantity(product.id, 0)
            })

            return result.current.totalItems === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update totalPrice to 0 when removing last item', () => {
      fc.assert(
        fc.property(
          productArbitrary,
          (product) => {
            const { result } = renderCartHook()

            // Add product with quantity 1
            act(() => {
              result.current.addItem(product)
            })

            // Set quantity to 0
            act(() => {
              result.current.updateQuantity(product.id, 0)
            })

            return result.current.totalPrice === 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Additional property tests for cart consistency
   */
  describe('Cart State Consistency', () => {
    it('should maintain correct totalPrice after any cart operation', () => {
      fc.assert(
        fc.property(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          (products) => {
            // Ensure unique product IDs
            const uniqueProducts = products.filter((product, index, self) =>
              index === self.findIndex(p => p.id === product.id)
            )

            if (uniqueProducts.length === 0) return true

            const { result } = renderCartHook()

            // Add all products
            act(() => {
              uniqueProducts.forEach(product => {
                result.current.addItem(product)
              })
            })

            // Calculate expected total price
            const expectedTotal = result.current.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            )

            return result.current.totalPrice === expectedTotal
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain correct totalItems after any cart operation', () => {
      fc.assert(
        fc.property(
          fc.array(productArbitrary, { minLength: 1, maxLength: 5 }),
          (products) => {
            // Ensure unique product IDs
            const uniqueProducts = products.filter((product, index, self) =>
              index === self.findIndex(p => p.id === product.id)
            )

            if (uniqueProducts.length === 0) return true

            const { result } = renderCartHook()

            // Add all products
            act(() => {
              uniqueProducts.forEach(product => {
                result.current.addItem(product)
              })
            })

            // Calculate expected total items
            const expectedTotal = result.current.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )

            return result.current.totalItems === expectedTotal
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
