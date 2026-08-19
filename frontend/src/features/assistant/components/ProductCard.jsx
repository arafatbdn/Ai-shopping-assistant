import { useState } from 'react';
import { Eye, Heart, PackageSearch, ShoppingCart, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthProvider.jsx';
import { addCartItem } from '../../cart/api/cartApi.js';

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 80 80\'><rect width=\'80\' height=\'80\' fill=\'%23122436\'/><path d=\'M20 56l20-22 20 22z\' fill=\'%2377e0c3\' opacity=\'.35\'/><circle cx=\'40\' cy=\'28\' r=\'6\' fill=\'%2377e0c3\' opacity=\'.45\'/></svg>';

function formatPrice(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD')}`;
}

function StockBadge({ stock }) {
  if (stock > 5) return <span className="rounded-full bg-mint/15 px-2 py-[2px] text-[10px] font-medium text-mint">In stock</span>;
  if (stock > 0) return <span className="rounded-full bg-amber-300/15 px-2 py-[2px] text-[10px] font-medium text-amber-200">Only {stock} left</span>;
  return <span className="rounded-full bg-rose-300/15 px-2 py-[2px] text-[10px] font-medium text-rose-200">Out of stock</span>;
}

function ProductPreviewModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d1a2c] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white/70 transition hover:bg-black/60 hover:text-white"
        >
          <X size={15} />
        </button>
        <div className="flex h-56 items-center justify-center bg-gradient-to-br from-violet/25 to-mint/10">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <PackageSearch size={56} className="text-white/30" />
          )}
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{product.brand || 'Catalog product'}</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-white">{product.name}</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-semibold text-mint">{formatPrice(product.price)}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-white/60">
                <Star size={12} className="fill-amber-300 text-amber-300" /> {Number(product.rating || 0).toFixed(1)}
                <span className="text-white/30">({product.reviewCount || 0})</span>
              </span>
              <StockBadge stock={product.stock} />
            </div>
          </div>
          {product.description && <p className="text-sm leading-6 text-white/65">{product.description}</p>}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(product.specs).slice(0, 6).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-white/[0.04] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">{key}</p>
                  <p className="mt-1 text-xs text-white/75">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product, onAskAbout }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (event) => {
    event.stopPropagation();
    if (!user) {
      navigate('/login?next=/cart');
      return;
    }
    setAdding(true);
    setFeedback('');
    try {
      await addCartItem(product.id, 1);
      setFeedback('Added to cart ✓');
    } catch (requestError) {
      setFeedback(requestError.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
      window.setTimeout(() => setFeedback(''), 2200);
    }
  };

  const handleWishlist = (event) => {
    event.stopPropagation();
    if (!user) {
      setFeedback('Sign in to save items');
      window.setTimeout(() => setFeedback(''), 2200);
      return;
    }
    setFeedback('Saved ✓');
    window.setTimeout(() => setFeedback(''), 2200);
  };

  const handleViewDetails = (event) => {
    event.stopPropagation();
    setPreviewOpen(true);
  };

  const handleAskAbout = () => {
    if (typeof onAskAbout === 'function') onAskAbout(product);
  };

  const image = product.images?.[0] || PLACEHOLDER;

  return (
    <>
      <article
        onClick={handleAskAbout}
        className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition hover:-translate-y-1 hover:border-mint/30"
      >
        <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-violet/20 to-mint/10">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER;
            }}
          />
          {product.discountPercentage > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-rose-300/90 px-2 py-[2px] text-[10px] font-semibold text-ink">
              -{product.discountPercentage}%
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/40 to-transparent px-3 pb-2 pt-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-[10px] text-white/80">Click to ask ShopPilot about this</p>
          </div>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/90">{product.name}</p>
              <p className="mt-[2px] text-[10px] text-white/40">{product.brand || 'Catalog'}</p>
            </div>
            <span className="shrink-0 font-display text-sm font-semibold text-mint">{formatPrice(product.price)}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className="flex items-center gap-1">
              <Star size={10} className="fill-amber-300 text-amber-300" /> {Number(product.rating || 0).toFixed(1)}
            </span>
            <span className="text-white/20">·</span>
            <span>{product.reviewCount || 0} reviews</span>
            <StockBadge stock={product.stock} />
          </div>
          {product.description && (
            <p className="line-clamp-2 text-[11px] leading-5 text-white/45">{product.description}</p>
          )}
          {feedback && <p className="text-[10px] text-mint">{feedback}</p>}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleViewDetails}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1.5 text-[11px] font-medium text-white/75 transition hover:bg-white/[0.12] hover:text-white"
            >
              <Eye size={12} /> View
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/65 transition hover:bg-white/[0.12] hover:text-rose-200"
              aria-label="Add to wishlist"
            >
              <Heart size={12} />
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || product.stock < 1}
              className="flex flex-[1.4] items-center justify-center gap-1 rounded-lg bg-mint px-2 py-1.5 text-[11px] font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={12} />
              {adding ? 'Adding…' : product.stock < 1 ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </article>
      {previewOpen && <ProductPreviewModal product={product} onClose={() => setPreviewOpen(false)} />}
    </>
  );
}