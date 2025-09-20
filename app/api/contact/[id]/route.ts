import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Mesaj durumunu güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!['PENDING', 'READ', 'REPLIED', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum' },
        { status: 400 }
      )
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: updatedMessage
    })

  } catch (error) {
    console.error('Contact message update error:', error)
    return NextResponse.json(
      { error: 'Mesaj güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// GET - Tek mesaj detayı
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const message = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Contact message fetch error:', error)
    return NextResponse.json(
      { error: 'Mesaj yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}