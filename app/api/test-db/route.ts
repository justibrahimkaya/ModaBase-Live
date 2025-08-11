import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// BigInt serileştirme için custom replacer
function jsonReplacer(_: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString()
  }
  return value
}

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      result: JSON.parse(JSON.stringify(result, jsonReplacer))
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
