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

  const changeQuantity = async (productId, amount) => {
    try {
      if (amount > 0) await addCartItem(productId, amount);
      else if (amount < 0) {
        const item = cart.items.find((entry) => String(entry.product?._id) === String(productId));
        if (item?.quantity > 1) await updateCartItem(productId, item.quantity - 1);
        else await removeCartItem(productId);
      }
      await loadCart();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your cart.');
    }
  };

  if (!user) return <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-xl flex-col items-center justify-center px-5 text-center"><ShoppingCart size={42} className="mb-4 text-mint" /><h1 className="font-display text-3xl font-semibold">Sign in to view your cart</h1><p className="mt-3 text-sm text-white/45">ShopPilot keeps your cart securely linked to your AgentShop AI account.</p><Link to="/login?next=/cart" className="mt-6 rounded-xl bg-mint px-5 py-3 text-sm font-semibold text-ink">Sign in <ArrowRight size={15} className="ml-1 inline" /></Link></section>;

  return (
    <section className="mx-auto min-h-[calc(100vh-81px)] max-w-5xl px-5 py-12 lg:px-8">
      <div className="mb-8"><p className="text-xs font-medium uppercase tracking-[0.22em] text-mint">Your shopping bag</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Cart</h1><p className="mt-2 text-sm text-white/45">Review products ShopPilot selected for you.</p></div>
      {error && <p className="mb-4 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p>}
      {loading ? <p className="text-sm text-white/50">Loading cart…</p> : !cart.items?.length ? <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center"><Package size={36} className="mx-auto mb-4 text-white/30" /><p className="text-white/65">Your cart is empty.</p><Link to="/" className="mt-5 inline-block rounded-xl bg-mint px-5 py-3 text-sm font-semibold text-ink">Explore products</Link></div> : <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">{cart.items.map((item) => <article key={item.product?._id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.05]">{item.product?.images?.[0] ? <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" /> : <Package size={25} className="text-white/25" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.product?.name}</p><p className="mt-1 text-xs text-white/40">{item.product?.brand} · ৳{item.product?.price?.toLocaleString('en-BD')}</p><div className="mt-3 flex items-center gap-2"><button onClick={() => changeQuantity(item.product?._id, -1)} className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-white"><Minus size={13} /></button><span className="min-w-6 text-center text-xs">{item.quantity}</span><button onClick={() => changeQuantity(item.product?._id, 1)} className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-white"><Plus size={13} /></button></div></div><div className="text-right"><p className="text-sm font-semibold text-mint">৳{((item.product?.price || 0) * item.quantity).toLocaleString('en-BD')}</p><button onClick={() => removeCartItem(item.product?._id).then(loadCart)} className="mt-3 text-white/30 transition hover:text-rose-200" aria-label="Remove from cart"><Trash2 size={16} /></button></div></article>)}</div>
        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-5"><h2 className="font-display text-lg font-semibold">Order summary</h2><div className="mt-5 flex justify-between text-sm text-white/55"><span>Subtotal</span><span>৳{subtotal.toLocaleString('en-BD')}</span></div><div className="mt-3 flex justify-between border-t border-white/10 pt-4 font-semibold"><span>Total</span><span className="text-mint">৳{subtotal.toLocaleString('en-BD')}</span></div><button disabled className="mt-6 w-full rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-ink opacity-60">Checkout coming next</button></aside>
      </div>}
    </section>
  );
}
