import { NextResponse } from 'next/server'

const CBU_BASE_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json'

/**
 * GET /api/currency/rates
 * Fetch current currency rates from CBU
 */
export async function GET() {
  try {
    const response = await fetch(CBU_BASE_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`CBU API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching rates from CBU:', error)
    return NextResponse.json({ error: 'Failed to fetch currency rates' }, { status: 500 })
  }
}
