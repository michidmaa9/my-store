'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Та эхлээд нэвтэрнэ үү!');
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email);

      // Тухайн хэрэглэгчийн захиалгуудыг database-ээс татах
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }

    fetchUserOrders();
  }, [router]);

  return (
    <div className="min-h-screen bg-white p-6 text-gray-900 md:p-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <Link href="/" className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-black">
            ← Дэлгүүр рүү буцах
          </Link>
          <h1 className="text-xl font-light tracking-widest uppercase">Миний захиалгууд</h1>
          <div className="w-16" />
        </div>

        {userEmail && (
          <p className="mb-8 text-xs text-gray-400 tracking-wider">
            Бүртгэлтэй имэйл: <span className="font-semibold text-gray-800">{userEmail}</span>
          </p>
        )}

        {loading ? (
          <p className="py-20 text-center text-xs text-gray-400 tracking-widest uppercase">Уншиж байна...</p>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-4">Одоогоор хийсэн захиалга байхгүй байна.</p>
            <Link
              href="/"
              className="inline-block bg-black px-6 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
            >
              Дэлгүүр хэсэх
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const currentStatus = order.status || 'pending';

              return (
                <div key={order.id} className="border border-gray-200 p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
                          Захиалга #{order.id}
                        </p>
                        <span
                          className={`px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
                            currentStatus === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : currentStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {currentStatus === 'delivered'
                            ? 'Хүргэгдсэн'
                            : currentStatus === 'cancelled'
                            ? 'Цуцлагдсан'
                            : 'Хүлээгдэж буй'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Хүргэх хаяг: {order.address}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-base font-bold text-gray-900">
                        {Number(order.total_price).toLocaleString()} ₮
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleString('mn-MN')}
                      </p>
                    </div>
                  </div>

                  {/* Захиалсан бараанууд */}
                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Захиалсан бараанууд:</p>
                    <div className="flex flex-col gap-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs border-b border-gray-50 pb-2">
                          <span className="text-gray-800 font-medium">{item.title} (x{item.quantity})</span>
                          <span className="font-semibold">{(Number(item.price) * item.quantity).toLocaleString()} ₮</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-xs tracking-widest uppercase text-gray-400">Ачаалж байна...</div>}>
      <OrdersContent />
    </Suspense>
  );
}