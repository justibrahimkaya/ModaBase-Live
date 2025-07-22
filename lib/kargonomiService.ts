// Kargonomi API Service
export interface KargonomiCity {
  id: number;
  name: string;
  plate_code: number;
}

export interface KargonomiDistrict {
  id: number;
  name: string;
  city_id: number;
}

export interface KargonomiShipment {
  sender_name: string;
  sender_email: string;
  sender_tax_number: string;
  sender_tax_place: string;
  sender_phone: string;
  sender_address: string;
  sender_city_id: number;
  sender_district_id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_tax_number?: string;
  buyer_tax_place?: string;
  buyer_phone: string;
  buyer_address: string;
  buyer_city_id: number;
  buyer_district_id: number;
  packages: KargonomiPackage[];
}

export interface KargonomiPackage {
  barcode?: string;
  desi: number;
  content?: string;
}

export interface KargonomiPriceComparison {
  shipment_id: number;
  providers: KargonomiProvider[];
}

export interface KargonomiProvider {
  id: number;
  name: string;
  price: number;
  estimated_days: number;
}

export interface KargonomiConfirmShipping {
  shipment_id: number;
  shipping_provider_id: number;
}

class KargonomiAPI {
  private baseURL: string;
  private bearerToken: string;

  constructor() {
    this.baseURL = process.env.KARGONOMI_BASE_URL || 'https://app.kargonomi.com.tr/api/v1';
    this.bearerToken = process.env.KARGONOMI_BEARER_TOKEN || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // FormData kullanılıyorsa Content-Type header'ını kaldır
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Accept': 'application/json',
    };

    // FormData değilse JSON Content-Type ekle
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Custom headers'ları ekle
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Kargonomi API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Kargonomi API request failed:', error);
      throw error;
    }
  }

  // Şehir listesi
  async getCities(): Promise<KargonomiCity[]> {
    return this.request('/cities');
  }

  // İlçe listesi
  async getDistricts(cityId: number): Promise<KargonomiDistrict[]> {
    return this.request(`/districts/${cityId}`);
  }

  // Gönderi oluşturma
  async createShipment(shipment: KargonomiShipment): Promise<any> {
    // FormData formatında gönder (Postman collection'a göre)
    const formData = new FormData();
    
    // Sender bilgileri
    formData.append('shipment[sender_name]', shipment.sender_name);
    formData.append('shipment[sender_email]', shipment.sender_email);
    formData.append('shipment[sender_tax_number]', shipment.sender_tax_number);
    formData.append('shipment[sender_tax_place]', shipment.sender_tax_place);
    formData.append('shipment[sender_phone]', shipment.sender_phone);
    formData.append('shipment[sender_address]', shipment.sender_address);
    formData.append('shipment[sender_city_id]', shipment.sender_city_id.toString());
    formData.append('shipment[sender_district_id]', shipment.sender_district_id.toString());
    
    // Buyer bilgileri
    formData.append('shipment[buyer_name]', shipment.buyer_name);
    formData.append('shipment[buyer_email]', shipment.buyer_email);
    if (shipment.buyer_tax_number) {
      formData.append('shipment[buyer_tax_number]', shipment.buyer_tax_number);
    }
    if (shipment.buyer_tax_place) {
      formData.append('shipment[buyer_tax_place]', shipment.buyer_tax_place);
    }
    formData.append('shipment[buyer_phone]', shipment.buyer_phone);
    formData.append('shipment[buyer_address]', shipment.buyer_address);
    formData.append('shipment[buyer_city_id]', shipment.buyer_city_id.toString());
    formData.append('shipment[buyer_district_id]', shipment.buyer_district_id.toString());
    
    // Package bilgileri
    shipment.packages.forEach((pkg, index) => {
      formData.append(`shipment[packages][${index}][desi]`, pkg.desi.toString());
      if (pkg.barcode) {
        formData.append(`shipment[packages][${index}][barcode]`, pkg.barcode);
      }
      if (pkg.content) {
        formData.append(`shipment[packages][${index}][content]`, pkg.content);
      }
    });

    return this.request('/shipments', {
      method: 'POST',
      body: formData,
    });
  }

  // Gönderi listesi
  async getShipments(queryParams?: string): Promise<any[]> {
    const endpoint = queryParams ? `/shipments?${queryParams}` : '/shipments';
    return this.request(endpoint);
  }

  // Gönderi detayı
  async getShipment(shipmentId: number): Promise<any> {
    return this.request(`/shipments/${shipmentId}`);
  }

  // Gönderi güncelleme
  async updateShipment(shipmentId: number, shipment: any): Promise<any> {
    // URLEncoded formatında gönder (Postman collection'a göre)
    const formData = new URLSearchParams();
    
    // Sender bilgileri
    formData.append('shipment[sender_name]', shipment.sender_name);
    formData.append('shipment[sender_email]', shipment.sender_email);
    formData.append('shipment[sender_tax_number]', shipment.sender_tax_number);
    formData.append('shipment[sender_tax_place]', shipment.sender_tax_place);
    formData.append('shipment[sender_phone]', shipment.sender_phone);
    formData.append('shipment[sender_address]', shipment.sender_address);
    formData.append('shipment[sender_city_id]', shipment.sender_city_id.toString());
    formData.append('shipment[sender_district_id]', shipment.sender_district_id.toString());
    
    // Buyer bilgileri
    formData.append('shipment[buyer_name]', shipment.buyer_name);
    formData.append('shipment[buyer_email]', shipment.buyer_email);
    if (shipment.buyer_tax_number) {
      formData.append('shipment[buyer_tax_number]', shipment.buyer_tax_number);
    }
    if (shipment.buyer_tax_place) {
      formData.append('shipment[buyer_tax_place]', shipment.buyer_tax_place);
    }
    formData.append('shipment[buyer_phone]', shipment.buyer_phone);
    formData.append('shipment[buyer_address]', shipment.buyer_address);
    formData.append('shipment[buyer_city_id]', shipment.buyer_city_id.toString());
    formData.append('shipment[buyer_district_id]', shipment.buyer_district_id.toString());
    
    // Package bilgileri
    shipment.packages.forEach((pkg: any, index: number) => {
      formData.append(`shipment[packages][${index}][desi]`, pkg.desi.toString());
      if (pkg.barcode) {
        formData.append(`shipment[packages][${index}][barcode]`, pkg.barcode);
      }
      if (pkg.content) {
        formData.append(`shipment[packages][${index}][content]`, pkg.content);
      }
    });

    return this.request(`/shipments/${shipmentId}`, {
      method: 'PUT',
      body: formData,
    });
  }

  // Gönderi silme
  async deleteShipment(shipmentId: number): Promise<any> {
    return this.request(`/shipments/${shipmentId}`, {
      method: 'DELETE',
    });
  }

  // Fiyat karşılaştırma
  async getPriceComparison(shipmentId: number): Promise<KargonomiPriceComparison> {
    return this.request(`/shipment-price-comparison/${shipmentId}`);
  }

  // Kargo firması seçimi
  async confirmShippingPrice(data: KargonomiConfirmShipping): Promise<any> {
    // FormData formatında gönder (Postman collection'a göre)
    const formData = new FormData();
    formData.append('shipment_id', data.shipment_id.toString());
    formData.append('shipping_provider_id', data.shipping_provider_id.toString());

    return this.request('/confirm-shipping-price', {
      method: 'POST',
      body: formData,
    });
  }
}

// Singleton instance
export const kargonomiAPI = new KargonomiAPI();

// Helper functions
export const createKargonomiShipment = (
  sender: {
    name: string;
    email: string;
    taxNumber: string;
    taxPlace: string;
    phone: string;
    address: string;
    cityId: number;
    districtId: number;
  },
  buyer: {
    name: string;
    email: string;
    taxNumber?: string;
    taxPlace?: string;
    phone: string;
    address: string;
    cityId: number;
    districtId: number;
  },
  packages: Array<{
    desi: number;
    barcode?: string;
    content?: string;
  }>
): KargonomiShipment => {
  return {
    sender_name: sender.name,
    sender_email: sender.email,
    sender_tax_number: sender.taxNumber,
    sender_tax_place: sender.taxPlace,
    sender_phone: sender.phone,
    sender_address: sender.address,
    sender_city_id: sender.cityId,
    sender_district_id: sender.districtId,
    buyer_name: buyer.name,
    buyer_email: buyer.email,
    ...(buyer.taxNumber && { buyer_tax_number: buyer.taxNumber }),
    ...(buyer.taxPlace && { buyer_tax_place: buyer.taxPlace }),
    buyer_phone: buyer.phone,
    buyer_address: buyer.address,
    buyer_city_id: buyer.cityId,
    buyer_district_id: buyer.districtId,
    packages: packages.map(pkg => ({
      ...(pkg.barcode && { barcode: pkg.barcode }),
      desi: pkg.desi,
      ...(pkg.content && { content: pkg.content }),
    })),
  };
}; 