'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from './store/useCartStore';
import { supabase } from './lib/supabase';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { cart, addToCart, removeFromCart } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ready' | 'preorder'>('all');

  useEffect(() => {
    async function initData() {
      // Хэрэглэгч нэвтэрсэн эсэхийг шалгах
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Бараа татах
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    initData();

    // Auth төлөв өөрчлөгдөхөд сонсох
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'ready') {
      return matchesSearch && !product.is_preorder;
    }
    if (filterType === 'preorder') {
      return matchesSearch && product.is_preorder;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-widest uppercase">
            <button 
              onClick={() => setFilterType('all')}
              className="text-gray-600 hover:text-black transition"
            >
              Коллекци
            </button>
            <button 
              onClick={() => setFilterType('ready')}
              className="text-gray-600 hover:text-black transition"
            >
              Бэлэн бараа
            </button>
            <button 
              onClick={() => setFilterType('preorder')}
              className="text-gray-600 hover:text-black transition"
            >
              Урьдчилсан захиалга
            </button>
          </nav>

          <Link href="/contact" className="text-gray-600 hover:text-black transition">
            Холбоо барих
          </Link>

          <Link href="/" className="text-xl font-black tracking-[0.25em]">
            MY BRAND
          </Link>

          <div className="flex items-center gap-6 text-xs font-medium tracking-wider uppercase">
            <Link href="/admin" className="hidden sm:inline-block text-gray-500 hover:text-black transition">
              Админ
            </Link>

            {/* Энд "Миний захиалгууд" линкийг нэмсэн байгаа */}
            {user && (
              <Link href="/orders" className="text-gray-500 hover:text-black transition">
                Миний захиалгууд
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-gray-500 text-[10px]">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline text-xs"
                >
                  Гарах
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-black font-bold hover:underline">
                Нэвтрэх
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 font-semibold text-black hover:opacity-70 transition"
            >
              <span>Сагс</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-light tracking-widest sm:text-4xl uppercase">Шинэ Улирал</h1>
          <p className="mt-2 text-sm text-gray-400">Чанар болон загварыг эрхэмлэгчдэд</p>
        </div>

        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none sm:w-72"
          />

          <div className="flex gap-4 text-xs font-semibold tracking-wider">
            <button
              onClick={() => setFilterType('all')}
              className={`pb-1 transition ${filterType === 'all' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
            >
              БҮГД
            </button>
            <button
              onClick={() => setFilterType('ready')}
              className={`pb-1 transition ${filterType === 'ready' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
            >
              БЭЛЭН
            </button>
            <button
              onClick={() => setFilterType('preorder')}
              className={`pb-1 transition ${filterType === 'preorder' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
            >
              ПРЕ-ОРДЕР
            </button>
          </div>
        </div>

        {loading ? (
          <p className="py-20 text-center text-sm text-gray-400 tracking-wider">Ачаалж байна...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">Бараа олдсонгүй.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const imgSrc = product.image_url || product.imageUrl;

              return (
                <div key={product.id} className="group flex flex-col">
                  <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden bg-gray-100">
                    {product.is_preorder && (
                      <span className="absolute top-3 left-3 z-10 bg-black px-2.5 py-1 text-[9px] font-bold tracking-widest text-white uppercase">
                        Pre-order
                      </span>
                    )}
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={product.title}
                        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        Зураггүй
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-gray-900">{product.title}</h2>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {Number(product.price).toLocaleString()} ₮
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex-1 border border-black py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-black hover:text-white transition"
                      >
                        Үзэх
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-black py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-gray-800 transition"
                      >
                        Сагслах
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-sm font-bold tracking-widest uppercase">Таны сагс</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">Сагс хоосон байна.</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-100 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {Number(item.price).toLocaleString()} ₮ x {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Устгах
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full bg-black py-3.5 text-center text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
                >
                  Захиалга өгөх
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}