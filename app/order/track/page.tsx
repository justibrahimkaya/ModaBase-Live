"use client";
import { useState } from "react";

interface Order {
  id: string;
  status: string;
  total: number;
  discount?: number;
  shippingCost?: number;
  shippingMethod?: string;
  paymentMethod?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  shippingCompany?: string;
  shippingTrackingUrl?: string;
  guestName?: string;
  guestSurname?: string;
  guestEmail?: string;
  guestPhone?: string;
  items: Array<{
    id: string;
    product: { name: string; image?: string };
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  address?: {
    title?: string;
    name?: string;
    surname?: string;
    city?: string;
    district?: string;
    address?: string;
  };
}

export default function GuestOrderTrackPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/guest-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), guestEmail: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Sipariş bulunamadı.");
        setOrder(null);
      } else {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Sipariş Takibi</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Sipariş Numarası</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary-500"
            placeholder="Örn: 1234ABCD veya tam sipariş numarası"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">E-posta Adresi</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary-500"
            placeholder="Siparişte kullandığınız e-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded transition"
          disabled={loading}
        >
          {loading ? "Sorgulanıyor..." : "Siparişi Sorgula"}
        </button>
        {error && <div className="mt-4 text-red-600 text-sm text-center">{error}</div>}
      </form>

      {order && (
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Sipariş Detayları</h2>
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="text-xs bg-gray-200 rounded px-2 py-1">Sipariş No: #{order.id.slice(-8)}</span>
            <span className="text-xs bg-gray-200 rounded px-2 py-1">Durum: {order.status}</span>
            <span className="text-xs bg-gray-200 rounded px-2 py-1">Tarih: {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="mb-2">
            <span className="block text-sm font-medium">Toplam Tutar: <span className="font-bold">{order.total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span></span>
            {order.discount ? <span className="block text-xs text-green-600">İndirim: {order.discount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span> : null}
            {order.shippingCost ? <span className="block text-xs text-blue-600">Kargo: {order.shippingCost.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span> : null}
          </div>
          <div className="mb-2">
            <span className="block text-sm font-medium">Kargo Bilgisi:</span>
            {order.trackingNumber ? (
              <>
                <span className="block text-xs">Takip No: {order.trackingNumber}</span>
                {order.shippingCompany && <span className="block text-xs">Kargo Firması: {order.shippingCompany}</span>}
                {order.shippingTrackingUrl && (
                  <a href={order.shippingTrackingUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary-600 underline">Kargo Takip Linki</a>
                )}
              </>
            ) : (
              <span className="block text-xs text-gray-500">Kargo bilgisi henüz eklenmedi.</span>
            )}
          </div>
          <div className="mb-2">
            <span className="block text-sm font-medium">Alıcı: {order.guestName} {order.guestSurname} ({order.guestEmail})</span>
            {order.guestPhone && <span className="block text-xs">Telefon: {order.guestPhone}</span>}
          </div>
          {order.address && (
            <div className="mb-2">
              <span className="block text-sm font-medium">Teslimat Adresi:</span>
              <span className="block text-xs">{order.address.title} - {order.address.name} {order.address.surname}</span>
              <span className="block text-xs">{order.address.address}, {order.address.district}, {order.address.city}</span>
            </div>
          )}
          <div className="mb-2">
            <span className="block text-sm font-medium">Ürünler:</span>
            <ul className="divide-y divide-gray-200">
              {order.items.map(item => (
                <li key={item.id} className="py-2 flex items-center gap-3">
                  {item.product.image && <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded" />}
                  <div>
                    <span className="block font-medium">{item.product.name}</span>
                    <span className="block text-xs text-gray-500">Adet: {item.quantity} | Fiyat: {item.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                    {item.size && <span className="block text-xs">Beden: {item.size}</span>}
                    {item.color && <span className="block text-xs">Renk: {item.color}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
