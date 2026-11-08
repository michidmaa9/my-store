'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    }
    checkUser();
  }, []);

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Таны сагс хоосон байна.');
      return;
    }

    if (!customerName || !phoneNumber || !address) {
      alert('Бүх талбарыг бөглөнө үү!');
      return;
    }

    setLoading(true);

    // 1. Database рүү захиалга хадгалах
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
      setLoading(false);
    } else {
      // 2. Захиалга амжилттай болсны дараа Resend API ашиглан имэйл илгээх
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            email: session?.user?.email,
            totalPrice,
            items: cart,
            address,
          }),
        });
      } catch (err) {
        console.error('Email sending failed:', err);
      }

      setOrderSuccess(true);
      clearCart();
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center text-gray-900">
        <div className="max-w-md border border-gray-200 p-8 shadow-sm">
          <h1 className="text-xl font-light tracking-widest uppercase mb-4">Захиалга амжилттай!</h1>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Таны захиалгыг амжилттай хүлээн авлаа. Бүртгэлтэй имэйл хаяг руу захиалгын мэдээлэл илгээгдлээ. Бид тун удаан тантай холбогдох болно.
          </p>
          <Link
            href="/"
            className="inline-block bg-black px-8 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
          >
            Дэлгүүр рүү буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 md:p-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <Link href="/" className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-black">
            ← Буцах
          </Link>
          <h1 className="text-xl font-light tracking-widest uppercase">Захиалга баталгаажуулах</h1>
          <div className="w-16" />
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-4">Таны сагс хоосон байна.</p>
            <Link
              href="/"
              className="inline-block bg-black px-6 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
            >
              Дэлгүүр хэсэх
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Зүүн тал: Захиалагчийн мэдээлэл оруулах форм */}
            <form onSubmit={handleSubmitOrder} className="flex flex-col gap-6">
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-400">Хүргэлтийн мэдээлэл</h2>
              
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Нэр *</label>
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
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Утасны дугаар *</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="99112233"
                  className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Хүргэх хаяг *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Дүүрэг, хороо, байрны дугаар гэх мэт"
                  rows={3}
                  className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-black py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 disabled:bg-gray-200 transition"
              >
                {loading ? 'Илгээж байна...' : 'Захиалга баталгаажуулах'}
              </button>
            </form>

            {/* Баруун тал: Сагсны тойм */}
            <div className="border border-gray-200 p-8 h-fit bg-gray-50/50">
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">Таны сагс ({cart.length})</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-72 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">Тоо ширхэг: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {(item.price * item.quantity).toLocaleString()} ₮
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-500">Нийт дүн:</span>
                <span className="text-lg font-bold text-gray-900">{totalPrice.toLocaleString()} ₮</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}