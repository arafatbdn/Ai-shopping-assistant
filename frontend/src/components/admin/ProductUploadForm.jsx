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
    <form onSubmit={submit} className="rounded-xl border border-[#d5d9d9] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f0f2f2] text-[#131921]">
          <ImagePlus size={18} />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-[#0f1111]">Upload a product</h2>
          <p className="mt-0.5 text-xs text-[#565959]">Save catalog details and an image to MongoDB</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Product name"
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <input
          name="brand"
          required
          placeholder="Brand"
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <select
          name="category"
          required
          defaultValue=""
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        >
          <option value="" disabled>Select category</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          name="tags"
          placeholder="Tags: laptop, gaming, budget"
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <input
          name="price"
          required
          min="0"
          type="number"
          placeholder="Selling price (BDT)"
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <input
          name="originalPrice"
          min="0"
          type="number"
          placeholder="Original price (BDT)"
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <input
          name="stock"
          required
          min="0"
          type="number"
          placeholder="Stock quantity"
          className="rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
        />
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#d5d9d9] bg-[#f7f8f8] px-3.5 py-2.5 text-sm text-[#565959] transition hover:border-[#FF9900]">
          <Upload size={16} className="text-[#FF9900]" />
          <span className="truncate">Choose product image (max 2MB)</span>
          <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>
      <textarea
        name="description"
        required
        rows="3"
        placeholder="Product description"
        className="mt-4 w-full rounded-lg border border-[#d5d9d9] bg-white px-3.5 py-2.5 text-sm text-[#0f1111] outline-none focus:border-[#FF9900]"
      />
      {preview && (
        <img
          src={preview}
          alt="Product preview"
          className="mt-4 h-28 w-28 rounded-lg border border-[#eaeded] object-cover"
        />
      )}
      {status.message && (
        <p
          className={`mt-4 rounded-lg border px-3.5 py-2 text-xs ${
            status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {status.message}
        </p>
      )}
      <button
        disabled={loading}
        className="mt-5 flex items-center gap-2 rounded-full border border-[#fcd200] bg-[#ffd814] px-6 py-2.5 text-sm font-bold text-[#0f1111] shadow-sm transition hover:bg-[#f7ca00] disabled:opacity-50"
      >
        <Upload size={16} />
        {loading ? 'Uploading…' : 'Save product'}
      </button>
    </form>
  );
}
