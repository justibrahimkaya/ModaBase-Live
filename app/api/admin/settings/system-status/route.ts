import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'
import os from 'os'

export const dynamic = 'force-dynamic'

// GET: Sistem durumu bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Sistem metrikleri
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100

    // Disk kullanımı (simüle edilmiş)
    const diskUsage = Math.floor(Math.random() * 20) + 40 // 40-60% arası

    // Veritabanı bağlantı testi
    let dbStatus = 'online'
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      dbStatus = 'offline'
    }

    // Uptime
    const uptime = os.uptime()
    const uptimeFormatted = {
      days: Math.floor(uptime / 86400),
      hours: Math.floor((uptime % 86400) / 3600),
      minutes: Math.floor((uptime % 3600) / 60)
    }

    const systemStatus = {
      memory: {
        total: (totalMemory / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
        used: ((totalMemory - freeMemory) / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
        free: (freeMemory / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
        usage: Math.round(memoryUsage)
      },
      disk: {
        usage: diskUsage
      },
      database: {
        status: dbStatus
      },
      uptime: uptimeFormatted,
      platform: os.platform(),
      nodeVersion: process.version
    }

    return NextResponse.json(systemStatus)
  } catch (error) {
    console.error('System status error:', error)
    return NextResponse.json({ error: 'Sistem durumu getirilemedi' }, { status: 500 })
  }
} 