'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';

function CheckoutContent() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Захиал өгөхийн тулд эхлээд нэвтэрнэ үү!');
        router.push('/login');
      } else {
        setUserId(session.user.id);
      }
    }
    checkUser();
  }, [router]);

  const totalPrice = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

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

    const { error } = await supabase.from('orders').insert([
      {
        customer_name: customerName,
        phone_number: phoneNumber,
        address: address,
        total_price: totalPrice,
        items: cart,
        status: 'pending',
        user_id: userId,
      },
    ]);

    if (error) {
      alert('Захиалга илгээхэд алдаа гарлаа: ' + error.message);
    } else {
      setOrderSuccess(true);
      clearCart();
    }

    setSubmitting(false);
  };

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-full max-w-md border border-gray-200 p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white text-lg font-bold">
            ✓
          </div>
          <h1 className="text-lg font-bold tracking-widest uppercase">Захиалга амжилттай!</h1>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed tracking-wide">
            Бид таны захиалгыг хүлээн авлаа. Банкны данс руу шилжүүлэг хийснээр захиалга баталгаажина.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full bg-black py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
          >
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-black">
            ← Дэлгүүр рүү буцах
          </Link>
          <Link href="/" className="text-xl font-black tracking-[0.25em]">
            MY BRAND
          </Link>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-10 text-xl font-light tracking-widest uppercase text-center">Захиалга баталгаажуулах</h1>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="border border-gray-200 p-8">
              <h2 className="mb-6 text-xs font-bold tracking-widest uppercase">Хүргэлтийн мэдээлэл</h2>
              <form onSubmit={handleSubmitOrder} className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">Нэр *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Таны нэр"
                    className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">Утасны дугаар *</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="99112233"
                    className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600">Хүргэлтийн хаяг *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Дүүрэг, хороо, байр"
                    rows={3}
                    className="w-full rounded-none border border-gray-300 bg-transparent p-3 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="mt-4 w-full bg-black py-4 text-xs font-bold tracking-[0.2em] text-white uppercase hover:bg-gray-800 disabled:bg-gray-200 transition"
                >
                  {submitting ? 'Илгээж байна...' : 'Захиалга баталгаажуулах'}
                </button>
              </form>
            </div>
          </div>

          <div className="border border-gray-200 p-8 h-fit">
            <h2 className="mb-6 text-xs font-bold tracking-widest uppercase">Таны захиалга ({cart.length})</h2>

            {cart.length === 0 ? (
              <p className="text-xs text-gray-400">Сагс хоосон байна.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-1">Тоо: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {(Number(item.price) * item.quantity).toLocaleString()} ₮
                    </p>
                  </div>
                ))}

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between text-base font-bold">
                    <span className="text-xs uppercase tracking-widest">Нийт дүн:</span>
                    <span>{totalPrice.toLocaleString()} ₮</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-xs tracking-widest uppercase text-gray-400">Ачаалж байна...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}