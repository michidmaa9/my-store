'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, Product } from './store/useCartStore';
import { supabase } from './lib/supabase';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, addToCart, removeFromCart, getTotalPrice, getTotalCount } = useCartStore();

  // Supabase-ээс бараануудыг татах
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Бараа татахад алдаа гарлаа:', error);
      } else if (data) {
        // Supabase-ийн мэдээллийг хэлбэрт оруулах
        const formattedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          isPreorder: item.is_preorder,
          imageUrl: item.image_url,
        }));
        setProducts(formattedProducts);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-wider">
            MY BRAND
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin" className="text-gray-500 hover:text-black">
              Админ
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full bg-black px-5 py-2 text-white hover:bg-gray-800 transition"
            >
              Сагс ({getTotalCount()})
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-neutral-900 py-20 text-center text-white">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">ШИНЭ ЦУГЛУУЛГА</h2>
        <p className="mt-4 text-gray-400">Урьдчилсан захиалгын онцлох бараануудыг сонирхоорой.</p>
      </section>

      {/* Products Grid */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h3 className="mb-8 text-2xl font-bold">Барааны жагсаалт</h3>

        {loading ? (
          <p className="text-center py-10 text-gray-500">Барааны мэдээллийг уншиж байна...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
                <span className={`absolute left-6 top-6 z-10 rounded-full px-3 py-1 text-xs font-bold text-white ${
                  product.isPreorder ? 'bg-amber-500' : 'bg-emerald-600'
                }`}>
                  {product.isPreorder ? 'Урьдчилсан захиалга' : 'Бэлэн байгаа'}
                </span>

                <Link href={`/products/${product.id}`}>
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 cursor-pointer">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="mt-4 flex flex-col gap-2">
                  <Link href={`/products/${product.id}`}>
                    <h4 className="font-semibold text-gray-800 hover:underline cursor-pointer">{product.title}</h4>
                  </Link>
                  <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString()} ₮</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-95"
                  >
                    Сагсанд хийх
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col justify-between bg-white p-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold">Таны сагс</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black font-bold p-1">
                  ✕
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">Сагс хоосон байна.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <img src={item.imageUrl} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.price.toLocaleString()} ₮ x {item.quantity}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline">
                        Устгах
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Нийт дүн:</span>
                  <span>{getTotalPrice().toLocaleString()} ₮</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full rounded-xl bg-amber-500 py-3 text-center font-bold text-white hover:bg-amber-600 transition shadow-md"
                >
                  Захиалах
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}