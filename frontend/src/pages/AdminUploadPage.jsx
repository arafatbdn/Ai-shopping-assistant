import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import ProductUploadForm from '../components/admin/ProductUploadForm.jsx';

export default function AdminUploadPage() {
  const navigate = useNavigate();
  return (
    <AdminLayout
      title="Upload a product"
      subtitle="Save catalog details and an image to MongoDB."
    >
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate('/admin/catalog')}
          className="text-xs font-medium text-violet-200 transition hover:text-mint"
        >
          ← View catalog manager
        </button>
      </div>
      <ProductUploadForm
        onCreated={(product) => {
          if (product?.slug) navigate('/admin/catalog');
        }}
      />
    </AdminLayout>
  );
}
