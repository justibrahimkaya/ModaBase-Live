import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../utils';

// GET: Kullanıcının favori ürünlerini getir
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      product: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(favorites);
}

// POST: Favorilere ürün ekle
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: 'Ürün ID gerekli.' }, { status: 400 });
  }
  // Zaten favoride mi kontrol et
  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } }
  });
  if (existing) {
    return NextResponse.json({ error: 'Bu ürün zaten favorilerde.' }, { status: 409 });
  }
  const favorite = await prisma.favorite.create({
    data: { userId, productId },
    include: { product: true }
  });
  return NextResponse.json(favorite);
}

// DELETE: Favorilerden ürün çıkar
export async function DELETE(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: 'Ürün ID gerekli.' }, { status: 400 });
  }
  await prisma.favorite.deleteMany({
    where: { userId, productId }
  });
  return NextResponse.json({ success: true });
}
