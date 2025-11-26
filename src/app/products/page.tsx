'use client'

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ProductList } from '@/components/product/ProductList';
import { Cart } from '@/components/cart/Cart';
import Chatbot from '@/components/chatbot/Chatbot';
import { Product, CartItem } from '@/types';

const mockProducts: Product[] = [
  {
    id: '1',
    name: '로즈 블룸',
    brand: 'Élégance',
    price: 89000,
    description: '장미와 피오니의 우아한 조화로 여성스러운 매력을 발산하는 플로럴 향수',
    notes: ['장미', '피오니', '머스크'],
    image: 'https://images.unsplash.com/photo-1559681287-729c821646f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3NlJTIwcGVyZnVtZXxlbnwxfHx8fDE3NjQwNjA2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '플로럴'
  },
  {
    id: '2',
    name: '핑크 드림',
    brand: 'Blossom',
    price: 125000,
    description: '달콤하고 상큼한 프루티 플로럴 향으로 로맨틱한 분위기를 연출',
    notes: ['피치', '프리지아', '바닐라'],
    image: 'https://images.unsplash.com/photo-1678984633768-c4fd5a01732a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwcGVyZnVtZSUyMGVsZWdhbnR8ZW58MXx8fHwxNzY0MDc2NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '프루티'
  },
  {
    id: '3',
    name: '플로럴 가든',
    brand: 'Nature',
    price: 95000,
    description: '봄날 정원을 거니는 듯한 생생한 플로럴 부케 향수',
    notes: ['재스민', '라일락', '시더우드'],
    image: 'https://images.unsplash.com/photo-1763986665850-6e66549aa8e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBwZXJmdW1lJTIwYm90dGxlfGVufDF8fHx8MTc2NDEzMjg1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: '플로럴'
  },
  {
    id: '4',
    name: '모던 뮤즈',
    brand: 'Urban',
    price: 145000,
    description: '도시적이고 세련된 우디 플로럴 향으로 현대 여성의 감각을 표현',
    notes: ['아이리스', '샌달우드', '앰버'],
    image: 'https://images.unsplash.com/photo-1647507653704-bde7f2d6dbf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwZXJmdW1lJTIwYm90dGxlfGVufDF8fHx8MTc2NDEyNTI3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: '우디'
  },
  {
    id: '5',
    name: '소프트 엘레강스',
    brand: 'Délicate',
    price: 110000,
    description: '부드럽고 은은한 파우더리 플로럴 향으로 우아함을 더하는 향수',
    notes: ['바이올렛', '아이리스', '파우더'],
    image: 'https://images.unsplash.com/photo-1630527944112-4cd7a3c11a55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1pbmluZSUyMHBlcmZ1bWV8ZW58MXx8fHwxNzY0MTMyODU2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '파우더리'
  },
  {
    id: '6',
    name: '럭셔리 에센스',
    brand: 'Prestige',
    price: 185000,
    description: '프리미엄 성분으로 제조된 럭셔리 오리엔탈 플로럴 향수',
    notes: ['오키드', '바닐라', '통카빈'],
    image: 'https://images.unsplash.com/photo-1719175936556-dbd05e415913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlfGVufDF8fHx8MTc2NDA5OTg2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: '오리엔탈'
  }
];

export default function ProductsPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50">
      <Header
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-purple-600 mb-4">
            향수 컬렉션
          </h1>
          <p className="text-gray-600 text-lg">
            당신만의 시그니처 향을 찾아보세요
          </p>
        </div>

        <ProductList
          products={mockProducts}
          onProductClick={setSelectedProduct}
          onAddToCart={addToCart}
        />
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        totalPrice={getTotalPrice()}
      />

      <Chatbot />
    </div>
  );
}