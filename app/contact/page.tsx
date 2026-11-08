'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';

function ContactContent() {
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
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-light tracking-widest uppercase">Холбоо барих</h1>
          <p className="mt-2 text-xs text-gray-400 tracking-wider">Бидэнтэй хэзээ ҳам холбогдох боломжтой</p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Зүүн тал: Хаяг болон холбоо барих мэдээлэл */}
          <div className="flex flex-col gap-8 border border-gray-200 p-8">
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Хаяг байршил</h2>
              <p className="text-sm font-medium leading-relaxed">Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Брэндийн шоурүүм</p>
            </div>

            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Утасны дугаар</h2>
              <p className="text-sm font-medium">+976 9911-2233</p>
            </div>

            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Сошиал сувгууд</h2>
              <div className="flex flex-col gap-1 text-sm font-medium">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:underline">
                  Instagram: @mybrand.mn
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:underline">
                  Facebook: My Brand Store
                </a>
              </div>
            </div>
          </div>

          {/* Баруун тал: Хүргэлтийн нөхцөл */}
          <div className="flex flex-col gap-8 border border-gray-200 p-8 bg-gray-50/50">
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-4">Хүргэлтийн нөхцөл</h2>
              <ul className="flex flex-col gap-3 text-xs text-gray-600 leading-relaxed">
                <li>• Улаанбаатар хот дотор захиалга баталгаажсанаас хойш 24-48 цагийн дотор хүргэгдэнэ.</li>
                <li>• Орон нутгийн унаанд найдвартай явуулах боломжтой.</li>
                <li>• Урьдчилсан захиалгатай (Pre-order) бараа бүтээгдэхүүн 7-14 хоногийн дотор ирнэ.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white text-xs tracking-widest uppercase text-gray-400">Ачаалж байна...</div>}>
      <ContactContent />
    </Suspense>
  );
}