import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductDetailModal } from './ProductDetailModal'
import { ProductRecommendation } from '@/types/chatbot'

describe('ProductDetailModal', () => {
  const mockProduct: ProductRecommendation = {
    id: 'test-product-1',
    name: '테스트 향수',
    brand: '테스트 브랜드',
    price: 100000,
    image: '/test-image.jpg',
    description: '이것은 테스트 향수의 상세 설명입니다.',
    fragrance: ['플로럴', '우디'],
    notes: {
      top: ['베르가못', '레몬', '오렌지'],
      middle: ['장미', '자스민', '라벤더'],
      base: ['머스크', '샌달우드', '바닐라'],
    },
    season: '봄',
    occasion: '데이트',
  }

  const mockOnClose = vi.fn()
  const mockOnAddToCart = vi.fn()
  const mockOnBuyNow = vi.fn()

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={false}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render all product details when isOpen is true', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    // 브랜드명과 상품명 확인
    expect(screen.getByText(mockProduct.brand)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    
    // 가격 확인
    expect(screen.getByText('100,000원')).toBeInTheDocument()
    
    // 전체 설명 확인
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
  })

  it('should display all note compositions (top, middle, base)', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    // Top Notes
    expect(screen.getByText('Top Notes')).toBeInTheDocument()
    expect(screen.getByText('베르가못')).toBeInTheDocument()
    expect(screen.getByText('레몬')).toBeInTheDocument()
    expect(screen.getByText('오렌지')).toBeInTheDocument()

    // Middle Notes
    expect(screen.getByText('Middle Notes')).toBeInTheDocument()
    expect(screen.getByText('장미')).toBeInTheDocument()
    expect(screen.getByText('자스민')).toBeInTheDocument()
    expect(screen.getByText('라벤더')).toBeInTheDocument()

    // Base Notes
    expect(screen.getByText('Base Notes')).toBeInTheDocument()
    expect(screen.getByText('머스크')).toBeInTheDocument()
    expect(screen.getByText('샌달우드')).toBeInTheDocument()
    expect(screen.getByText('바닐라')).toBeInTheDocument()
  })

  it('should display review summary', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    expect(screen.getByText('리뷰 요약')).toBeInTheDocument()
    expect(screen.getByText('4.8 / 5.0')).toBeInTheDocument()
  })

  it('should have QuickAction buttons for cart and buy now', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const cartButton = screen.getByRole('button', { name: /장바구니 담기/i })
    const buyNowButton = screen.getByRole('button', { name: /바로 구매/i })

    expect(cartButton).toBeInTheDocument()
    expect(buyNowButton).toBeInTheDocument()
  })

  it('should call onAddToCart and close modal when cart button is clicked', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const cartButton = screen.getByRole('button', { name: /장바구니 담기/i })
    fireEvent.click(cartButton)

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct.id)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onBuyNow and close modal when buy now button is clicked', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const buyNowButton = screen.getByRole('button', { name: /바로 구매/i })
    fireEvent.click(buyNowButton)

    expect(mockOnBuyNow).toHaveBeenCalledWith(mockProduct.id)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onClose when close button is clicked', () => {
    render(
      <ProductDetailModal
        product={mockProduct}
        isOpen={true}
        onClose={mockOnClose}
        onAddToCart={mockOnAddToCart}
        onBuyNow={mockOnBuyNow}
      />
    )

    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
