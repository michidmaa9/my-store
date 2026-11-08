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
  
  // Размер сонгох Modal-д зориулсан state-үүд
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const { cart, addToCart, removeFromCart, toastMessage } = useCartStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function initData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    initData();

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
    
    if (selectedCategory !== 'all') {
      return matchesSearch && product.category === selectedCategory;
    }
    
    return matchesSearch;
  });

  const handleAddToCartClick = (product: any) => {
    const hasSizes = product.sizes && product.sizes.trim().length > 0;
    
    if (hasSizes) {
      setSelectedProductForModal(product);
      const sizeList = product.sizes.split(',').map((s: string) => s.trim());
      setSelectedSize(sizeList[0] || '');
    } else {
      addToCart(product);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForModal) return;
    
    addToCart(selectedProductForModal, selectedSize, 1);
    setSelectedProductForModal(null);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <div>
        {/* Top Announcement / Contact Bar */}
        <div className="bg-black text-white text-[10px] tracking-widest uppercase py-2 px-6 flex justify-between items-center">
          <div className="flex gap-6">
            <span>📞 Утас: 99112233</span>
            <span className="hidden sm:inline">💬 KakaoTalk: dalaishand</span>
            <span className="hidden sm:inline">📘 FB: DALAISHAND CARGO</span>
          </div>
          <div>
            <Link href="/contact" className="hover:underline">Холбоо барих</Link>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase">
              <Link href="/" className="hover:text-black text-gray-600 transition">Нүүр</Link>
              <Link href="/contact" className="hover:text-black text-gray-600 transition">Хүргэлт & Үйлчилгээ</Link>
            </nav>

            {/* Брэндийн нэр / Лого */}
            <Link href="/" className="text-lg font-black tracking-[0.2em] uppercase text-center">
              DALAISHAND CARGO
            </Link>

            <div className="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase">
              <Link href="/admin" className="hidden sm:inline-block text-gray-500 hover:text-black transition">
                Админ
              </Link>

              {user && (
                <Link href="/orders" className="text-gray-500 hover:text-black transition">
                  Миний захиалгууд
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3">
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
                className="flex items-center gap-1.5 font-bold text-black hover:opacity-70 transition bg-gray-100 px-3 py-2"
              >
                <span>Сагс</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="bg-gray-50 border-b border-gray-100 py-16 px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase bg-black text-white px-3 py-1 mb-4 inline-block">
              Солонгос - Монгол Карго & Электроникс
            </span>
            <h1 className="text-3xl font-light tracking-widest sm:text-5xl uppercase mt-2 mb-4">
              Шинэ улирлын бараанууд
            </h1>
            <p className="text-xs text-gray-500 tracking-wider leading-relaxed">
              Чанар болон загварыг эрхэмлэгчдэд зориулсан албан ёсны сонголт. Шуурхай тээвэрлэлт, найдвартай үйлчилгээ.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-12">
          {/* Search and Filters */}
          <div className="mb-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <input
              type="text"
              placeholder="Барааны нэрээр хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none sm:w-80"
            />

            <div className="flex flex-wrap gap-4 text-xs font-bold tracking-wider uppercase">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`pb-1 transition ${selectedCategory === 'all' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Бүгд
              </button>
              <button
                onClick={() => setSelectedCategory('hoodie')}
                className={`pb-1 transition ${selectedCategory === 'hoodie' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Хууди / Цамц
              </button>
              <button
                onClick={() => setSelectedCategory('pants')}
                className={`pb-1 transition ${selectedCategory === 'pants' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Өмд
              </button>
              <button
                onClick={() => setSelectedCategory('jacket')}
                className={`pb-1 transition ${selectedCategory === 'jacket' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Гадуур хувцас
              </button>
              <button
                onClick={() => setSelectedCategory('shoes')}
                className={`pb-1 transition ${selectedCategory === 'shoes' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Гутал
              </button>
              <button
                onClick={() => setSelectedCategory('accessories')}
                className={`pb-1 transition ${selectedCategory === 'accessories' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}
              >
                Аксессуар
              </button>
            </div>
          </div>

          {/* Product Grid / Loading / Empty States */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mb-4"></div>
              <p className="text-xs tracking-widest uppercase text-gray-500">Бараа мэдээллийг ачаалж байна...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-gray-200 p-8 max-w-lg mx-auto">
              <p className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">Бүтээгдэхүүн олдсонгүй</p>
              <p className="text-xs text-gray-400 mb-6">Та өөр түлхүүр үгээр хайж үзэх эсвэл ангиллаа солино уу.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="bg-black text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition"
              >
                Бүх барааг харах
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
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
                        <h2 className="text-sm font-medium text-gray-900 group-hover:underline">{product.title}</h2>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">
                            {Number(product.price).toLocaleString()} ₮
                          </p>
                          <span className="text-[10px] text-gray-500 font-semibold tracking-wider">
                            Үлдэгдэл: {product.stock ?? 10}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="flex-1 border border-black py-2.5 text-center text-xs font-bold tracking-wider uppercase hover:bg-black hover:text-white transition"
                        >
                          Үзэх
                        </Link>
                        <button
                          onClick={() => handleAddToCartClick(product)}
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
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12 px-6 mt-20 text-center text-xs text-gray-500 tracking-wider">
        <p className="font-bold text-black uppercase tracking-[0.2em] mb-2">DALAISHAND CARGO</p>
        <p>© 2026 Бүх эрх хуулиар хамгаалагдсан.</p>
        <div className="mt-4 flex justify-center gap-6 text-[10px] font-bold uppercase">
          <span>Утас: 99112233</span>
          <span>KakaoTalk: dalaishand</span>
          <span>Facebook: DALAISHAND CARGO</span>
        </div>
      </footer>

      {/* Төрөл / Размер сонгох Modal Popup */}
      {selectedProductForModal && (
        <div 
          onClick={() => setSelectedProductForModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white p-6 shadow-2xl rounded-none max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-xs font-bold tracking-widest uppercase">Төрөл / Размер сонгох</h2>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="text-gray-400 hover:text-black text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm font-bold text-gray-900 uppercase">{selectedProductForModal.title}</p>
              <p className="text-xs text-gray-500 mt-1">Та хүссэн төрлөө сонгоод сагсанд нэмнэ үү</p>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 pr-1">
              {selectedProductForModal.sizes
                .split(',')
                .map((s: string) => s.trim())
                .map((size: string) => (
                  <div
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between border p-4 cursor-pointer transition ${
                      selectedSize === size
                        ? 'border-black bg-gray-50 ring-1 ring-black'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {selectedProductForModal.image_url || selectedProductForModal.imageUrl ? (
                        <img
                          src={selectedProductForModal.image_url || selectedProductForModal.imageUrl}
                          alt={selectedProductForModal.title}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                          Зураггүй
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase">{size}</p>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">
                          {Number(selectedProductForModal.price).toLocaleString()} ₮
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Үлдэгдэл: {selectedProductForModal.stock ?? 999} ширхэг
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className={`text-xs px-3 py-1 font-bold uppercase tracking-widest ${selectedSize === size ? 'bg-black text-white' : 'border border-gray-300 text-gray-500'}`}>
                        {selectedSize === size ? 'Сонгосон' : 'Сонгох'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 flex gap-3">
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="flex-1 border border-gray-300 py-3 text-center text-xs font-bold tracking-widest text-gray-700 uppercase hover:bg-gray-100 transition"
              >
                Цуцлах
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 bg-black py-3 text-center text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 transition"
              >
                Сагсанд хийх
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl"
          >
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
                    key={item.cartItemId}
                    className="flex items-center justify-between border-b border-gray-100 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {Number(item.price).toLocaleString()} ₮ x {item.quantity}
                      </p>
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase shadow-2xl transition-all duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  );
}