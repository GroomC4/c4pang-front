import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' })
  }

  if (email === 'test@example.com' && password === 'password123') {
    const mockResponse = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE2MzM2MTA0MDAsImV4cCI6MTYzMzYxNDAwMH0.1234567890',
      refreshToken: 'refresh_token_123',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }
    return res.status(200).json(mockResponse)
  }

  res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
}