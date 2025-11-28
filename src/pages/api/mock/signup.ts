import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { username, email, password, defaultAddress, defaultPhoneNumber } = req.body

  if (!username || !email || !password || !defaultAddress || !defaultPhoneNumber) {
    return res.status(400).json({ message: '필수 필드가 누락되었습니다.' })
  }

  if (email === 'test@example.com') {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' })
  }

  const mockResponse = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    username,
    email,
    role: 'CUSTOMER',
    isActive: true,
    createdAt: new Date().toISOString()
  }

  res.status(201).json(mockResponse)
}