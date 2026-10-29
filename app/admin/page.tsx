'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Шинэ барааны формуудын state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPreorder, setIsPreorder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Бараануудыг Supabase-ээс татаж авах
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Шинэ бараа нэмэх функц
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
      fetchProducts(); // Жагсаалтыг шинэчлэх
    }
    setSubmitting(false);
  };

  // Бараа устгах функц
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Энэ барааг устгахдаа итгэлтэй байна уу?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      alert('Устгахад алдаа гарлаа: ' + error.message);
    } else {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Админ Самбар</h1>
          <Link href="/" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100">
            ← Дэлгэрэнгүй Дэлгүүр рүү буцах
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Шинэ бараа нэмэх Форм */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Шинэ бараа нэмэх</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Барааны нэр *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Жишээ: Хууди"
                  className="w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Үнэ (₮) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50000"
                  className="w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Зургийн URL (Image URL)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preorder"
                  checked={isPreorder}
                  onChange={(e) => setIsPreorder(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="preorder" className="text-sm">
                  Урьдчилсан захиалга (Pre-order)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {submitting ? 'Нэмж байна...' : 'Бараа оруулах'}
              </button>
            </form>
          </div>

          {/* Барааны жагсаалт ба Устгах хэсэг */}
          <div className="md:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Барааны жагсаалт ({products.length})</h2>

            {loading ? (
              <p className="text-gray-500">Ачаалж байна...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500">Одоогоор бараа оруулаагүй байна.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {products.map((product) => {
                  const imgSrc = product.image_url || product.imageUrl;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {imgSrc ? (
                            <img src={imgSrc} alt={product.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              Зураггүй
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{product.title}</p>
                          <p className="text-sm text-amber-600 font-semibold">
                            {Number(product.price).toLocaleString()} ₮
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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
      </div>
    </div>
  );
}