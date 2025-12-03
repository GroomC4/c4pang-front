/**
 * 브랜드명 기반 이미지 매핑 유틸리티
 */

export function getProductImage(brand: string, productName?: string): string {
  const brandLower = brand.toLowerCase()
  const nameLower = productName?.toLowerCase() || ''

  // 브랜드별 이미지 매핑
  if (
    brand.includes('조르지오 아르마니') ||
    brandLower.includes('armani') ||
    brandLower.includes('giorgio armani')
  ) {
    return '/images/armani.jpg'
  }

  if (brand.includes('이솝') || brandLower.includes('aesop')) {
    return '/images/aesop.jpg'
  }

  if (
    brand.includes('산타 마리아 노벨라') ||
    nameLower.includes('tabacco') ||
    nameLower.includes('tobacco')
  ) {
    return '/images/tabaco.jpg'
  }

  // 기본 이미지
  return '/images/2021123101001036600063001.jpg'
}
