import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Kargo firmalarını listele
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companies = await prisma.shippingCompany.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Shipping companies error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shipping companies' },
      { status: 500 }
    )
  }
}

// Yeni kargo firması ekle
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, code, apiUrl, apiKey } = await request.json()

    const company = await prisma.shippingCompany.create({
      data: {
        name,
        code,
        apiUrl,
        apiKey
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Create shipping company error:', error)
    return NextResponse.json(
      { error: 'Failed to create shipping company' },
      { status: 500 }
    )
  }
}
