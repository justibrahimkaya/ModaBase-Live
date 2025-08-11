import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '../utils';

// GET: Kullanıcının daha sonra al listesini getir
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(wishlist);
}

// POST: Daha sonra al listesine ürün ekle
export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: 'Ürün ID gerekli.' }, { status: 400 });
  }
  // Zaten wishlist'te mi kontrol et
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } }
  });
  if (existing) {
    return NextResponse.json({ error: 'Bu ürün zaten daha sonra al listesinde.' }, { status: 409 });
  }
  const wishlistItem = await prisma.wishlist.create({
    data: { userId, productId },
    include: { product: true }
  });
  return NextResponse.json(wishlistItem);
}

// DELETE: Daha sonra al listesinden ürün çıkar
export async function DELETE(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }
  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: 'Ürün ID gerekli.' }, { status: 400 });
  }
  await prisma.wishlist.deleteMany({
    where: { userId, productId }
  });
  return NextResponse.json({ success: true });
}
