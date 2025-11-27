'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Search, Tag } from 'lucide-react'
import { FAQItem } from '@/services/recommendationService'

interface FAQViewProps {
  faqs: FAQItem[]
  onSearchFAQ?: (query: string) => void
}

export function FAQView({ faqs, onSearchFAQ }: FAQViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId)
    } else {
      newExpanded.add(faqId)
    }
    setExpandedItems(newExpanded)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onSearchFAQ) {
      onSearchFAQ(searchQuery.trim())
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '보관방법': 'bg-blue-50 text-blue-600 border-blue-200',
      '사용법': 'bg-green-50 text-green-600 border-green-200',
      '교환/반품': 'bg-orange-50 text-orange-600 border-orange-200',
      '배송': 'bg-purple-50 text-purple-600 border-purple-200',
      '상품정보': 'bg-pink-50 text-pink-600 border-pink-200',
      '결제': 'bg-yellow-50 text-yellow-600 border-yellow-200'
    }
    return colors[category] || 'bg-gray-50 text-gray-600 border-gray-200'
  }

  const groupedFAQs = faqs.reduce((groups, faq) => {
    const category = faq.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(faq)
    return groups
  }, {} as Record<string, FAQItem[]>)

  if (faqs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>FAQ를 찾을 수 없습니다.</p>
        <p className="text-sm mt-2">다른 키워드로 검색해보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-500" />
        <span className="font-semibold text-gray-800">자주 묻는 질문</span>
        <span className="text-sm text-gray-500">({faqs.length}개)</span>
      </div>

      {/* 검색 기능 */}
      {onSearchFAQ && (
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FAQ에서 검색하기..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded hover:bg-purple-200 transition-colors"
            >
              검색
            </button>
          </div>
        </form>
      )}

      {/* FAQ 카테고리별 표시 */}
      <div className="space-y-4">
        {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
          <div key={category} className="space-y-2">
            {/* 카테고리 헤더 */}
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
                {category}
              </span>
              <span className="text-xs text-gray-500">({categoryFAQs.length}개)</span>
            </div>

            {/* FAQ 아이템들 */}
            <div className="space-y-2">
              {categoryFAQs
                .sort((a, b) => a.priority - b.priority)
                .map((faq) => {
                  const isExpanded = expandedItems.has(faq.id)
                  return (
                    <div
                      key={faq.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-200 transition-colors"
                    >
                      {/* 질문 */}
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 pr-3">
                          <h4 className="text-sm font-medium text-gray-800 leading-relaxed">
                            {faq.question}
                          </h4>
                          {faq.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {faq.keywords.slice(0, 3).map((keyword, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  #{keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* 답변 */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="pt-3">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* 추가 도움말 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              더 도움이 필요하신가요?
            </h4>
            <p className="text-sm text-blue-600">
              원하는 답변을 찾지 못하셨다면 고객센터로 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}