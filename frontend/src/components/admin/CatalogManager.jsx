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
    <div className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f2f2] text-[#131921]">
            <PackageSearch size={18} />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-[#0f1111]">Catalog manager</h2>
            <p className="mt-0.5 text-xs text-[#565959]">Remove products and their references across carts, wishlists, and orders</p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-3.5 py-1.5 text-xs font-semibold text-[#0f1111] transition hover:bg-[#e3e6e6] hover:border-[#FF9900] disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 rounded-lg bg-[#f7f8f8] px-4 py-6 text-sm text-[#565959]">
          <Loader2 size={16} className="animate-spin text-[#FF9900]" /> Loading catalog…
        </div>
      ) : products.length === 0 ? (
        <p className="rounded-lg bg-[#f7f8f8] px-4 py-6 text-sm text-[#565959]">No products in the catalog yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-lg border border-[#eaeded] bg-[#f7f8f8] p-3 shadow-xs"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 flex-shrink-0 rounded-lg border border-[#eaeded] object-contain mix-blend-multiply bg-white"
                />
              ) : (
                <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-lg bg-[#eaeded] text-xs text-[#888c8c]">
                  No image
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0f1111]">{product.name}</p>
                <p className="mt-0.5 text-[11px] text-[#565959]">
                  {product.brand} · {product.category || product.categorySlug || 'Uncategorized'}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px]">
                  <span className="font-bold text-[#0f1111]">{formatPrice(product.price)}</span>
                  <span className="text-[#565959]">Stock: {product.stock}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => confirmDelete(product)}
                disabled={deletingId === product.id}
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
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
          <div className="w-full max-w-md rounded-2xl border border-[#d5d9d9] bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#0f1111]">Delete product?</h3>
            <p className="mt-2 text-sm text-[#565959]">
              This will remove <span className="font-semibold text-[#0f1111]">{pendingDelete.name}</span> from the catalog and clean up any references in carts, wishlists, and order history. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-4 py-2 text-sm font-semibold text-[#0f1111] transition hover:bg-[#e3e6e6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={deletingId === pendingDelete.id}
                className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
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