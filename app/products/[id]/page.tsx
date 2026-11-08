'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../lib/supabase';

function ProductDetailContent() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>('');

  const { cart, addToCart, updateQuantity, removeFromCart, toastMessage } = useCartStore();

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data);
        if (data.sizes) {
          const sizeList = data.sizes.split(',').map((s: string) => s.trim());
          if (sizeList.length > 0) setSelectedSize(sizeList[0]);
        }
        // Зургуудыг салгаж авах (таслалаар тусгаарлагдсан линкүүд)
        if (data.image_url) {
          const imgs = data.image_url.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (imgs.length > 0) setActiveImage(imgs[0]);
        }
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-xs tracking-widest uppercase text-gray-400">
        Ачаалж байна...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-center text-gray-900 p-6">
        <h1 className="text-xl font-light tracking-widest uppercase mb-4">Бараа олдсонгүй</h1>
        <Link href="/" className="bg-black px-6 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition">
          Дэлгүүр рүү буцах
        </Link>
      </div>
    );
  }

  const images = product.image_url ? product.image_url.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const availableSizes = product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : [];

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      alert('Эхлээд размер сонгоно уу!');
      return;
    }

    addToCart(product, selectedSize || '', quantity);
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
            DALAISHAND CARGO
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 font-bold text-black hover:opacity-70 transition text-xs uppercase bg-gray-100 px-3 py-2"
          >
            <span>Сагс</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

      {/* Main Product Section */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          
          {/* Зургийн Галерей (Gallery / Slider) */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 border border-gray-200">
              {product.is_preorder && (
                <span className="absolute top-4 left-4 z-10 bg-black px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                  Pre-order
                </span>
              )}
              {activeImage ? (
                <img src={activeImage} alt={product.title} className="h-full w-full object-cover object-center" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  Зураггүй
                </div>
              )}
            </div>

            {/* Жижиг зургууд (Thumbnails) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden border transition ${
                      activeImage === imgUrl ? 'border-black ring-1 ring-black' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Мэдээлэл болон сонголтууд */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                {product.category || 'Бүтээгдэхүүн'}
              </span>
              <h1 className="text-2xl font-light tracking-wide uppercase mt-1 mb-3">{product.title}</h1>
              <p className="text-xl font-bold text-gray-900 mb-6">
                {Number(product.price).toLocaleString()} ₮
              </p>

              {availableSizes.length > 0 && (
                <div className="border-t border-gray-100 py-6">
                  <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Размер / Төрөл сонгох:</p>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-12 px-5 border text-xs font-bold tracking-widest uppercase transition ${
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
              )}

              <div className="border-t border-gray-100 py-6">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Тоо хэмжээ:</p>
                <div className="flex items-center w-36 border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 text-sm font-bold hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2.5 text-sm font-bold hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Үлдэгдэл: {product.stock ?? 999}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-black py-4 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition mt-6 shadow-md"
            >
              Сагсанд хийх · {(product.price * quantity).toLocaleString()} ₮
            </button>
          </div>
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-sm font-bold tracking-widest uppercase">Таны сагс</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-black text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 max-h-[60vh] overflow-y-auto flex flex-col gap-4">
                {cart.length === 0 ? (
                  <p className="py-12 text-center text-sm text-gray-400">Сагс хоосон байна.</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-center justify-between border-b border-gray-100 pb-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-500 font-semibold">
                          {(item.price * item.quantity).toLocaleString()} ₮
                        </p>
                        
                        <div className="mt-2 flex items-center border border-gray-300 w-24">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="px-2.5 py-1 text-xs font-bold hover:bg-gray-100 transition"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="px-2.5 py-1 text-xs font-bold hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Устгах
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Нийт дүн:</span>
                  <span>{cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()} ₮</span>
                </div>
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase shadow-2xl transition-all duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-xs tracking-widest uppercase text-gray-400">Ачаалж байна...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}