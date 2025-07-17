import { NextResponse } from 'next/server';

// Gerçek anahtarlar geldiğinde buraya ekleyin

export async function POST() {
  try {
    // Frontend'den gelen sipariş ve müşteri bilgileri
    // Örnek: { amount, email, user_ip, user_name, user_address, ... }

    // Test modunda sahte bir token dönüyoruz
    // Gerçek API anahtarları geldiğinde aşağıdaki kodu aktif edeceğiz
    // Şimdilik sadece frontend akışını test etmek için "dummy" token dönüyoruz
    return NextResponse.json({
      success: true,
      token: 'DUMMY_PAYTR_TOKEN',
      paytr_url: 'https://www.paytr.com/odeme/guvenli/'
    });

    /*
    // Gerçek PayTR entegrasyonu için örnek kod:
    const params = new URLSearchParams();
    params.append('merchant_id', PAYTR_MERCHANT_ID);
    params.append('user_ip', body.user_ip);
    params.append('merchant_oid', body.merchant_oid);
    params.append('email', body.email);
    params.append('payment_amount', body.amount.toString());
    // ... diğer zorunlu parametreler ...
    // imza (hash) hesaplama işlemi burada yapılacak
    
    const paytrRes = await fetch(PAYTR_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const paytrData = await paytrRes.json();
    return NextResponse.json(paytrData);
    */
  } catch (error) {
    return NextResponse.json({ success: false, error: 'PayTR init error', detail: error }, { status: 500 });
  }
}
