import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../layouts/AppShell.jsx';
import AssistantPage from '../pages/AssistantPage.jsx';
import InsightsPage from '../pages/InsightsPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import CartPage from '../pages/CartPage.jsx';
import AdminOverviewPage from '../pages/AdminOverviewPage.jsx';
import AdminUploadPage from '../pages/AdminUploadPage.jsx';
import AdminCatalogPage from '../pages/AdminCatalogPage.jsx';
import AdminMetricsPage from '../pages/AdminMetricsPage.jsx';
import AdminInsightsPage from '../pages/AdminInsightsPage.jsx';
import AdminStockPage from '../pages/AdminStockPage.jsx';
import AdminNotificationsPage from '../pages/AdminNotificationsPage.jsx';
import RequireAdmin from '../features/auth/components/RequireAdmin.jsx';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<AssistantPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/dashboard" element={<InsightsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        <Route
          path="/admin/overview"
          element={
            <RequireAdmin>
              <AdminOverviewPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <RequireAdmin>
              <AdminUploadPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/catalog"
          element={
            <RequireAdmin>
              <AdminCatalogPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/metrics"
          element={
            <RequireAdmin>
              <AdminMetricsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/insights"
          element={
            <RequireAdmin>
              <AdminInsightsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/stock"
          element={
            <RequireAdmin>
              <AdminStockPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <RequireAdmin>
              <AdminNotificationsPage />
            </RequireAdmin>
          }
        />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </AppShell>
  );
}
