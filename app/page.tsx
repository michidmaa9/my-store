'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, Product } from './store/useCartStore';
import { supabase } from './lib/supabase';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, addToCart, removeFromCart } = useCartStore();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
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
              className="relative font-semibold text-black"
            >
              Сагс ({cart.reduce((acc, item) => acc + item.quantity, 0)})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Бараанууд</h1>

        {loading ? (
          <p className="text-gray-500">Ачаалж байна...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-400">Зураггүй</span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold">{product.title}</h2>
                  <p className="mt-1 font-semibold text-amber-600">
                    {product.price.toLocaleString()} ₮
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 rounded-lg border py-2 text-center text-sm font-medium hover:bg-gray-50"
                  >
                    Дэлгэрэнгүй
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 rounded-lg bg-black py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Сагслах
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold">Таны сагс</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500">Сагс хоосон байна.</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b py-3"
                  >
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString()} ₮ x {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Устгах
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full rounded-xl bg-amber-500 py-3 text-center font-bold text-white hover:bg-amber-600"
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