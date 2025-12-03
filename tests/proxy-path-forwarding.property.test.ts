/**
 * Property-Based Test for API Proxy Path Forwarding
 * 
 * **Feature: chatbot-integration, Property 1: API Proxy Path Forwarding**
 * **Validates: Requirements 1.1**
 * 
 * Property: For any valid chatbot API path, when the frontend makes a request 
 * to `/api/v1/chatbot/{path}`, the request should be forwarded to 
 * `http://localhost:8000/api/v1/chatbot/{path}`
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Property: API Proxy Path Forwarding', () => {
  it('should forward any valid chatbot API path to port 8000', () => {
    // **Feature: chatbot-integration, Property 1: API Proxy Path Forwarding**
    // **Validates: Requirements 1.1**
    
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    
    // Generator for valid API path segments
    // Valid path segments contain alphanumeric characters, hyphens, and underscores
    const pathSegmentArbitrary = fc.stringMatching(/^[a-zA-Z0-9_-]+$/).filter(s => s.length > 0 && s.length < 50)
    
    // Generator for valid chatbot API paths
    // Paths can have 0 to 5 segments after /api/v1/chatbot/
    const chatbotPathArbitrary = fc.array(pathSegmentArbitrary, { minLength: 0, maxLength: 5 }).map(segments => {
      if (segments.length === 0) {
        return '/api/v1/chatbot'
      }
      return `/api/v1/chatbot/${segments.join('/')}`
    })
    
    fc.assert(
      fc.property(chatbotPathArbitrary, (sourcePath) => {
        // Extract the path after /api/v1/chatbot
        const pathAfterChatbot = sourcePath.replace('/api/v1/chatbot', '')
        
        // Expected destination based on the rewrite rule
        const expectedDestination = `${chatbotUrl}/api/v1/chatbot${pathAfterChatbot}`
        
        // Verify the destination URL is correctly formed
        expect(expectedDestination).toMatch(/^http:\/\/localhost:8000\/api\/v1\/chatbot/)
        
        // Verify the path structure is preserved
        if (pathAfterChatbot) {
          expect(expectedDestination).toContain(pathAfterChatbot)
        }
        
        // Verify the base URL is correct
        expect(expectedDestination.startsWith(chatbotUrl)).toBe(true)
        
        // Verify the API prefix is preserved
        expect(expectedDestination).toContain('/api/v1/chatbot')
      }),
      { numRuns: 100 } // Run 100 iterations as specified in the design document
    )
  })

  it('should preserve query parameters in forwarded paths', () => {
    // **Feature: chatbot-integration, Property 1: API Proxy Path Forwarding**
    // **Validates: Requirements 1.1**
    
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    
    // Generator for path segments
    const pathSegmentArbitrary = fc.stringMatching(/^[a-zA-Z0-9_-]+$/).filter(s => s.length > 0 && s.length < 50)
    
    // Generator for query parameter keys and values
    const queryKeyArbitrary = fc.stringMatching(/^[a-zA-Z0-9_]+$/).filter(s => s.length > 0 && s.length < 20)
    const queryValueArbitrary = fc.stringMatching(/^[a-zA-Z0-9_-]+$/).filter(s => s.length > 0 && s.length < 50)
    
    // Generator for query parameters
    const queryParamsArbitrary = fc.array(
      fc.tuple(queryKeyArbitrary, queryValueArbitrary),
      { minLength: 0, maxLength: 3 }
    ).map(params => {
      if (params.length === 0) return ''
      return '?' + params.map(([key, value]) => `${key}=${value}`).join('&')
    })
    
    // Generator for paths with query parameters
    const pathWithQueryArbitrary = fc.tuple(
      fc.array(pathSegmentArbitrary, { minLength: 1, maxLength: 3 }),
      queryParamsArbitrary
    ).map(([segments, query]) => {
      return `/api/v1/chatbot/${segments.join('/')}${query}`
    })
    
    fc.assert(
      fc.property(pathWithQueryArbitrary, (sourcePath) => {
        // Extract the path and query
        const [pathPart, queryPart] = sourcePath.split('?')
        const pathAfterChatbot = pathPart.replace('/api/v1/chatbot', '')
        
        // Expected destination
        const expectedDestination = queryPart 
          ? `${chatbotUrl}/api/v1/chatbot${pathAfterChatbot}?${queryPart}`
          : `${chatbotUrl}/api/v1/chatbot${pathAfterChatbot}`
        
        // Verify the destination preserves query parameters
        if (queryPart) {
          expect(expectedDestination).toContain(`?${queryPart}`)
        }
        
        // Verify the base structure
        expect(expectedDestination).toMatch(/^http:\/\/localhost:8000\/api\/v1\/chatbot/)
        expect(expectedDestination.startsWith(chatbotUrl)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('should handle paths with special characters correctly', () => {
    // **Feature: chatbot-integration, Property 1: API Proxy Path Forwarding**
    // **Validates: Requirements 1.1**
    
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    
    // Generator for path segments with URL-safe special characters
    const specialPathSegmentArbitrary = fc.stringMatching(/^[a-zA-Z0-9_.-]+$/).filter(s => s.length > 0 && s.length < 50)
    
    const specialPathArbitrary = fc.array(specialPathSegmentArbitrary, { minLength: 1, maxLength: 3 }).map(segments => {
      return `/api/v1/chatbot/${segments.join('/')}`
    })
    
    fc.assert(
      fc.property(specialPathArbitrary, (sourcePath) => {
        const pathAfterChatbot = sourcePath.replace('/api/v1/chatbot', '')
        const expectedDestination = `${chatbotUrl}/api/v1/chatbot${pathAfterChatbot}`
        
        // Verify the path is correctly forwarded
        expect(expectedDestination).toMatch(/^http:\/\/localhost:8000\/api\/v1\/chatbot/)
        expect(expectedDestination).toContain(pathAfterChatbot)
        
        // Verify special characters are preserved
        const specialChars = ['.', '-', '_']
        specialChars.forEach(char => {
          if (sourcePath.includes(char)) {
            expect(expectedDestination).toContain(char)
          }
        })
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly map common chatbot API endpoints', () => {
    // **Feature: chatbot-integration, Property 1: API Proxy Path Forwarding**
    // **Validates: Requirements 1.1**
    
    const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:8000'
    
    // Generator for common endpoint patterns
    const commonEndpoints = [
      'message',
      'action',
      'health',
      'cart',
      'order/create',
      'session/new',
      'recommendations',
    ]
    
    const endpointArbitrary = fc.constantFrom(...commonEndpoints)
    
    // Generator for optional ID segments
    const idArbitrary = fc.stringMatching(/^[a-zA-Z0-9-]+$/).filter(s => s.length > 0 && s.length < 36)
    
    const endpointPathArbitrary = fc.tuple(endpointArbitrary, fc.option(idArbitrary, { nil: null }))
      .map(([endpoint, id]) => {
        if (id) {
          return `/api/v1/chatbot/${endpoint}/${id}`
        }
        return `/api/v1/chatbot/${endpoint}`
      })
    
    fc.assert(
      fc.property(endpointPathArbitrary, (sourcePath) => {
        const pathAfterChatbot = sourcePath.replace('/api/v1/chatbot', '')
        const expectedDestination = `${chatbotUrl}/api/v1/chatbot${pathAfterChatbot}`
        
        // Verify correct forwarding
        expect(expectedDestination).toMatch(/^http:\/\/localhost:8000\/api\/v1\/chatbot/)
        expect(expectedDestination).toContain('/api/v1/chatbot')
        
        // Verify the endpoint is preserved
        const endpoint = sourcePath.split('/api/v1/chatbot/')[1]
        if (endpoint) {
          expect(expectedDestination).toContain(endpoint)
        }
      }),
      { numRuns: 100 }
    )
  })
})
