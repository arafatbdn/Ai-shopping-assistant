import { useEffect, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { createAdminProduct } from '../../features/admin/api/adminApi.js';

const categories = ['Computers', 'Laptops', 'Mobiles', 'Monitors', 'Audio', 'Cameras', 'Gaming Accessories', 'Wearables'];

export default function ProductUploadForm({ onCreated }) {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    const formElement = event.currentTarget;
    try {
      const data = await createAdminProduct(new FormData(formElement));
      setStatus({ type: 'success', message: data?.message || 'Product uploaded successfully' });
      formElement.reset();
      if (preview) URL.revokeObjectURL(preview);
      setPreview('');
      onCreated?.(data.product);
    } catch (requestError) {
      // Surface the real failure: server message, status, and network details.
      const serverMessage = requestError?.response?.data?.message;
      const status = requestError?.response?.status;
      console.error('[ProductUploadForm] upload failed', {
        message: requestError?.message,
        status,
        serverMessage,
        requestSent: !!requestError?.request,
      });
      const detail = serverMessage
        ? `${serverMessage}${status ? ` (HTTP ${status})` : ''}`
        : requestError?.message
          ? `${requestError.message}${status ? ` (HTTP ${status})` : ''}`
          : 'Product upload failed';
      setStatus({ type: 'error', message: detail });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/10 text-mint"><ImagePlus size={17} /></span><div><h2 className="font-display text-lg font-semibold">Upload a product</h2><p className="mt-1 text-xs text-white/40">Save catalog details and an image to MongoDB</p></div></div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="name" required placeholder="Product name" className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <input name="brand" required placeholder="Brand" className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <select name="category" required defaultValue="" className="rounded-xl border border-white/10 bg-[#0d1a2c] px-4 py-3 text-sm text-white/80 outline-none focus:border-violet"><option value="" disabled>Select category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
        <input name="tags" placeholder="Tags: laptop, gaming, budget" className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <input name="price" required min="0" type="number" placeholder="Selling price (BDT)" className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <input name="originalPrice" min="0" type="number" placeholder="Original price (BDT)" className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <input name="stock" required min="0" type="number" placeholder="Stock quantity" className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-black/10 px-4 py-3 text-sm text-white/55 hover:border-mint/50"><Upload size={16} className="text-mint" /><span className="truncate">Choose product image (max 2MB)</span><input name="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" /></label>
      </div>
      <textarea name="description" required rows="3" placeholder="Product description" className="mt-4 w-full rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
      {preview && <img src={preview} alt="Product preview" className="mt-4 h-28 w-28 rounded-xl object-cover" />}
      {status.message && <p className={`mt-4 rounded-xl px-3 py-2 text-xs ${status.type === 'success' ? 'bg-mint/10 text-mint' : 'bg-rose-400/10 text-rose-200'}`}>{status.message}</p>}
      <button disabled={loading} className="mt-5 flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-ink transition hover:scale-[1.01] disabled:opacity-50"><Upload size={16} />{loading ? 'Uploading…' : 'Save product'}</button>
    </form>
  );
}
