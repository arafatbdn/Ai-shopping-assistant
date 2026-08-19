import { useEffect, useState } from 'react';
import { PackageSearch, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthProvider.jsx';
import { addCartItem } from '../../features/cart/api/cartApi.js';
import { fetchCategoryProducts } from '../../features/catalog/api/catalogApi.js';

function normalizeProduct(product) {
  const image = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images[0]
    : (product.image || '');
  return {
    ...product,
    id: product.id || product._id,
    category: product.category?.name || product.category || '',
    image,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : (image ? [image] : []),
  };
}

export default function CategoryProducts({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [addingId, setAddingId] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!category) return undefined;
    let active = true;
    setLoading(true);
    setError('');
    fetchCategoryProducts(category)
      .then((items) => active && setProducts(items.map(normalizeProduct)))
      .catch(() => active && setError('Category products could not be loaded.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [category]);

  const addProduct = async (product) => {
    if (!user) {
      navigate('/login?next=/cart');
      return;
    }
    setAddingId(product.id);
    try {
      await addCartItem(product.id);
      setCartMessage(`${product.name} added to cart`);
    } catch (requestError) {
      setCartMessage(requestError.response?.data?.message || 'Could not add product to cart');
    } finally {
      setAddingId('');
      window.setTimeout(() => setCartMessage(''), 2500);
    }
  };

  if (!category) return null;

  return (
    <section id="category-catalog" className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-16 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-mint">Live catalog</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{category.name} products</h2>
        </div>
        <div className="text-right"><span className="text-xs text-white/35">{loading ? 'Loading from MongoDB…' : `${products.length} products found`}</span>{cartMessage && <p className="mt-1 text-xs text-mint">{cartMessage}</p>}</div>
      </div>

      {error && <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</p>}
      {!loading && !error && !products.length && <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/50">No products found in this category yet.</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-mint/30">
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-violet/20 to-mint/10">
              {(product.images?.[0] || product.image) ? (
                <img src={product.images?.[0] || product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <PackageSearch size={38} className="text-white/30" />
              )}
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-semibold text-white/90">{product.name}</p>
              <p className="mt-1 text-xs text-white/40">{product.brand} · ★ {product.rating || 0} · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
              <div className="mt-4 flex items-center justify-between"><span className="text-base font-semibold text-mint">৳{product.price?.toLocaleString('en-BD')}</span><span className="text-[11px] text-white/35">{product.discountPercentage ? `${product.discountPercentage}% off` : 'Catalog price'}</span></div>
              <button onClick={() => addProduct(product)} disabled={addingId === product.id || product.stock < 1} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-3 py-2 text-xs font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart size={14} />{addingId === product.id ? 'Adding…' : product.stock < 1 ? 'Out of stock' : 'Add to cart'}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
