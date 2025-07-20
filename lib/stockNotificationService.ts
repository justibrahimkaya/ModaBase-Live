import { prisma } from './prisma'
import { EmailService } from './emailService'

export class StockNotificationService {
  
  // Stok güncellendiğinde bildirimleri kontrol et ve gönder
  static async checkAndSendNotifications(productId: string): Promise<void> {
    try {
      // Ürün bilgilerini al
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          slug: true,
          stock: true,
          minStockLevel: true
        }
      })

      if (!product) {
        console.error('Product not found:', productId)
        return
      }

      // Stok yoksa bildirim gönderme
      if (product.stock <= 0) {
        return
      }

      // Bu ürün için aktif stok bildirimlerini al
      const activeNotifications = await prisma.userStockNotification.findMany({
        where: {
          productId: productId,
          isActive: true,
          notifiedAt: null // Henüz bildirim gönderilmemiş
        },
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        }
      })

      if (activeNotifications.length === 0) {
        return
      }

      console.log(`Found ${activeNotifications.length} active notifications for product: ${product.name}`)

      // Email servisini başlat
      EmailService.initialize({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'info@modabase.com.tr',
          pass: process.env.EMAIL_PASS || 'password'
        }
      })

      // Her bir bildirim için email gönder
      for (const notification of activeNotifications) {
        try {
          const recipientEmail = notification.user?.email || notification.guestEmail

          if (!recipientEmail) {
            console.error('No email found for notification:', notification.id)
            continue
          }

          // Email gönder
          const emailSent = await EmailService.sendStockNotificationEmail(
            recipientEmail,
            product.name,
            product.id
          )

          if (emailSent) {
            // Bildirim gönderildi olarak işaretle
            await prisma.userStockNotification.update({
              where: { id: notification.id },
              data: {
                notifiedAt: new Date(),
                isActive: false // Bildirim gönderildikten sonra devre dışı bırak
              }
            })

            console.log(`Stock notification sent to: ${recipientEmail} for product: ${product.name}`)
          } else {
            console.error(`Failed to send email to: ${recipientEmail}`)
          }
        } catch (error) {
          console.error(`Error sending notification to ${notification.id}:`, error)
        }
      }

      console.log(`Stock notifications processing completed for product: ${product.name}`)
    } catch (error) {
      console.error('Error in checkAndSendNotifications:', error)
    }
  }

  // Toplu stok güncellemelerinde kullanılabilir
  static async processMultipleProducts(productIds: string[]): Promise<void> {
    for (const productId of productIds) {
      await this.checkAndSendNotifications(productId)
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Aktif bildirimleri getir (admin paneli için)
  static async getActiveNotifications() {
    return await prisma.userStockNotification.findMany({
      where: {
        isActive: true,
        notifiedAt: null
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            surname: true
          }
        },
        product: {
          select: {
            name: true,
            slug: true,
            stock: true,
            minStockLevel: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Bildirim istatistikleri
  static async getNotificationStats() {
    const [total, active, sent, thisMonth] = await Promise.all([
      prisma.userStockNotification.count(),
      prisma.userStockNotification.count({
        where: {
          isActive: true,
          notifiedAt: null
        }
      }),
      prisma.userStockNotification.count({
        where: {
          notifiedAt: {
            not: null
          }
        }
      }),
      prisma.userStockNotification.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    return {
      total,
      active,
      sent,
      thisMonth
    }
  }
}
 