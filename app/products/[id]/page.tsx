'use client';

import React, { useState, use } from 'react';
import { useCartStore } from '../../store/useCartStore';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

// Туршилтын дата (Бодит төсөлд Database-ээс авна)
const productsData = [
  {
    id: 1,
    title: 'Оверсайз Хүүди (Хар)',
    price: 129000,
    isPreorder: true,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    description: 'Өндөр чанарын 100% даавуун материалтай, биед эвтэйхэн сул размертай хүүди. Урьдчилсан захиалгаар 7-10 хоногийн дотор хүргэгдэнэ.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 2,
    title: 'Спортын Өмд (Саарал)',
    price: 89000,
    isPreorder: false,
    imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80',
    description: 'Өдөр тутмын болон спортоор хичээллэхэд тохиромжтой зөөлөн хөвөн материалаар хийгдсэн өмд.',
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: 3,
    title: 'Сигнатур Малгай',
    price: 45000,
    isPreorder: false,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    description: 'NC Brand-ийн логотой өдөр тутмын саравчтай малгай.',
    sizes: ['Free'],
  },
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Dynamic params авах
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);
  
  const product = productsData.find((p) => p.id === productId);
  const { addToCart } = useCartStore();

  const [selectedSize, setSelectedSize] = useState<string>('');

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-semibold text-gray-500">Бараа олдсонгүй.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b px-6 py-4">
        <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-black">
          ← Буцах (Нүүр хуудас)
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Барааны том зураг */}
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Барааны мэдээлэл */}
          <div className="flex flex-col justify-between">
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-white mb-4 ${
                product.isPreorder ? 'bg-amber-500' : 'bg-emerald-600'
              }`}>
                {product.isPreorder ? 'Урьдчилсан захиалга' : 'Бэлэн байгаа'}
              </span>

              <h1 className="text-3xl font-extrabold text-gray-900">{product.title}</h1>
              <p className="mt-4 text-2xl font-bold text-gray-900">{product.price.toLocaleString()} ₮</p>

              <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

              {/* Хэмжээ сонгох */}
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Хэмжээ сонгох:</h3>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 w-12 rounded-xl border font-bold transition ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Захиалах товч */}
            <div className="mt-10">
              <button
                onClick={() => {
                  addToCart(product);
                  alert(`${product.title} сагсанд нэмэгдлээ!`);
                }}
                className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white hover:bg-gray-800 transition active:scale-95"
              >
                Сагсанд хийх
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}