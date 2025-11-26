'use client'

import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onAddToCart: () => void;
}

export function ProductCard({ product, onClick, onAddToCart }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart();
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-violet-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-purple-600">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        <h3 className="text-gray-800 mb-2 font-semibold">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {product.notes.slice(0, 3).map((note, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
            >
              {note}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-purple-600 font-bold">{product.price.toLocaleString()}원</span>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full hover:from-purple-600 hover:to-violet-600 transition-all shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}