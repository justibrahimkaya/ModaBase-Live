import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // File'ı base64'e çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
    
    return NextResponse.json({ 
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      base64Length: base64.length,
      base64Preview: base64.substring(0, 100)
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test upload endpoint is working',
    usage: 'POST a file with FormData to test upload'
  })
}
