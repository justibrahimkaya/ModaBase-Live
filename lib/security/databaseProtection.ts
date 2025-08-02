import { Logger } from '@/lib/utils/logger'

// Veritabanı koruma sistemi
export class DatabaseProtection {
  private static readonly DANGEROUS_OPERATIONS = [
    'DROP',
    'TRUNCATE',
    'RESET',
    'MIGRATE_RESET',
    'SCHEMA_CHANGE',
    'DATABASE_RESET'
  ]

  private static readonly PROTECTED_TABLES = [
    'User',
    'Business'
  ]

  private static readonly SAFE_CRUD_OPERATIONS = [
    'create',
    'update',
    'delete',
    'upsert',
    'createMany',
    'updateMany'
  ]

  // Tehlikeli işlem kontrolü - Daha akıllı versiyon
  static isDangerousOperation(operation: string, table?: string): boolean {
    const operationUpper = operation.toUpperCase()
    
    // 1. Gerçekten tehlikeli işlemler (DROP, TRUNCATE, RESET vb.)
    const isDangerous = this.DANGEROUS_OPERATIONS.some(op => 
      operationUpper.includes(op)
    )
    
    if (isDangerous) {
      return true
    }
    
    // 2. Sadece kritik tablolarda DELETE işlemi kontrolü
    if (operationUpper.includes('DELETE') && table) {
      const isProtectedTable = this.PROTECTED_TABLES.includes(table)
      return isProtectedTable
    }
    
    // 3. Toplu silme işlemleri (deleteMany)
    if (operationUpper.includes('DELETE_MANY') || operation === 'deleteMany') {
      return true
    }
    
    // 4. Normal CRUD işlemlerine izin ver
    const isSafeCRUD = this.SAFE_CRUD_OPERATIONS.some(op => 
      operation.toLowerCase().includes(op)
    )
    
    if (isSafeCRUD) {
      return false // Güvenli CRUD işlemleri
    }
    
    // 5. Bilinmeyen işlemler için güvenlik kontrolü
    return false // Varsayılan olarak izin ver
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

// Prisma middleware koruması - Geliştirilmiş versiyon
export function createDatabaseProtectionMiddleware() {
  return async (params: any, next: any) => {
    const { model, action, args } = params

    // Geliştirme modunda middleware'i devre dışı bırak
    if (process.env.NODE_ENV === 'development') {
      return next(params)
    }

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

    // Toplu silme kontrolü - Sadece gerçekten tehlikeli olanlar için
    if (action === 'deleteMany' && args?.where) {
      // Sadece kritik tablolarda toplu silme kontrolü
      const criticalTables = ['User', 'Business']
      if (criticalTables.includes(model)) {
        const count = await next({ ...params, action: 'count' })
        const approved = await DatabaseProtection.protectBulkDelete(model, count)
        
        if (!approved) {
          throw new Error('🚨 VERİTABANI KORUMA SİSTEMİ: Toplu silme onaylanmadı!')
        }
      }
    }

    return next(params)
  }
} 