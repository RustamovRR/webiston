import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const CBU_BASE_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json'

/**
 * GET /api/currency/history?code=USD&startDate=2024-01-01&endDate=2024-12-31
 * Fetch historical currency rates from CBU
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!code || !startDate) {
      return NextResponse.json({ error: 'Missing required parameters: code, startDate' }, { status: 400 })
    }

    // Build URL
    const url = endDate ? `${CBU_BASE_URL}/${code}/${startDate}/${endDate}/` : `${CBU_BASE_URL}/${code}/${startDate}/`

    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Cache for 24 hours (historical data doesn't change)
    })

    if (!response.ok) {
      throw new Error(`CBU API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (error) {
    console.error('Error fetching historical rates from CBU:', error)
    return NextResponse.json({ error: 'Failed to fetch historical rates' }, { status: 500 })
  }
}
