'use client'

import { useState } from "react";
import { ShoppingBag, User, LogOut } from "lucide-react";
import Link from "next/link";
import { User as UserType } from '@/types';

interface HeaderProps {
  user?: UserType | null;
  onLogout?: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function Header({
  user,
  onLogout,
  cartItemCount = 0,
  onCartClick,
}: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C4</span>
              </div>
              <div>
                <h2 className="text-purple-600 font-bold">C4pang</h2>
                <p className="text-gray-500 text-xs">
                  Your Signature Scent
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-500 transition-colors"
            >
              홈
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-purple-500 transition-colors"
            >
              제품
            </Link>
            <Link
              href="/best"
              className="text-gray-700 hover:text-purple-500 transition-colors"
            >
              베스트
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-purple-500 transition-colors"
            >
              이벤트
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.username || user.email}님</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-600 hover:text-purple-500 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors">
                    로그인
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full hover:from-purple-600 hover:to-violet-600 transition-all shadow-md hover:shadow-lg">
                    회원가입
                  </button>
                </Link>
              </div>
            )}

            {onCartClick && (
              <button
                onClick={onCartClick}
                className="relative p-2 hover:bg-purple-50 rounded-full transition-colors"
              >
                <ShoppingBag className="w-6 h-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}