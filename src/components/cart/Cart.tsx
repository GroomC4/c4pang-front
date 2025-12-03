'use client'

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CartItem } from '@/types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  totalPrice: number;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, totalPrice }: CartProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white h-full w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">장바구니</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🛍️</span>
              </div>
              <p className="text-gray-500 mb-2">장바구니가 비어있습니다</p>
              <p className="text-gray-400 text-sm">마음에 드는 향수를 담아보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-200 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      {item.image && item.image !== '' ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-300 text-3xl">
                          🌸
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-xs text-gray-500">{item.brand}</p>
                          <h4 className="text-gray-800 font-semibold">{item.name}</h4>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-purple-600 font-bold mb-3">
                        {item.price.toLocaleString()}원
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-gray-800 min-w-[2rem] text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gradient-to-t from-purple-50/30 to-white">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">상품 금액</span>
                <span className="text-gray-800">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">배송비</span>
                <span className="text-gray-800">무료</span>
              </div>
              <div className="h-px bg-gray-200 my-3" />
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-bold">총 결제금액</span>
                <span className="text-purple-600 font-bold text-lg">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
            
            <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              결제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}