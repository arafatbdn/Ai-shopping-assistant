import { useEffect, useState } from 'react';
import { Loader2, PackageSearch, Trash2 } from 'lucide-react';
import { deleteAdminProduct, fetchAdminProducts } from '../../features/admin/api/adminApi.js';

const formatPrice = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`;

export default function CatalogManager({ onDeleted }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchAdminProducts();
      setProducts(response.products || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = (product) => setPendingDelete(product);

  const cancelDelete = () => setPendingDelete(null);

  const performDelete = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await deleteAdminProduct(pendingDelete.id);
      setProducts((current) => current.filter((product) => product.id !== pendingDelete.id));
      onDeleted?.();
      setPendingDelete(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet/10 text-violet-200">
            <PackageSearch size={17} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Catalog manager</h2>
            <p className="mt-1 text-xs text-white/40">Remove products and their references across carts, wishlists, and orders</p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/60 transition hover:border-mint/40 hover:text-mint disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl bg-black/10 px-4 py-6 text-sm text-white/55">
          <Loader2 size={16} className="animate-spin text-mint" /> Loading catalog…
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-xl bg-black/10 px-4 py-6 text-sm text-white/45">No products in the catalog yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-lg bg-white/[0.06] text-xs text-white/35">
                  No image
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/80">{product.name}</p>
                <p className="mt-0.5 text-[11px] text-white/35">
                  {product.brand} · {product.category || product.categorySlug || 'Uncategorized'}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px]">
                  <span className="font-semibold text-mint">{formatPrice(product.price)}</span>
                  <span className="text-white/40">Stock: {product.stock}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => confirmDelete(product)}
                disabled={deletingId === product.id}
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-rose-300/20 bg-rose-300/10 text-rose-200 transition hover:bg-rose-300/20 disabled:opacity-50"
                title="Delete product"
              >
                {deletingId === product.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1a2c] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-semibold">Delete product?</h3>
            <p className="mt-2 text-sm text-white/55">
              This will remove <span className="font-semibold text-white/80">{pendingDelete.name}</span> from the catalog and clean up any references in carts, wishlists, and order history. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-sm text-white/65 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={deletingId === pendingDelete.id}
                className="flex items-center gap-2 rounded-xl bg-rose-400/90 px-4 py-2 text-sm font-semibold text-ink transition hover:scale-[1.01] disabled:opacity-50"
              >
                {deletingId === pendingDelete.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}