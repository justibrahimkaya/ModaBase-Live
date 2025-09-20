// Built-in fetch kullan (Node.js 18+)

async function testBankTransfer() {
  console.log('🧪 Havale bildirimi API testi başlıyor...');
  
  // Önce gerçek bir sipariş oluştur
  console.log('📦 Test siparişi oluşturuluyor...');
  
  const orderData = {
    items: [
      {
        productId: 'cmdg4gbip0001jw04nvvh1sri', // Gerçek ürün ID'si
        quantity: 1,
        price: 150.50,
        size: 'M',
        color: 'Kırmızı'
      }
    ],
    total: 150.50,
    discount: 0,
    shippingCost: 0,
    shippingMethod: 'cargo',
    paymentMethod: 'BANK_TRANSFER',
    guestName: 'Test Müşteri',
    guestSurname: 'Test',
    guestEmail: 'test@example.com',
    guestPhone: '05551234567',
    address: {
      title: 'Test Adres',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighborhood: 'Test Mahalle',
      address: 'Test Sokak No:1'
    }
  };

  try {
    const orderResponse = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    console.log('📡 Sipariş response status:', orderResponse.status);
    
    const orderText = await orderResponse.text();
    console.log('📡 Sipariş response body (text):', orderText);
    
    let orderResult;
    try {
      orderResult = JSON.parse(orderText);
      console.log('📦 Sipariş sonucu:', orderResult);
    } catch (parseError) {
      console.error('❌ Sipariş JSON parse hatası:', parseError);
      return;
    }

    if (!orderResult.success) {
      console.error('❌ Sipariş oluşturulamadı:', orderResult.error);
      return;
    }

        const orderId = orderResult.order.id;
    console.log('✅ Sipariş oluşturuldu:', orderId);
  
    const testData = {
      orderId: orderId,
      customerName: 'Test Müşteri Test',
      customerEmail: 'test@example.com',
      customerPhone: '05551234567',
      transferAmount: 150.50,
      transferDate: new Date().toISOString().split('T')[0],
      transferNote: 'Test havale bildirimi'
    };

    console.log('📤 Gönderilen veri:', testData);

    const response = await fetch('http://localhost:3000/api/payment/bank-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    const text = await response.text();
    console.log('📡 Response body (text):', text);

    try {
      const json = JSON.parse(text);
      console.log('📡 Response body (JSON):', json);
    } catch (parseError) {
      console.error('❌ JSON parse hatası:', parseError);
    }

  } catch (error) {
    console.error('❌ Fetch hatası:', error);
  }
}

testBankTransfer(); 