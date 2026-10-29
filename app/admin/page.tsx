'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // -------------------------------------------------------------
  // Энд өөрийн хүссэн админ нууц үгээ тохируулаарай:
  const ADMIN_PASSWORD = 'admin123';
  // -------------------------------------------------------------

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Шинэ барааны формуудын state
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
      fetchProducts();
    } else {
      alert('Нууц үг буруу байна!');
    }
  };

  // Бараануудыг Supabase-ээс татах
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  // Шинэ бараа нэмэх
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
      fetchProducts();
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

  // Нууц үгээр нэвтрээгүй үед харагдах цонх
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-md"
        >
          <h2 className="mb-4 text-center text-xl font-bold">Админ Нэвтрэх</h2>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Нууц үгээ оруулна уу"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-black py-2.5 font-medium text-white hover:bg-gray-800"
          >
            Нэвтрэх
          </button>
        </form>
      </div>
    );
  }

  // Нэвтэрсний дараа харагдах Үндсэн Админ Самбар
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Админ Самбар</h1>
          <Link
            href="/"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            ← Дэлгүүр рүү буцах
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Шинэ бараа нэмэх Форм */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">Шинэ бараа нэмэх</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Барааны нэр *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Жишээ: Хууди"
                  className="w