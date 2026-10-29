'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../store/useCartStore';

function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);
  const { addToCart } = useCartStore();

  // Туршилтын дата (Бодит төсөлд Supabase-ээс авна)
  const productsData = [
    {
      id: 1,
      title: 'Бүтээгдэхүүн 1',
      price: 50000,
      description: 'Энэ бол барааны дэлгэрэнгүй тайлбар хэсэг юм.',
      imageUrl: '',
    },
  ];

  const product = productsData.find((p) => p.id === productId) || {
    id: productId,
    title: `Бараа #${productId}`,
    price: 25000,
    description: 'Барааны тайлбар одоогоор оруулаагүй байна.',
    imageUrl: '',
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="mb-6 inline-block text-sm text-gray-500 hover:text-black">
        ← Буцах
      </Link>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="h-80 w-full rounded-2xl bg-gray-200">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full rounded-2xl object-cover"
            />
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="mt-2 text-2xl font-semibold text-amber-600">
              {product.price.toLocaleString()} ₮
            </p>
            <p className="mt-4 text-gray-600">{product.description}</p>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="mt-6 w-full rounded-xl bg-black py-3 text-white hover:bg-gray-800"
          >
            Сагсанд хийх
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-10 text-center">Ачаалж байна...</div>}>
      <ProductContent {...props} />
    </Suspense>
  );
}