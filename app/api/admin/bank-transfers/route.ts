import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Admin yetkisi kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Yetkisiz erişim' 
      }, { status: 401 });
    }

    // Havale bildirimlerini getir
    const transfers = await prisma.transferNotification.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            guestName: true,
            guestEmail: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      transfers: transfers.map((transfer: any) => ({
        id: transfer.id,
        orderId: transfer.orderId,
        customerName: transfer.customerName,
        customerEmail: transfer.customerEmail,
        customerPhone: transfer.customerPhone,
        transferAmount: transfer.transferAmount,
        transferDate: transfer.transferDate,
        transferNote: transfer.transferNote,
        status: transfer.status,
        adminNote: transfer.adminNote,
        confirmedAt: transfer.confirmedAt,
        iban: transfer.iban,
        accountHolder: transfer.accountHolder,
        bankName: transfer.bankName,
        createdAt: transfer.createdAt
      }))
    });

  } catch (error) {
    console.error('Havale bildirimleri getirme hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Havale bildirimleri getirilemedi' 
    }, { status: 500 });
  }
}
