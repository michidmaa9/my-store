'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';


// Админ нууц үг
const ADMIN_PASSWORD = 'admin123password'; 

interface Order {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  total_price: number;
  cart_items: any[];
  receipt_url: string;
  status: string;
  created_at: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  is_preorder: boolean;
  image_url: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    is_preorder: false,
    image_url: '',
  });

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchOrders();
      fetchProducts();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setIsAuthenticated(true);
      setPasswordError('');
      fetchOrders();
      fetchProducts();
    } else {
      setPasswordError('Нууц үг буруу байна! Дахин туршина уу.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setOrdersLoading(false);
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    setProducts(data || []);
    setProductsLoading(false);
  };

  const updateStatus = async (id: number, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.image_url) {
      alert('Бүх талбарыг бөглөнө үү!');
      return;
    }

    const { error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        price: Number(newProduct.price),
        is_preorder: newProduct.is_preorder,
        image_url: newProduct.image_url,
      },
    ]);

    if (error) {
      alert('Бараа нэмэхэд алдаа гарлаа: ' + error.message);
    } else {
      alert('Шинэ бараа амжилттай нэмэгдлээ!');
      setNewProduct({ title: '', price: '', is_preorder: false, image_url: '' });
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Энэ барааг устгахдаа итгэлтэй байна уу?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
          <h2 className="mb-2 text-2xl font-bold text-center text-gray-900">Админ Нэвтрэх</h2>
          <p className="mb-6 text-sm text-center text-gray-500">Админ хянах цонх руу нэвтрэх нууц үгээ оруулна уу.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Нууц үг"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {passwordError && (
              <p className="text-xs font-semibold text-red-500 text-center">{passwordError}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-black py-3 font-bold text-white hover:bg-gray-800 transition"
            >
              Нэвтрэх
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-gray-500 hover:underline">
              ← Нүүр хуудас руу буцах
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Админ хянах цонх</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white font-semibold hover:bg-red-700 transition"
            >
              Гарах
            </button>
            <Link href="/" className="rounded-lg bg-black px-4 py-2 text-sm text-white">
              Нүүр хуудас
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-300 mb-8">
          <button
            onClick={() => setTab('orders')}
            className={`pb-3 text-lg font-bold transition ${
              tab === 'orders' ? 'border-b-2 border-black text-black' : 'text-gray-400'
            }`}
          >
            Захиалгууд ({orders.length})
          </button>
          <button
            onClick={() => setTab('products')}
            className={`pb-3 text-lg font-bold transition ${
              tab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-400'
            }`}
          >
            Барааны удирдлага ({products.length})
          </button>
        </div>

        {/* Tab 1: Захиалгууд */}
        {tab === 'orders' && (
          <div>
            {ordersLoading ? (
              <p className="text-center py-10 text-gray-500">Уншиж байна...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-10 text-gray-500">Захиалга байхгүй байна.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-col justify-between gap-4 border-b pb-4 lg:flex-row lg:items-center">
                      <div>
                        <span className="text-xs font-bold text-gray-400">ID: #{order.id}</span>
                        <h3 className="text-lg font-bold text-gray-800">{order.full_name} ({order.phone})</h3>
                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Төлөв:</span>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="rounded-lg border bg-gray-50 p-2 text-sm font-medium focus:outline-none"
                        >
                          <option value="Pending">Шалгаж байна</option>
                          <option value="Paid">Төлөгдсөн</option>
                          <option value="Shipped">Хүргэгдсэн</option>
                          <option value="Cancelled">Цуцлагдсан</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div>
                        <h4 className="mb-2 text-sm font-bold text-gray-700">Бараанууд:</h4>
                        <div className="space-y-2">
                          {order.cart_items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <img src={item.imageUrl} alt={item.title} className="h-10 w-10 rounded object-cover" />
                              <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.price?.toLocaleString()} ₮ x {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-base font-extrabold text-gray-900">
                          Нийт: {order.total_price?.toLocaleString()} ₮
                        </p>
                      </div>

                      <div className="text-sm space-y-1 text-gray-600">
                        <h4 className="mb-2 text-sm font-bold text-gray-700">Хүргэлтийн хаяг:</h4>
                        <p><strong>Хаяг:</strong> {order.address}</p>
                        <p><strong>Тайлбар:</strong> {order.note || '-'}</p>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-bold text-gray-700">Төлбөрийн баримт:</h4>
                        {order.receipt_url ? (
                          <a href={order.receipt_url} target="_blank" rel="noopener noreferrer">
                            <img src={order.receipt_url} alt="Receipt" className="h-32 w-auto rounded-lg border object-cover hover:opacity-80" />
                          </a>
                        ) : (
                          <p className="text-xs text-gray-400">Баримтгүй</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Барааны удирдлага */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Шинэ бараа нэмэх</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Барааны нэр *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder="Жишээ: Худи"
                    className="w-full rounded-xl border p-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Үнэ (₮) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="89000"
                    className="w-full rounded-xl border p-3 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Зургийн URL *</label>
                  <input
                    type="url"
                    required
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border p-3 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="preorder"
                    checked={newProduct.is_preorder}
                    onChange={(e) => setNewProduct({ ...newProduct, is_preorder: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="preorder" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Урьдчилсан захиалгын бараа эсэх
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-black py-3 font-bold text-white hover:bg-gray-800 transition"
                >
                  Бараа нэмэх
                </button>
              </form>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Байгаа бараанууд</h3>

                {productsLoading ? (
                  <p className="text-sm text-gray-500">Уншиж байна...</p>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-4">
                          <img src={product.image_url} alt={product.title} className="h-14 w-14 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-semibold text-sm">{product.title}</h4>
                            <p className="text-xs text-gray-500">{product.price.toLocaleString()} ₮</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              product.is_preorder ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {product.is_preorder ? 'Урьдчилсан захиалга' : 'Бэлэн байгаа'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-xs text-red-500 hover:underline font-bold"
                        >
                          Устгах
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}