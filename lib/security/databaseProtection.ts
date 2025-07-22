import { Logger } from '@/lib/utils/logger'

// Veritabanı koruma sistemi
export class DatabaseProtection {
  private static readonly DANGEROUS_OPERATIONS = [
    'DELETE',
    'DROP',
    'TRUNCATE',
    'RESET',
    'MIGRATE_RESET',
    'PASSWORD_UPDATE',
    'BULK_DELETE',
    'SCHEMA_CHANGE'
  ]

  private static readonly PROTECTED_TABLES = [
    'User',
    'Business', 
    'Product',
    'Order',
    'Category',
    'Review',
    'Cart',
    'Favorite',
    'Wishlist'
  ]

  // Tehlikeli işlem kontrolü
  static isDangerousOperation(operation: string, table?: string): boolean {
    // Sadece yazma işlemlerini kontrol et
    const writeOperations = ['CREATE', 'UPDATE', 'DELETE', 'UPSERT', 'UPDATE_MANY', 'DELETE_MANY']
    const isWriteOperation = writeOperations.some(op => 
      operation.toUpperCase().includes(op)
    )
    
    // Eğer okuma işlemi ise (findMany, findFirst, findUnique, count vb.) engelleme
    if (!isWriteOperation) {
      return false
    }
    
    const isDangerous = this.DANGEROUS_OPERATIONS.some(op => 
      operation.toUpperCase().includes(op)
    )
    
    const isProtectedTable = table ? this.PROTECTED_TABLES.includes(table) : false
    
    return isDangerous || isProtectedTable
  }

  // Kullanıcı onayı gerektiren işlemler
  static async requireUserApproval(operation: string, details: string): Promise<boolean> {
    console.log('\n🚨 VERİTABANI KORUMA SİSTEMİ 🚨')
    console.log('=' .repeat(50))
    console.log(`⚠️  TEHLİKELİ İŞLEM TESPİT EDİLDİ!`)
    console.log(`📋 İşlem: ${operation}`)
    console.log(`📝 Detay: ${details}`)
    console.log('=' .repeat(50))
    console.log('🔒 Bu işlem için kullanıcı onayı gerekiyor!')
    console.log('📧 Lütfen WhatsApp veya Email ile onay gönderin.')
    console.log('⏳ İşlem onaylanana kadar bekleniyor...')
    console.log('=' .repeat(50))

    // Log kaydı
    Logger.security('Dangerous database operation blocked', {
      operation,
      details,
      timestamp: new Date().toISOString(),
      requiresApproval: true
    })

    // Production'da her zaman engelle
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ PRODUCTION\'DA TEHLİKELİ İŞLEM YAPILAMAZ!')
      return false
    }

    // Development'ta da engelle (güvenlik için)
    console.log('❌ GÜVENLİK NEDENİYLE İŞLEM ENGELLENDİ!')
    console.log('✅ Veritabanınız korunuyor.')
    return false
  }

  // Toplu silme koruması
  static async protectBulkDelete(table: string, count: number): Promise<boolean> {
    return this.requireUserApproval(
      'BULK_DELETE',
      `${table} tablosundan ${count} kayıt silinecek`
    )
  }

  // Şifre değiştirme koruması
  static async protectPasswordChange(userType: string, email: string): Promise<boolean> {
    return this.requireUserApproval(
      'PASSWORD_UPDATE',
      `${userType} hesabı şifresi değiştirilecek: ${email}`
    )
  }

  // Veritabanı reset koruması
  static async protectDatabaseReset(): Promise<boolean> {
    return this.requireUserApproval(
      'DATABASE_RESET',
      'Tüm veritabanı sıfırlanacak - TÜM VERİLER SİLİNECEK!'
    )
  }

  // Schema değişiklik koruması
  static async protectSchemaChange(change: string): Promise<boolean> {
    return this.requireUserApproval(
      'SCHEMA_CHANGE',
      `Veritabanı şeması değiştirilecek: ${change}`
    )
  }
}

// Prisma middleware koruması
export function createDatabaseProtectionMiddleware() {
  return async (params: any, next: any) => {
    const { model, action, args } = params

    // Tehlikeli işlem kontrolü
    if (DatabaseProtection.isDangerousOperation(action, model)) {
      const approved = await DatabaseProtection.requireUserApproval(
        action,
        `${model} tablosunda ${action} işlemi`
      )
      
      if (!approved) {
        throw new Error('🚨 VERİTABANI KORUMA SİSTEMİ: İşlem onaylanmadı!')
      }
    }

    // Toplu silme kontrolü
    if (action === 'deleteMany' && args?.where) {
      const count = await next({ ...params, action: 'count' })
      const approved = await DatabaseProtection.protectBulkDelete(model, count)
      
      if (!approved) {
        throw new Error('🚨 VERİTABANI KORUMA SİSTEMİ: Toplu silme onaylanmadı!')
      }
    }

    return next(params)
  }
} 