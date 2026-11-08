'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Бүртгүүлэх
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert('Бүртгэгдэхэд алдаа гарлаа: ' + error.message);
      } else {
        alert('Бүртгэл амжилттай! Та одоо нэвтэрнэ үү.');
        setIsSignUp(false);
      }
    } else {
      // Нэвтрэх
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert('Нэвтрэхэд алдаа гарлаа: ' + error.message);
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 text-gray-900">
      <div className="w-full max-w-sm border border-gray-200 p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xs font-bold tracking-widest uppercase">
          {isSignUp ? 'Бүртгүүлэх' : 'Нэвтрэх'}
        </h1>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Имэйл</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">Нууц үг</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-none border-b border-gray-300 bg-transparent px-2 py-2 text-sm focus:border-black focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-black py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-gray-800 disabled:bg-gray-200 transition"
          >
            {loading ? 'Түр хүлээнэ үү...' : isSignUp ? 'Бүртгүүлэх' : 'Нэвтрэх'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-gray-500 hover:text-black tracking-wider uppercase underline"
          >
            {isSignUp ? 'Бүртгэлтэй юу? Нэвтрэх' : 'Шинэ хэрэглэгч үү? Бүртгүүлэх'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-[10px] text-gray-400 hover:text-black tracking-widest uppercase">
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}