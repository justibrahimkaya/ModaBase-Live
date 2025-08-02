import { NextResponse } from 'next/server'

// WhatsApp numaraları - production'da environment variables'dan alınacak
const WHATSAPP_NUMBERS = {
  support: process.env.WHATSAPP_SUPPORT_NUMBER || '905362971255',
  business: process.env.WHATSAPP_BUSINESS_NUMBER || '905362971255',
  admin: process.env.WHATSAPP_ADMIN_NUMBER || '905362971255'
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        support: WHATSAPP_NUMBERS.support,
        business: WHATSAPP_NUMBERS.business,
        admin: WHATSAPP_NUMBERS.admin
      }
    })
  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 