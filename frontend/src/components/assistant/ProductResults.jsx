import ProductCard from '../../features/assistant/components/ProductCard.jsx';

export default function ProductResults({ products, onAskAbout }) {
  if (!products?.length) return null;
  const list = products.slice(0, 4);
  return (
    <div className="ml-10 mt-1 grid gap-3 sm:grid-cols-2">
      {list.map((product) => (
        <ProductCard key={product.id} product={product} onAskAbout={onAskAbout} />
      ))}
    </div>
  );
}
