import { NextRequest, NextResponse } from 'next/server'

// API Route를 dynamic으로 설정 (static export 방지)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BACKEND_URL = process.env.BACKEND_URL || 'http://172.16.24.53:31250'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const url = `${BACKEND_URL}/${path}`
    
    console.log(`[Proxy] ${method} ${url}`)

    // 요청 본문 가져오기
    let body = undefined
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text()
        console.log('[Proxy] Request body:', body)
      } catch (e) {
        console.log('[Proxy] No request body')
      }
    }

    // 헤더 복사 (Authorization 등)
    const headers: Record<string, string> = {
      'Host': 'api.c4ang.com',
      'Content-Type': 'application/json',
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    console.log('[Proxy] Request headers:', headers)

    // 백엔드로 요청
    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    })

    console.log('[Proxy] Response status:', response.status)

    // 응답 본문 가져오기
    const responseText = await response.text()
    console.log('[Proxy] Response body:', responseText)

    let responseData
    try {
      responseData = responseText ? JSON.parse(responseText) : {}
    } catch {
      responseData = { data: responseText }
    }

    // 응답 반환
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Proxy request failed', message: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
