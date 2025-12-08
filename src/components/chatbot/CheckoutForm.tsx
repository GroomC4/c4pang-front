'use client'

import { useState } from 'react'
import { ShippingInfo, PaymentMethod } from '@/types/chatbot'
import { CreditCard, Building2, Smartphone, X } from 'lucide-react'

interface CheckoutFormProps {
  step: 'shipping' | 'payment'
  onSubmit: (data: ShippingInfo | PaymentMethod) => void
  onCancel: () => void
  initialData?: ShippingInfo | PaymentMethod
}

export function CheckoutForm({ step, onSubmit, onCancel, initialData }: CheckoutFormProps) {
  if (step === 'shipping') {
    return <ShippingForm onSubmit={onSubmit} onCancel={onCancel} initialData={initialData as ShippingInfo} />
  }
  
  return <PaymentForm onSubmit={onSubmit} onCancel={onCancel} initialData={initialData as PaymentMethod} />
}

// ShippingForm Component
interface ShippingFormProps {
  onSubmit: (data: ShippingInfo) => void
  onCancel: () => void
  initialData?: ShippingInfo
}

function ShippingForm({ onSubmit, onCancel, initialData }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingInfo>({
    recipientName: initialData?.recipientName || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    addressDetail: initialData?.addressDetail || '',
    postalCode: initialData?.postalCode || '',
    deliveryMessage: initialData?.deliveryMessage || ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingInfo, string>> = {}

    // 수령인 검증
    if (!formData.recipientName.trim()) {
      newErrors.recipientName = '수령인 이름을 입력해주세요'
    } else if (formData.recipientName.trim().length < 2) {
      newErrors.recipientName = '수령인 이름은 2자 이상이어야 합니다'
    }

    // 전화번호 검증
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요'
    } else {
      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
      if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
        newErrors.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
      }
    }

    // 우편번호 검증
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = '우편번호를 입력해주세요'
    } else {
      const postalCodeRegex = /^[0-9]{5}$/
      if (!postalCodeRegex.test(formData.postalCode)) {
        newErrors.postalCode = '우편번호는 5자리 숫자여야 합니다'
      }
    }

    // 주소 검증
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요'
    } else if (formData.address.trim().length < 5) {
      newErrors.address = '주소는 5자 이상이어야 합니다'
    }

    // 상세주소 검증
    if (!formData.addressDetail?.trim()) {
      newErrors.addressDetail = '상세주소를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof ShippingInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">배송지 정보</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="취소"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 수령인 */}
        <div>
          <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
            수령인 <span className="text-red-500">*</span>
          </label>
          <input
            id="recipientName"
            type="text"
            value={formData.recipientName}
            onChange={(e) => handleChange('recipientName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.recipientName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="홍길동"
          />
          {errors.recipientName && (
            <p className="mt-1 text-xs text-red-500">{errors.recipientName}</p>
          )}
        </div>

        {/* 전화번호 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="010-1234-5678"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* 우편번호 */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            우편번호 <span className="text-red-500">*</span>
          </label>
          <input
            id="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12345"
            maxLength={5}
          />
          {errors.postalCode && (
            <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
          )}
        </div>

        {/* 주소 */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            주소 <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="서울특별시 강남구 테헤란로 123"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address}</p>
          )}
        </div>

        {/* 상세주소 */}
        <div>
          <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700 mb-1">
            상세주소 <span className="text-red-500">*</span>
          </label>
          <input
            id="addressDetail"
            type="text"
            value={formData.addressDetail}
            onChange={(e) => handleChange('addressDetail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              errors.addressDetail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="101동 1001호"
          />
          {errors.addressDetail && (
            <p className="mt-1 text-xs text-red-500">{errors.addressDetail}</p>
          )}
        </div>

        {/* 배송 요청사항 */}
        <div>
          <label htmlFor="deliveryMessage" className="block text-sm font-medium text-gray-700 mb-1">
            배송 요청사항
          </label>
          <textarea
            id="deliveryMessage"
            value={formData.deliveryMessage}
            onChange={(e) => handleChange('deliveryMessage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="배송 시 요청사항을 입력해주세요 (선택)"
            rows={3}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all"
          >
            다음
          </button>
        </div>
      </form>
    </div>
  )
}

// PaymentForm Component
interface PaymentFormProps {
  onSubmit: (data: PaymentMethod) => void
  onCancel: () => void
  initialData?: PaymentMethod
}

function PaymentForm({ onSubmit, onCancel, initialData }: PaymentFormProps) {
  const [selectedType, setSelectedType] = useState<PaymentMethod['type']>(initialData?.type || 'card')
  const [selectedProvider, setSelectedProvider] = useState<string>(initialData?.provider || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const paymentData: PaymentMethod = {
      type: selectedType,
      provider: selectedProvider || undefined
    }

    onSubmit(paymentData)
  }

  const paymentOptions = [
    {
      type: 'card' as const,
      label: '신용/체크카드',
      icon: CreditCard,
      description: '카드 결제'
    },
    {
      type: 'bank' as const,
      label: '계좌이체',
      icon: Building2,
      description: '실시간 계좌이체'
    },
    {
      type: 'simple' as const,
      label: '간편결제',
      icon: Smartphone,
      description: '카카오페이, 네이버페이 등'
    }
  ]

  const simplePaymentProviders = [
    { value: 'kakaopay', label: '카카오페이' },
    { value: 'naverpay', label: '네이버페이' },
    { value: 'tosspay', label: '토스페이' },
    { value: 'payco', label: '페이코' }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">결제 수단 선택</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="취소"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 결제 수단 선택 */}
        <div className="space-y-2">
          {paymentOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedType === option.type

            return (
              <button
                key={option.type}
                type="button"
                onClick={() => {
                  setSelectedType(option.type)
                  if (option.type !== 'simple') {
                    setSelectedProvider('')
                  }
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isSelected ? 'text-purple-700' : 'text-gray-800'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-3 h-3 rounded-full bg-purple-500" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* 간편결제 제공자 선택 */}
        {selectedType === 'simple' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              간편결제 서비스 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {simplePaymentProviders.map((provider) => (
                <button
                  key={provider.value}
                  type="button"
                  onClick={() => setSelectedProvider(provider.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedProvider === provider.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={selectedType === 'simple' && !selectedProvider}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </form>
    </div>
  )
}
