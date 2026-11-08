'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Админ нууц үг
  const ADMIN_PASSWORD = 'admin123';

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [loading, setLoading] = useState(true);

  // Шинэ барааны state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPreorder, setIsPreorder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Нууц үг шалгах
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchAllData();
    } else {
      alert('Нууц үг буруу байна!');
    }
  };

  // Дата татах (Бараа болон Захиалга)
  const fetchAllData = async () => {
    setLoading(true);
    
    // Бараа татах
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });
    if (prodData) setProducts(prodData);

    // Захиалга татах
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (orderData) setOrders(orderData);

    setLoading(false);
  };

  // Бараа нэмэх
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return alert('Барааны нэр болон үнийг оруулна уу!');

    setSubmitting(true);
    const { error } = await supabase.from('products').insert([
      {
        title,
        price: Number(price),
        image_url: imageUrl,
        is_preorder: isPreorder,
      },
    ]);

    if (error) {
      alert('Бараа нэмэхэд алдаа гарлаа: ' + error.message);
    } else {
      alert('Бараа амжилттай нэмэгдлээ!');
      setTitle('');
      setPrice('');
      setImageUrl('');
      setIsPreorder(false);
      fetchAllData();
    }
    setSubmitting(false);
  };

  // Бараа устгах
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Энэ барааг устгахдаа итгэлтэй байна уу?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Устгахад алдаа гарлаа: ' + error.message);
    } else {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // Захиалгын төлөв шинэчлэх функц
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert('Төлөв шинэчлэхэд алдаа гарлаа: ' + error.message);
    } else {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  // Нууц үг нэхэх хэсэг
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm border border-gray-200 p-8 shadow-sm"
        >
          <h2 className="mb-6 text-center text-xs font-bold tracking-widest uppercase">Админ нэвтрэх</h2>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Нууц үг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
          >
            Нэвтрэх
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 text-gray-900 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <h1 className="text-xl font-light tracking-widest uppercase">Админ Самбар</h1>
          <Link
            href="/"
            className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-black"
          >
            ← Дэлгүүр рүү буцах
          </Link>
        </div>

        {/* Таб сонгох хэсэг */}
        <div className="mb-8 flex gap-6 text-xs font-bold tracking-widest uppercase">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 transition ${
              activeTab === 'products'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            Барааны удирдлага ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 transition ${
              activeTab === 'orders'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            Ирсэн захиалгууд ({orders.length})
          </button>
        </div>

        {/* 1. БАРААНЫ УДИРДЛАГА ХЭСЭГ */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Шинэ бараа нэмэх Форм */}
            <div className="border border-gray-200 p-6 h-fit">
              <h2 className="mb-6 text-xs font-bold tracking-widest uppercase">Шинэ бараа нэмэх</h2>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Барааны нэр *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Жишээ: Хууди"
                    className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Үнэ (₮) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50000"
                    className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Зургийн URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="preorder"
                    checked={isPreorder}
                    onChange={(e) => setIsPreorder(e.target.checked)}
                    className="h-4 w-4 rounded-none border-gray-300 accent-black"
                  />
                  <label htmlFor="preorder" className="text-xs tracking-wider text-gray-700">
                    Урьдчилсан захиалга (Pre-order)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full bg-black py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 disabled:bg-gray-200 transition"
                >
                  {submitting ? 'Нэмж байна...' : 'Бараа оруулах'}
                </button>
              </form>
            </div>

            {/* Барааны жагсаалт */}
            <div className="border border-gray-200 p-6 lg:col-span-2">
              <h2 className="mb-6 text-xs font-bold tracking-widest uppercase">Барааны жагсаалт</h2>
              {loading ? (
                <p className="text-xs text-gray-400">Ачаалж байна...</p>
              ) : products.length === 0 ? (
                <p className="text-xs text-gray-400">Одоогоор бараа оруулаагүй байна.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {products.map((product) => {
                    const imgSrc = product.image_url || product.imageUrl;
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between border-b border-gray-100 pb-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-gray-100">
                            {imgSrc ? (
                              <img src={imgSrc} alt={product.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                Зураггүй
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.title}</p>
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">
                              {Number(product.price).toLocaleString()} ₮
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Устгах
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ЗАХИАЛГУУДЫН ХЭСЭГ */}
        {activeTab === 'orders' && (
          <div className="border border-gray-200 p-6">
            <h2 className="mb-6 text-xs font-bold tracking-widest uppercase">Ирсэн захиалгууд</h2>
            {loading ? (
              <p className="text-xs text-gray-400">Ачаалж байна...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-gray-400">Одоогоор захиалга ирээгүй байна.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((order) => {
                  const currentStatus = order.status || 'pending';
                  
                  return (
                    <div key={order.id} className="border border-gray-200 p-6">
                      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-bold uppercase tracking-wider">
                              Үйлчлүүлэгч: {order.customer_name}
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
                          <p className="text-xs text-gray-600 mt-1">
                            Утас: <a href={`tel:${order.phone_number}`} className="underline font-medium">{order.phone_number}</a>
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">Хаяг: {order.address}</p>
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
                        <div className="flex flex-col gap-1.5">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-gray-700">• {item.title} (x{item.quantity})</span>
                              <span className="font-medium">{(Number(item.price) * item.quantity).toLocaleString()} ₮</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Төлөв өөрчлөх товчлуурууд */}
                      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mr-2">Төлөв өөрчлөх:</span>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'pending')}
                          className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition ${
                            currentStatus === 'pending'
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                          }`}
                        >
                          Хүлээгдэж буй
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition ${
                            currentStatus === 'delivered'
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                          }`}
                        >
                          Хүргэгдсэн
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border transition ${
                            currentStatus === 'cancelled'
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                          }`}
                        >
                          Цуцлах
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}