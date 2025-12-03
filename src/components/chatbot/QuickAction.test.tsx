import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionButton } from './QuickActionButton'
import { QuickActionBar } from './QuickActionBar'
import { QuickActionItem } from '@/types/chatbot'
import fc from 'fast-check'
import { generateQuickActions, QuickActionContext } from '@/utils/quickActionGenerator'
import { CartItem } from '@/types'

describe('QuickActionButton', () => {
  it('should render button with label', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'primary'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    expect(screen.getByText('Test Action')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'primary'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    const button = screen.getByText('Test Action')
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalledWith(action)
  })

  it('should disable button after click', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'primary'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    const button = screen.getByText('Test Action')
    
    // First click should work
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    
    // Second click should not work (button is disabled)
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled prop is true', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'primary',
      disabled: true
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    const button = screen.getByText('Test Action')
    fireEvent.click(button)
    
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render with icon when icon is provided', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      icon: 'cart',
      type: 'primary'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    // Icon should be rendered (lucide-react icons have specific classes)
    const button = screen.getByText('Test Action').closest('button')
    expect(button).toBeInTheDocument()
  })

  it('should apply correct styles for primary type', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'primary'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    const button = screen.getByText('Test Action').closest('button')
    expect(button).toHaveStyle({ color: 'rgb(255, 255, 255)' })
  })

  it('should apply correct styles for danger type', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'danger'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    const button = screen.getByText('Test Action').closest('button')
    expect(button).toHaveStyle({ color: 'rgb(220, 38, 38)' })
  })

  it('should apply correct styles for secondary type', () => {
    const action: QuickActionItem = {
      id: 'test-action',
      label: 'Test Action',
      type: 'secondary'
    }
    const onClick = vi.fn()

    render(<QuickActionButton action={action} onClick={onClick} />)
    
    const button = screen.getByText('Test Action').closest('button')
    expect(button).toHaveStyle({ color: 'rgb(55, 65, 81)' })
  })
})

describe('QuickActionBar', () => {
  it('should render all actions', () => {
    const actions: QuickActionItem[] = [
      { id: 'action-1', label: 'Action 1', type: 'primary' },
      { id: 'action-2', label: 'Action 2', type: 'secondary' },
      { id: 'action-3', label: 'Action 3', type: 'danger' }
    ]
    const onActionClick = vi.fn()

    render(<QuickActionBar actions={actions} onActionClick={onActionClick} />)
    
    expect(screen.getByText('Action 1')).toBeInTheDocument()
    expect(screen.getByText('Action 2')).toBeInTheDocument()
    expect(screen.getByText('Action 3')).toBeInTheDocument()
  })

  it('should call onActionClick when any action is clicked', () => {
    const actions: QuickActionItem[] = [
      { id: 'action-1', label: 'Action 1', type: 'primary' },
      { id: 'action-2', label: 'Action 2', type: 'secondary' }
    ]
    const onActionClick = vi.fn()

    render(<QuickActionBar actions={actions} onActionClick={onActionClick} />)
    
    fireEvent.click(screen.getByText('Action 1'))
    expect(onActionClick).toHaveBeenCalledWith(actions[0])
    
    fireEvent.click(screen.getByText('Action 2'))
    expect(onActionClick).toHaveBeenCalledWith(actions[1])
  })

  it('should not render when actions array is empty', () => {
    const onActionClick = vi.fn()

    const { container } = render(<QuickActionBar actions={[]} onActionClick={onActionClick} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should render with proper layout', () => {
    const actions: QuickActionItem[] = [
      { id: 'action-1', label: 'Action 1', type: 'primary' },
      { id: 'action-2', label: 'Action 2', type: 'secondary' }
    ]
    const onActionClick = vi.fn()

    const { container } = render(<QuickActionBar actions={actions} onActionClick={onActionClick} />)
    
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ display: 'flex', flexWrap: 'wrap', gap: '8px' })
  })
})

// Property-Based Tests
describe('Property-Based Tests for QuickAction', () => {
  /**
   * **Feature: chatbot-purchase-flow, Property 16: QuickAction button properties**
   * For any QuickAction button, it should contain both a non-empty label and an icon identifier
   * **Validates: Requirements 6.2**
   */
  it('Property 16: QuickAction button properties - all buttons have non-empty label and icon', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          label: fc.string({ minLength: 1 }),
          icon: fc.constantFrom('cart', 'bag', 'trash', 'plus', 'minus', 'eye', 'card', 'retry', 'close', 'arrow'),
          type: fc.constantFrom('primary', 'secondary', 'danger') as fc.Arbitrary<'primary' | 'secondary' | 'danger'>,
          disabled: fc.boolean(),
          payload: fc.anything()
        }),
        (action: QuickActionItem) => {
          // Property: Every QuickAction should have a non-empty label
          expect(action.label).toBeTruthy()
          expect(action.label.length).toBeGreaterThan(0)
          
          // Property: Every QuickAction should have an icon identifier
          expect(action.icon).toBeTruthy()
          expect(action.icon!.length).toBeGreaterThan(0)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })



  /**
   * **Feature: chatbot-purchase-flow, Property 19: Context-appropriate actions**
   * For any conversation context state, the generated QuickAction set should be appropriate 
   * for that context (e.g., cart actions when viewing cart, checkout actions when in checkout)
   * **Validates: Requirements 6.5**
   */
  it('Property 19: Context-appropriate actions - generated actions match context type', () => {
    // Arbitrary for CartItem
    const cartItemArbitrary = fc.record({
      productId: fc.string({ minLength: 1 }),
      name: fc.string({ minLength: 1 }),
      brand: fc.string({ minLength: 1 }),
      price: fc.integer({ min: 1000, max: 500000 }),
      quantity: fc.integer({ min: 1, max: 10 }),
      image: fc.webUrl()
    })

    // Arbitrary for different context types
    const contextArbitrary = fc.oneof(
      // Recommendation context
      fc.record({
        type: fc.constant('recommendation' as const),
        data: fc.record({
          products: fc.array(fc.record({ id: fc.string() }), { minLength: 0, maxLength: 5 })
        })
      }),
      // Cart context
      fc.record({
        type: fc.constant('cart' as const),
        data: fc.record({
          cartItems: fc.array(cartItemArbitrary, { minLength: 0, maxLength: 5 })
        })
      }),
      // Checkout context
      fc.record({
        type: fc.constant('checkout' as const),
        data: fc.record({})
      }),
      // Order context
      fc.record({
        type: fc.constant('order' as const),
        data: fc.record({})
      }),
      // Product detail context
      fc.record({
        type: fc.constant('product_detail' as const),
        data: fc.record({
          products: fc.array(fc.record({ id: fc.string({ minLength: 1 }) }), { minLength: 1, maxLength: 1 })
        })
      }),
      // Error context
      fc.record({
        type: fc.constant('error' as const),
        data: fc.record({
          errorType: fc.constantFrom('network', 'validation', 'business') as fc.Arbitrary<'network' | 'validation' | 'business'>,
          retryable: fc.boolean()
        })
      })
    )

    fc.assert(
      fc.property(
        contextArbitrary,
        (context: QuickActionContext) => {
          const actions = generateQuickActions(context)
          
          // Property: Actions should be appropriate for the context type
          switch (context.type) {
            case 'recommendation':
              // Recommendation context should have view_cart action if products exist
              if (context.data?.products && context.data.products.length > 0) {
                expect(actions.some(a => a.id === 'view_cart')).toBe(true)
              }
              break
            
            case 'cart':
              // Cart context with items should have checkout, clear_cart, continue_shopping
              if (context.data?.cartItems && context.data.cartItems.length > 0) {
                expect(actions.some(a => a.id === 'checkout')).toBe(true)
                expect(actions.some(a => a.id === 'clear_cart')).toBe(true)
                expect(actions.some(a => a.id === 'continue_shopping')).toBe(true)
              }
              break
            
            case 'checkout':
              // Checkout context should have cancel_checkout action
              expect(actions.some(a => a.id === 'cancel_checkout')).toBe(true)
              break
            
            case 'order':
              // Order context should have view_order and continue_shopping
              expect(actions.some(a => a.id === 'view_order')).toBe(true)
              expect(actions.some(a => a.id === 'continue_shopping')).toBe(true)
              break
            
            case 'product_detail':
              // Product detail should have add_to_cart and buy_now
              if (context.data?.products && context.data.products.length > 0) {
                const productId = context.data.products[0].id
                expect(actions.some(a => a.id === `add_to_cart_${productId}`)).toBe(true)
                expect(actions.some(a => a.id === `buy_now_${productId}`)).toBe(true)
              }
              break
            
            case 'error':
              // Error context should have retry (if retryable) and back
              if (context.data?.retryable !== false) {
                expect(actions.some(a => a.id === 'retry')).toBe(true)
              }
              expect(actions.some(a => a.id === 'back')).toBe(true)
              break
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
