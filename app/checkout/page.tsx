'use client';

import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });

  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Таны сагс хоосон байна!');
      return;
    }

    if (!receiptImage) {
      alert('Төлбөр төлсөн баримтын зургийг заавал хавсаргана уу!');
      return;
    }

    setLoading(true);

    try {
      // 1. Баримтын зургийг Supabase Storage руу хуулах
      const fileExt = receiptImage.name.split('.').pop();
      const fileName = `${Date.now()}_${formData.phone}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptImage);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Зургийн Public URL-ийг авах
      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      const receiptUrl = publicUrlData.publicUrl;

      // 3. Захиалгын мэдээллийг Supabase `orders` хүснэгт рүү хадгалах
      const { error: dbError } = await supabase.from('orders').insert([
        {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          note: formData.note,
          total_price: getTotalPrice(),
          cart_items: cart,
          receipt_url: receiptUrl,
          status: 'Pending',
        },
      ]);

      if (dbError) {
        throw dbError;
      }

      setIsSubmitted(true);
      clearCart();
    } catch (error: any) {
      console.error('Алдаа гарлаа:', error);
      alert('Захиалга хадгалахад алдаа гарлаа: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Захиалга амжилттай хадгалагдлаа!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Мэдээлэл датабейз рүү илгээгдлээ. Бид шалгаад <strong>{formData.phone}</strong> дугаараар холбогдоно.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block w-full rounded-xl bg-black py-3 font-bold text-white transition hover:bg-gray-800"
          >
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-wider">
            MY BRAND
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-black">
            ← Буцах
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-extrabold text-gray-900">Захиалга баталгаажуулах</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">1. Хүргэлтийн мэдээлэл</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Нэр *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Таны нэр"
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9911xxxx"
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл хаяг</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Хүргэлтийн хаяг *</label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Дүүрэг, хороо, байр, хаалганы дугаар"
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">2. Төлбөр төлөх мэдээлэл</h2>
                
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 mb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-xl border shadow-sm text-center">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=KHANBANK:5000000000"
                        alt="Хаан банк QR"
                        className="h-32 w-32 object-contain mx-auto"
                      />
                      <span className="text-[10px] text-gray-500 font-semibold block mt-1">Хаан Банк QR</span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong>Банк:</strong> Хаан Банк</p>
                      <p><strong>Дансны дугаар:</strong> <span className="text-lg font-extrabold text-amber-700">5000000000</span></p>
                      <p><strong>Дансны нэр:</strong> Н. Бат-Эрдэнэ</p>
                      <p><strong>Гүйлгээний утга:</strong> <span className="font-semibold text-black">{formData.phone ? formData.phone : 'Утасны дугаар'}</span></p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Гүйлгээний баримтын зураг хавсаргах *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleImageChange}
                    className="w-full rounded-xl border border-gray-300 p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                  />

                  {receiptPreview && (
                    <div className="mt-4">
                      <img
                        src={receiptPreview}
                        alt="Төлбөрийн баримт"
                        className="h-40 w-auto rounded-lg border object-cover shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 py-4 font-bold text-white hover:bg-amber-600 transition shadow-md text-lg disabled:bg-gray-400"
              >
                {loading ? 'Уншиж байна...' : `Захиалга баталгаажуулах (${getTotalPrice().toLocaleString()} ₮)`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Захиалгын хураангуй</h2>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-500">Сагс хоосон байна.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                        <div>
                          <h4 className="text-sm font-semibold">{item.title}</h4>
                          <p className="text-xs text-gray-500">{item.price.toLocaleString()} ₮ x {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()} ₮</span>
                    </div>
                  ))}

                  <div className="mt-4 flex justify-between border-t pt-4 text-lg font-extrabold text-gray-900">
                    <span>Нийт төлөх:</span>
                    <span>{getTotalPrice().toLocaleString()} ₮</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}