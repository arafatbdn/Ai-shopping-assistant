import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthProvider.jsx';
import { addCartItem, fetchCart, removeCartItem, updateCartItem } from '../features/cart/api/cartApi.js';

export default function CartPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      setCart(await fetchCart());
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCart(); }, [user]);

  const subtotal = useMemo(() => (cart.items || []).reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0), [cart]);

  const getProductId = (product) => {
    if (!product) return null;
    return typeof product === 'object' ? (product._id || product.id) : String(product);
  };

  const changeQuantity = async (product, amount) => {
    const productId = getProductId(product);
    if (!productId) return;
    try {
      if (amount > 0) await addCartItem(productId, amount);
      else if (amount < 0) {
        const item = cart.items.find((entry) => String(getProductId(entry.product)) === String(productId));
        if (item?.quantity > 1) await updateCartItem(productId, item.quantity - 1);
        else await removeCartItem(productId);
      }
      await loadCart();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your cart.');
    }
  };

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-xl flex-col items-center justify-center px-5 text-center">
        <ShoppingCart size={48} className="mb-4 text-[#FF9900]" />
        <h1 className="font-display text-3xl font-bold text-[#0f1111]">Sign in to view your cart</h1>
        <p className="mt-3 text-sm text-[#565959]">ShopPilot keeps your cart securely linked to your AgentShop AI account.</p>
        <Link
          to="/login?next=/cart"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-6 py-3 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
        >
          Sign in <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-81px)] max-w-5xl px-5 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c45500]">Your shopping bag</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-[#0f1111]">Cart</h1>
        <p className="mt-1.5 text-sm text-[#565959]">Review products ShopPilot selected for you.</p>
      </div>

      {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      {loading ? (
        <p className="text-sm text-[#565959]">Loading cart…</p>
      ) : !cart.items?.length ? (
        <div className="rounded-2xl border border-[#d5d9d9] bg-white p-12 text-center shadow-sm">
          <Package size={40} className="mx-auto mb-4 text-[#888c8c]" />
          <p className="text-base font-semibold text-[#0f1111]">Your cart is empty.</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-full border border-[#fcd200] bg-[#ffd814] px-6 py-2.5 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00]"
          >
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {cart.items.filter((item) => Boolean(item.product)).map((item, index) => {
              const productId = getProductId(item.product);
              const itemImage = (Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0] : item.product?.image) || '';
              return (
                <article
                  key={productId || index}
                  className="flex items-center gap-4 rounded-xl border border-[#d5d9d9] bg-white p-4 shadow-sm"
                >
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#eaeded] bg-[#f7f8f8] p-1">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.product?.name || 'Product'}
                        className="h-full w-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package size={25} className="text-[#888c8c]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0f1111] hover:text-[#007185]">{item.product?.name || 'Item'}</p>
                    <p className="mt-1 text-xs text-[#565959]">
                      {item.product?.brand || 'Product'} · ৳{(item.product?.price || 0).toLocaleString('en-BD')}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(item.product, -1)}
                        disabled={!productId}
                        className="rounded-md border border-[#d5d9d9] bg-[#f0f2f2] p-1.5 text-[#0f1111] transition hover:bg-[#e3e6e6] disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-6 text-center text-xs font-bold text-[#0f1111]">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.product, 1)}
                        disabled={!productId}
                        className="rounded-md border border-[#d5d9d9] bg-[#f0f2f2] p-1.5 text-[#0f1111] transition hover:bg-[#e3e6e6] disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-[#0f1111]">
                      ৳{((item.product?.price || 0) * item.quantity).toLocaleString('en-BD')}
                    </p>
                    <button
                      onClick={() => productId && removeCartItem(productId).then(loadCart)}
                      disabled={!productId}
                      className="mt-3 text-[#888c8c] transition hover:text-[#B12704] disabled:opacity-40"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="h-fit rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[#0f1111]">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-[#565959]">
              <span>Subtotal</span>
              <span className="font-medium text-[#0f1111]">৳{subtotal.toLocaleString('en-BD')}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-[#eaeded] pt-3 font-semibold">
              <span className="text-[#0f1111]">Total</span>
              <span className="text-lg font-bold text-[#B12704]">৳{subtotal.toLocaleString('en-BD')}</span>
            </div>
            <button
              disabled
              className="mt-5 w-full rounded-full border border-[#fcd200] bg-[#ffd814] px-4 py-2.5 text-sm font-bold text-[#0f1111] opacity-60 shadow-sm"
            >
              Checkout coming next
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
