// components/ProductCard.js
'use client';
import Link from 'next/link';
import { useState } from 'react';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'star-filled' : 'star-empty'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-500 text-xs ml-1">({Number(rating).toFixed(1)})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const addToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: String(product.name),
        price: Number(product.price),
        image: String(product.image),
        quantity: 1,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imageSrc = imgError || !product.image 
    ? 'https://placehold.co/400x300/1f2937/ffffff?text=Product' 
    : String(product.image);

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="product-card glass-card overflow-hidden group cursor-pointer h-full flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden bg-slate-800 h-48">
          <img
            src={imageSrc}
            alt={String(product.name || 'Product')}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
          {/* Category badge */}
          <span className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
            {String(product.category || 'General')}
          </span>
          {Number(product.stock) < 20 && (
            <span className="absolute top-2 right-2 bg-red-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
              Low Stock
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {String(product.name || 'Unknown Product')}
          </h3>
          <p className="text-slate-400 text-xs mb-3 line-clamp-2 flex-1">
            {String(product.description || '')}
          </p>

          <StarRating rating={Number(product.rating) || 4.0} />

          <div className="flex items-center justify-between mt-3">
            <span className="text-2xl font-bold text-white">
              ${(Number(product.price) || 0).toFixed(2)}
            </span>
            <button
              onClick={addToCart}
              id={`add-to-cart-${product.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              {added ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
