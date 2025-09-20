// =======================================================
// UBL-TR XML BUILDER - E.ARŞİV İÇİN
// =======================================================

import { create } from 'xmlbuilder2';
import { EARSIV_CONFIG, UBL_CONSTANTS, TEST_COMPANY_INFO } from './constants';

export interface EarsivInvoiceData {
  order: any;
  companyInfo: any;
  invoiceNumber: string;
  invoiceDate: Date;
  isTest?: boolean;
}

export class UblTrXmlBuilder {
  
  static generateInvoiceXML(data: EarsivInvoiceData): string {
    console.log('📄 UBL-TR XML fatura oluşturuluyor...');
    
    const { order, companyInfo, invoiceNumber, invoiceDate } = data;
    
    // KDV hesaplamalarını yap
    const taxCalculations = this.calculateTaxes(order.items);
    
    // XML root element
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Invoice', {
        xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 UBL-Invoice-2.1.xsd'
      });

    // 1. TEMEL BİLGİLER
    root.ele('cbc:UBLVersionID').txt('2.1');
    root.ele('cbc:CustomizationID').txt('TR1.2');
    root.ele('cbc:ProfileID').txt(UBL_CONSTANTS.PROFILE_ID);
    root.ele('cbc:ID').txt(invoiceNumber);
    root.ele('cbc:CopyIndicator').txt('false');
    root.ele('cbc:UUID').txt(this.generateUUID());
    root.ele('cbc:IssueDate').txt(this.formatDate(invoiceDate));
    root.ele('cbc:InvoiceTypeCode').txt(EARSIV_CONFIG.INVOICE_TYPES.SALES);
    root.ele('cbc:DocumentCurrencyCode').txt(UBL_CONSTANTS.CURRENCY_CODE);

    // 2. SATICI BİLGİLERİ (Firma)
    const supplierParty = root.ele('cac:AccountingSupplierParty').ele('cac:Party');
    
    // Firma kimlik bilgileri
    const partyIdentification = supplierParty.ele('cac:PartyIdentification');
    partyIdentification.ele('cbc:ID', { schemeID: 'VKN' }).txt(data.isTest ? TEST_COMPANY_INFO.vkn : companyInfo.taxNumber);
    
    // Firma adı
    const partyName = supplierParty.ele('cac:PartyName');
    partyName.ele('cbc:Name').txt(data.isTest ? TEST_COMPANY_INFO.title : companyInfo.name);
    
    // Firma adresi
    const postalAddress = supplierParty.ele('cac:PostalAddress');
    postalAddress.ele('cbc:StreetName').txt(data.isTest ? TEST_COMPANY_INFO.address : companyInfo.address);
    postalAddress.ele('cbc:CityName').txt('Istanbul');
    postalAddress.ele('cac:Country').ele('cbc:IdentificationCode').txt(UBL_CONSTANTS.COUNTRY_CODE);
    
    // Vergi bilgileri
    const partyTaxScheme = supplierParty.ele('cac:PartyTaxScheme');
    partyTaxScheme.ele('cac:TaxScheme').ele('cbc:Name').txt(data.isTest ? TEST_COMPANY_INFO.taxOffice : companyInfo.taxOffice);
    
    // İletişim bilgileri
    const contact = supplierParty.ele('cac:Contact');
    contact.ele('cbc:Telephone').txt(data.isTest ? TEST_COMPANY_INFO.phone : companyInfo.phone);
    contact.ele('cbc:ElectronicMail').txt(data.isTest ? TEST_COMPANY_INFO.email : companyInfo.email);

    // 3. ALICI BİLGİLERİ (Müşteri)
    const customerParty = root.ele('cac:AccountingCustomerParty').ele('cac:Party');
    
    const customerName = order.user?.name || order.guestName || 'Bireysel Musteri';
    const customerEmail = order.user?.email || order.guestEmail || '';
    
    // Müşteri adı
    customerParty.ele('cac:PartyName').ele('cbc:Name').txt(customerName);
    
    // Müşteri adresi
    if (order.address) {
      const customerAddress = customerParty.ele('cac:PostalAddress');
      customerAddress.ele('cbc:StreetName').txt(order.address.address || 'Adres Bilgisi Yok');
      customerAddress.ele('cbc:CityName').txt(order.address.city || 'Sehir Bilgisi Yok');
      customerAddress.ele('cac:Country').ele('cbc:IdentificationCode').txt(UBL_CONSTANTS.COUNTRY_CODE);
    }
    
    // Müşteri iletişim
    if (customerEmail) {
      customerParty.ele('cac:Contact').ele('cbc:ElectronicMail').txt(customerEmail);
    }

    // 4. ÖDEME KOŞULLARI
    const paymentTerms = root.ele('cac:PaymentTerms');
    paymentTerms.ele('cbc:Note').txt(order.paymentMethod || 'Havale/EFT');

    // 5. KDV TOPLAMI
    root.ele('cac:TaxTotal').ele('cbc:TaxAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
       .txt(taxCalculations.totalTaxAmount.toFixed(2));

    // 6. GENEL TOPLAM
    const legalMonetaryTotal = root.ele('cac:LegalMonetaryTotal');
    legalMonetaryTotal.ele('cbc:LineExtensionAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
                     .txt(taxCalculations.lineExtensionAmount.toFixed(2));
    legalMonetaryTotal.ele('cbc:TaxExclusiveAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
                     .txt(taxCalculations.taxExclusiveAmount.toFixed(2));
    legalMonetaryTotal.ele('cbc:TaxInclusiveAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
                     .txt(order.total.toFixed(2));
    legalMonetaryTotal.ele('cbc:PayableAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
                     .txt(order.total.toFixed(2));

    // 7. ÜRÜN SATIRLARI
    order.items.forEach((item: any, index: number) => {
      this.addInvoiceLine(root, item, index + 1);
    });

    const xml = root.end({ prettyPrint: true });
    console.log('✅ UBL-TR XML oluşturuldu');
    
    return xml;
  }

  private static addInvoiceLine(root: any, item: any, lineNumber: number) {
    const invoiceLine = root.ele('cac:InvoiceLine');
    
    invoiceLine.ele('cbc:ID').txt(lineNumber.toString());
    
    // Miktar ve birim
    const invoicedQuantity = invoiceLine.ele('cbc:InvoicedQuantity', { 
      unitCode: EARSIV_CONFIG.UNITS.PIECE 
    });
    invoicedQuantity.txt((item.quantity || 1).toString());
    
    // Satır toplamı (KDV hariç)
    const lineExtensionAmount = (item.price || 0) * (item.quantity || 1);
    invoiceLine.ele('cbc:LineExtensionAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
              .txt(lineExtensionAmount.toFixed(2));
    
    // Ürün bilgileri
    const itemElement = invoiceLine.ele('cac:Item');
    itemElement.ele('cbc:Name').txt(item.product?.name || 'Urun');
    
    // Fiyat bilgisi
    const price = invoiceLine.ele('cac:Price');
    price.ele('cbc:PriceAmount', { currencyID: UBL_CONSTANTS.CURRENCY_CODE })
         .txt((item.price || 0).toFixed(2));
  }

  private static calculateTaxes(items: any[]) {
    let lineExtensionAmount = 0;
    let totalTaxAmount = 0;
    
    items.forEach(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      lineExtensionAmount += itemTotal;
      
      // Dinamik KDV oranı (ürün > kategori > varsayılan)
      const taxRate = item.taxRate || item.product?.taxRate || item.product?.category?.defaultTaxRate || EARSIV_CONFIG.TAX_RATES.STANDARD;
      const taxAmount = itemTotal * (taxRate / 100);
      totalTaxAmount += taxAmount;
    });
    
    return {
      lineExtensionAmount,
      totalTaxAmount,
      taxExclusiveAmount: lineExtensionAmount,
      taxInclusiveAmount: lineExtensionAmount + totalTaxAmount
    };
  }

  private static generateUUID(): string {
    // Basit UUID generator
    const chars = '0123456789abcdef';
    let uuid = '';
    for (let i = 0; i < 32; i++) {
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += chars[Math.floor(Math.random() * 16)];
    }
    return uuid;
  }

  private static formatDate(date: Date): string {
    const isoString = date.toISOString();
    const datePart = isoString.split('T')[0];
    return datePart || isoString.substring(0, 10); // YYYY-MM-DD format
  }
} 