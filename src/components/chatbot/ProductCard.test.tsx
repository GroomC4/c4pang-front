import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from './ProductCard'
import { ProductRecommendation } from '@/types/chatbot'
import fc from 'fast-check'

describe('ProductCard', () => {
  const mockProduct: ProductRecommendation = {
    id: 'test-product-1',
    name: '테스트 향수',
    brand: '테스트 브랜드',
    price: 100000,
    image: '/test-image.jpg',
    description: '테스트 설명입니다.',
    fragrance: ['플로럴', '우디'],
    notes: {
      top: ['베르가못', '레몬'],
      middle: ['장미', '자스민'],
      base: ['머스크', '샌달우드'],
    },
    season: '봄',
    occasion: '데이트',
  }

  const mockOnAddToCart = vi.fn()
  const mockOnBuyNow = vi.fn()

  it('should render all required product information', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    // 브랜드명 확인
    expect(screen.getByText(mockProduct.brand)).toBeInTheDocument()
    
    // 상품명 확인
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    
    // 가격 확인
    expect(screen.getByText('100,000원')).toBeInTheDocument()
    
    // 주요 노트 확인 (top notes 중 첫 3개)
    expect(screen.getByText('베르가못')).toBeInTheDocument()
    expect(screen.getByText('레몬')).toBeInTheDocument()
  })

  it('should call onAddToCart when cart button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const cartButton = screen.getByTitle('장바구니 담기')
    fireEvent.click(cartButton)

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id)
  })

  it('should call onBuyNow when buy now button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const buyNowButton = screen.getByTitle('바로 구매')
    fireEvent.click(buyNowButton)

    expect(mockOnBuyNow).toHaveBeenCalledWith(mockProduct.id)
  })

  it('should have view details button', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const viewDetailsButton = screen.getByText('상세보기')
    expect(viewDetailsButton).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
        disabled={true}
      />
    )

    const cartButton = screen.getByTitle('장바구니 담기')
    const buyNowButton = screen.getByTitle('바로 구매')
    const viewDetailsButton = screen.getByRole('button', { name: /상세보기/i })

    expect(cartButton).toBeDisabled()
    expect(buyNowButton).toBeDisabled()
    expect(viewDetailsButton).toBeDisabled()
  })

  /**
   * **Feature: chatbot-purchase-flow, Property 5: ProductCard completeness**
   * For any product recommendation, the rendered ProductCard should contain 
   * all required fields: image, brand name, product name, price, and main notes
   * **Validates: Requirements 2.2**
   */
  it('should contain all required fields for any product recommendation', () => {
    // Generator for alphanumeric strings (excluding special HTML characters and whitespace-only strings)
    const alphanumericString = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0 && !/[<>&"']/.test(s))

    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: alphanumericString,
          brand: alphanumericString,
          price: fc.integer({ min: 1000, max: 1000000 }),
          image: fc.webUrl(),
          description: alphanumericString,
          fragrance: fc.array(alphanumericString, { minLength: 1, maxLength: 5 }),
          notes: fc.record({
            top: fc.array(alphanumericString, { minLength: 1, maxLength: 5 }),
            middle: fc.array(alphanumericString, { minLength: 1, maxLength: 5 }),
            base: fc.array(alphanumericString, { minLength: 1, maxLength: 5 }),
          }),
          season: fc.option(fc.constantFrom('봄', '여름', '가을', '겨울'), { nil: undefined }),
          occasion: fc.option(fc.constantFrom('데이트', '출근', '캐주얼', '파티'), { nil: undefined }),
        }),
        (product: ProductRecommendation) => {
          const { container } = render(
            <ProductCard
              product={product}
              onAddToCart={vi.fn()}
              onBuyNow={vi.fn()}
            />
          )

          const html = container.innerHTML

          // Check that all required fields are present in the rendered output
          const hasBrand = html.includes(product.brand)
          const hasName = html.includes(product.name)
          const hasPrice = html.includes(product.price.toLocaleString())
          const hasImage = container.querySelector('img') !== null
          
          // Check that at least one main note is displayed (top notes are prioritized)
          const mainNotes = product.notes?.top?.slice(0, 3) || product.fragrance?.slice(0, 3) || []
          const hasMainNotes = mainNotes.length === 0 || mainNotes.some(note => html.includes(note))

          return hasBrand && hasName && hasPrice && hasImage && hasMainNotes
        }
      ),
      { numRuns: 100 }
    )
  })
})
