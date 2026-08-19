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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c45500]">Live catalog</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0f1111] sm:text-3xl">{category.name} products</h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-[#565959]">{loading ? 'Loading from MongoDB…' : `${products.length} products found`}</span>
          {cartMessage && <p className="mt-1 text-xs font-semibold text-[#c45500]">{cartMessage}</p>}
        </div>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {!loading && !error && !products.length && (
        <div className="rounded-xl border border-[#d5d9d9] bg-white p-8 text-center text-sm text-[#565959]">
          No products found in this category yet.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="flex flex-col overflow-hidden rounded-xl border border-[#d5d9d9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF9900] hover:shadow-md"
          >
            <div className="flex h-44 items-center justify-center border-b border-[#eaeded] bg-[#f7f8f8] p-3">
              {(product.images?.[0] || product.image) ? (
                <img src={product.images?.[0] || product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
              ) : (
                <PackageSearch size={38} className="text-[#888c8c]" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="line-clamp-2 text-sm font-semibold text-[#0f1111] transition hover:text-[#007185]">{product.name}</p>
              <p className="mt-1 text-xs text-[#565959]">
                {product.brand} · <span className="font-semibold text-[#e47911]">★ {product.rating || 0}</span> · {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-base font-bold text-[#0f1111]">৳{product.price?.toLocaleString('en-BD')}</span>
                {product.discountPercentage ? (
                  <span className="text-[11px] font-bold text-[#B12704]">{product.discountPercentage}% off</span>
                ) : (
                  <span className="text-[11px] text-[#565959]">Catalog price</span>
                )}
              </div>
              <button
                onClick={() => addProduct(product)}
                disabled={addingId === product.id || product.stock < 1}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-4 py-2 text-xs font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00] active:bg-[#f0b800] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={14} />
                {addingId === product.id ? 'Adding…' : product.stock < 1 ? 'Out of stock' : 'Add to cart'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
