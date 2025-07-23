import { prisma } from './prisma';
import { EmailService } from './emailService';

export class StockNotificationService {
  
  // Stok kontrolü ve bildirim gönderme
  static async checkAndSendNotifications(productId: string): Promise<void> {
    try {
      // Ürün bilgilerini al
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true
        }
      });

      if (!product) {
        console.log(`Ürün bulunamadı: ${productId}`);
        return;
      }

      // Stok bildirimlerini al
      const notifications = await prisma.userStockNotification.findMany({
        where: {
          productId: productId,
          isActive: true,
          notifiedAt: null // Henüz bildirim gönderilmemiş
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              surname: true
            }
          }
        }
      });

      if (notifications.length === 0) {
        console.log(`Ürün ${product.name} için aktif bildirim yok`);
        return;
      }

      console.log(`${notifications.length} kullanıcıya stok bildirimi gönderiliyor...`);

      // Her kullanıcıya bildirim gönder
      for (const notification of notifications) {
        try {
          const email = notification.user?.email || notification.guestEmail;

          if (email) {
            const success = await EmailService.sendStockNotificationEmail(
              email,
              product.name,
              product.id
            );

            if (success) {
              // Bildirim gönderildi olarak işaretle
              await prisma.userStockNotification.update({
                where: { id: notification.id },
                data: {
                  notifiedAt: new Date(),
                  isActive: false // Bildirim gönderildi, artık aktif değil
                }
              });

              console.log(`Stok bildirimi gönderildi: ${email} - ${product.name}`);
            } else {
              console.error(`Stok bildirimi gönderilemedi: ${email} - ${product.name}`);
            }
          }
        } catch (error) {
          console.error(`Bildirim gönderme hatası:`, error);
        }
      }

    } catch (error) {
      console.error('Stok bildirimi kontrol hatası:', error);
    }
  }

  // Düşük stok uyarıları için admin bildirimi
  static async sendLowStockAlertToAdmin(): Promise<void> {
    try {
      // Düşük stok ürünlerini bul
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lte: prisma.product.fields.minStockLevel,
            gt: 0 // Stoksuz olmayan
          }
        },
        include: {
          category: true
        },
        orderBy: {
          stock: 'asc'
        }
      });

      // Stoksuz ürünleri bul
      const outOfStockProducts = await prisma.product.findMany({
        where: {
          stock: 0
        },
        include: {
          category: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
        console.log('Düşük stok uyarısı yok');
        return;
      }

      // Admin e-postasına bildirim gönder
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@modabase.com.tr';
      
      if (adminEmail) {
        const success = await EmailService.sendLowStockAlertToAdmin({
          to: adminEmail,
          lowStockProducts: lowStockProducts.map(p => ({
            name: p.name,
            stock: p.stock,
            minStockLevel: p.minStockLevel,
            category: p.category.name,
            price: p.price
          })),
          outOfStockProducts: outOfStockProducts.map(p => ({
            name: p.name,
            category: p.category.name,
            price: p.price
          }))
        });

        if (success) {
          console.log('Admin düşük stok uyarısı gönderildi');
        } else {
          console.error('Admin düşük stok uyarısı gönderilemedi');
        }
      }

    } catch (error) {
      console.error('Düşük stok uyarısı hatası:', error);
    }
  }

  // Stok hareketi sonrası kontrol
  static async checkStockAfterMovement(productId: string): Promise<void> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) return;

      // Stok seviyesi kontrol et
      if (product.stock <= product.minStockLevel) {
        // Düşük stok uyarısı gönder
        await this.sendLowStockAlertToAdmin();
      }

      // Eğer stok 0'dan büyükse ve önceden 0'daysa, stok bildirimlerini kontrol et
      if (product.stock > 0) {
        await this.checkAndSendNotifications(productId);
      }

    } catch (error) {
      console.error('Stok hareketi sonrası kontrol hatası:', error);
    }
  }

  // Günlük stok raporu
  static async generateDailyStockReport(): Promise<void> {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      // Dünkü stok hareketlerini al
      const movements = await prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        include: {
          product: {
            include: {
              category: true
            }
          },
          order: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Düşük stok ürünleri
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lte: prisma.product.fields.minStockLevel
          }
        },
        include: {
          category: true
        }
      });

      // Admin e-postasına günlük rapor gönder
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@modabase.com.tr';
      
      if (adminEmail && (movements.length > 0 || lowStockProducts.length > 0)) {
        const success = await EmailService.sendDailyStockReport({
          to: adminEmail,
          date: yesterday.toLocaleDateString('tr-TR'),
          movements: movements.map(m => ({
            type: m.type,
            quantity: m.quantity,
            productName: m.product.name,
            category: m.product.category.name,
            orderId: m.orderId || '',
            description: m.description || '',
            createdAt: m.createdAt
          })),
          lowStockProducts: lowStockProducts.map(p => ({
            name: p.name,
            stock: p.stock,
            minStockLevel: p.minStockLevel,
            category: p.category.name
          }))
        });

        if (success) {
          console.log('Günlük stok raporu gönderildi');
        } else {
          console.error('Günlük stok raporu gönderilemedi');
        }
      }

    } catch (error) {
      console.error('Günlük stok raporu hatası:', error);
    }
  }

  // Stok bildirimi istatistikleri
  static async getNotificationStats(): Promise<{
    totalNotifications: number;
    activeNotifications: number;
    sentNotifications: number;
    pendingNotifications: number;
  }> {
    try {
      const [
        totalNotifications,
        activeNotifications,
        sentNotifications
      ] = await Promise.all([
        prisma.userStockNotification.count(),
        prisma.userStockNotification.count({
          where: { isActive: true }
        }),
        prisma.userStockNotification.count({
          where: { 
            isActive: false,
            notifiedAt: { not: null }
          }
        })
      ]);

      return {
        totalNotifications,
        activeNotifications,
        sentNotifications,
        pendingNotifications: activeNotifications
      };

    } catch (error) {
      console.error('Bildirim istatistikleri hatası:', error);
      return {
        totalNotifications: 0,
        activeNotifications: 0,
        sentNotifications: 0,
        pendingNotifications: 0
      };
    }
  }
}
 