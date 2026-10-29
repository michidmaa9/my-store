'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const router = Router();
  const { cart, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Нийт төлөх дүн бодож гаргах
  const totalPrice = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  // Захиалга илгээх функц
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Таны сагс хоосон байна!');
      return;
    }

    if (!customerName || !phoneNumber || !address) {
      alert('Бүх мэдээллийг бүрэн оруулна уу!');
      return;
    }

    setSubmitting(true);

    // Supabase-ийн 'orders' хүснэгт рүү захиалга хадгалах
    const { error } = await supabase.from('orders').insert([
      {
        customer_name: customerName,
        phone_number: phoneNumber,
        address: address,
        total_price: totalPrice,
        items: cart, // Захиалсан бараануудын жагсаалтыг JSON байдлаар хадгалах
        status: 'pending', // Захиалгын төлөв: хүлээгдэж буй
      },
    ]);

    if (error) {
      alert('Захиалга илгээхэд алдаа гарлаа: ' + error.message);
    } else {
      setOrderSuccess(true);
      clearCart(); // Сагсыг цэвэрлэх
    }

    setSubmitting(false);
  };

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Захиалга амжилттай!</h1>
          <p className="mt-2 text-sm text-gray-600">
            Бид таны захиалгыг хүлээн авлаа. Бэлэн мөнгө болон дансны шилжүүлгээр төлбөрөө хийснээр хүргэлт хийгдэнэ.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-xl bg-black py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Захиалга Баталгаажуулах</h1>
          <Link
            href="/"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            ← Буцах
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Захиалагчийн мэдээлэл авах форм */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Хүргэлтийн мэдээлэл</h2>
            <form onSubmit={handleSubmitOrder} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Нэр *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Захиалагчийн нэр"
                  className="w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Утасны дугаар *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="99112233"
                  className="w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Хүргэлтийн хаяг *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Дүүрэг, хороо, байр, хаалганы дугаар"
                  rows={3}
                  className="w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="mt-4 w-full rounded-xl bg-amber-500 py-3 font-bold text-white hover:bg-amber-600 disabled:bg-gray-300"
              >
                {submitting ? 'Захиалж байна...' : 'Захиалга Илгээх'}
              </button>
            </form>
          </div>

          {/* Сагсан дахь барааны хураангуй */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="mb-4 text-xl font-bold">Сонгосон бараанууд ({cart.length})</h2>
              {cart.length === 0 ? (
                <p className="text-gray-500">Сагсанд бараа байхгүй байна.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm text-gray-500">
                          {Number(item.price).toLocaleString()} ₮ x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-amber-600">
                        {(Number(item.price) * item.quantity).toLocaleString()} ₮
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Нийт төлөх дүн:</span>
                <span className="text-amber-600">{totalPrice.toLocaleString()} ₮</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}