'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/useCartStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { cart, addToCart, removeFromCart } = useCartStore();

  useEffect(() => {
    if (!id) return;
    async function fetchProductDetail() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-400 text-xs tracking-widest uppercase">
        Уншиж байна...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900">
        <p className="text-sm tracking-widest uppercase mb-4">Бараа олдсонгүй</p>
        <Link href="/" className="text-xs font-bold tracking-widest underline uppercase">
          Нүүр хуудас руу буцах
        </Link>
      </div>
    );
  }

  const imgSrc = product.image_url || product.imageUrl;

  const handleAddToCartWithSize = () => {
    // Размерын мэдээллийг нэртэй нь хамт сагслах эсвэл тусдаа хадгалах боломжтой
    addToCart({ ...product, title: `${product.title} (Размер: ${selectedSize})` });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-black">
            ← Буцах
          </Link>
          <Link href="/" className="text-xl font-black tracking-[0.25em]">
            MY BRAND
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase text-black"
          >
            <span>Сагс</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

      {/* Product Detail Section */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Зургийн хэсэг */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
            {product.is_preorder && (
              <span className="absolute top-4 left-4 z-10 bg-black px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                Pre-order
              </span>
            )}
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.title}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                Зураггүй
              </div>
            )}
          </div>

          {/* Мэдээлэл болон сонголтууд */}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-light tracking-wide uppercase sm:text-3xl">{product.title}</h1>
            <p className="mt-4 text-xl font-medium tracking-wider text-gray-900">
              {Number(product.price).toLocaleString()} ₮
            </p>

            <div className="my-8 h-[1px] w-full bg-gray-100" />

            {/* Размер сонгох */}
            <div className="mb-8">
              <label className="mb-3 block text-xs font-bold tracking-widest uppercase text-gray-500">
                Размер: <span className="text-black font-extrabold">{selectedSize}</span>
              </label>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 w-12 rounded-none border text-xs font-bold tracking-widest transition ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Сагслах товч */}
            <button
              onClick={handleAddToCartWithSize}
              className="w-full bg-black py-4 text-xs font-bold tracking-[0.2em] text-white uppercase hover:bg-gray-800 transition"
            >
              Сагсанд нэмэх
            </button>

            {/* Нэмэлт тайлбар */}
            <div className="mt-10 text-xs text-gray-500 leading-relaxed tracking-wide">
              <p className="font-bold text-gray-800 mb-1 uppercase tracking-widest">Хүргэлтийн мэдээлэл</p>
              Улаанбаатар хот дотор 24-48 цагийн дотор хүргэгдэнэ. Орон нутгийн унаанд явуулах боломжтой.
            </div>
          </div>
        </div>
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