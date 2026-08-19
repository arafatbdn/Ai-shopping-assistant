import AdminLayout from '../components/admin/AdminLayout.jsx';
import CatalogManager from '../components/admin/CatalogManager.jsx';

export default function AdminCatalogPage() {
  return (
    <AdminLayout
      title="Catalog manager"
      subtitle="Remove products and clean up their references across carts, wishlists, and orders."
    >
      <CatalogManager />
    </AdminLayout>
  );
}
