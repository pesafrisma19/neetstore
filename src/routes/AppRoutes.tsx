import { Routes, Route } from 'react-router-dom';
import { Home } from '../features/public/home/pages/HomePage';
import { LoginPage } from '../features/public/auth/pages/LoginPage';
import { RegisterPage } from '../features/public/auth/pages/RegisterPage';
import { CheckoutPage } from '../features/public/checkout/pages/CheckoutPage';
import { UserDashboardPage } from '../features/user/profile/pages/UserDashboardPage';
import { InvoicePage } from '../features/public/checkout/pages/InvoicePage';
import { SearchPage } from '../features/public/search/pages/SearchPage';
import { NewsPage } from '../features/public/news/pages/NewsPage';
import { TransactionHistoryPage } from '../features/user/transaction/pages/TransactionHistoryPage';
import { PricingPage } from '../features/public/pricing/pages/PricingPage';
import { AdminLogin } from '../features/admin/auth/pages/AdminLogin';
import { AdminLayout } from '../features/admin/layout/components/AdminLayout';
import { ProvidersPage } from '../features/admin/provider/pages/ProvidersPage';
import { AdminOverviewPage } from '../features/admin/overview/pages/AdminOverviewPage';
import { CategoriesPage } from '../features/admin/category/pages/CategoriesPage';
import { BrandsPage } from '../features/admin/brand/pages/BrandsPage';
import { ProductsPage } from '../features/admin/product/pages/ProductsPage';
import { PricingRulesPage } from '../features/admin/pricing-rule/pages/PricingRulesPage';
import { PaymentMethodsPage } from '../features/admin/deposit/pages/PaymentMethodsPage';
import { TransactionsPage } from '../features/admin/transaction/pages/TransactionsPage';
import { VouchersPage } from '../features/admin/voucher/pages/VouchersPage';
import { UsersPage } from '../features/admin/user/pages/UsersPage';
import { MutationsPage } from '../features/admin/transaction/pages/MutationsPage';
import {
  ProductTypesPage,
  RegionsPage,
  ProductCategoriesPage,
  OrdersPage,
  DepositsPage,
  PaymentGatewaysPage,
  ReviewsPage,
  BannersPage,
  FlashsalesPage,
  NewsPageAdmin,
  ReportsSalesPage,
  ReportsTransactionsPage,
  ReportsDepositsPage,
  LogsActivityPage,
  LogsWebhookPage,
  LogsErrorPage,
  SettingsGeneralPage,
  SettingsApiPage,
  SettingsNotificationsPage,
  SettingsSecurityPage,
  SettingsSystemPage,
} from '../features/admin/common/pages/AdminMenuPages';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/daftar-harga" element={<PricingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/category/:categorySlug" element={<Home />} />
      <Route path="/checkout/game/:gameId" element={<CheckoutPage />} />
      <Route path="/invoice" element={<InvoicePage />} />
      <Route path="/invoice/:orderId" element={<InvoicePage />} />
      
      {/* USER ROUTES */}
      <Route path="/dashboard" element={<UserDashboardPage />} />
      <Route path="/riwayat-transaksi" element={<TransactionHistoryPage />} />
      <Route path="/invoice-check" element={<TransactionHistoryPage />} />

      {/* ADMIN ROUTES */}
      <Route path="/secret-admin-portal" element={<AdminLogin />} />
      <Route path="/secret-admin-dashboard" element={<AdminLayout />}>
        {/* 1. Dashboard */}
        <Route index element={<AdminOverviewPage />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        
        {/* 2. Layanan */}
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="regions" element={<RegionsPage />} />
        <Route path="product-categories" element={<ProductCategoriesPage />} />
        <Route path="product-types" element={<ProductTypesPage />} />
        <Route path="products" element={<ProductsPage />} />
        
        {/* 3. Pricing */}
        <Route path="pricing-rules" element={<PricingRulesPage />} />
        
        {/* 4. Transactions */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="deposits" element={<DepositsPage />} />
        
        {/* 5. Payments */}
        <Route path="payment-gateways" element={<PaymentGatewaysPage />} />
        <Route path="payment-methods" element={<PaymentMethodsPage />} />
        
        {/* 6. Users */}
        <Route path="users" element={<UsersPage />} />
        <Route path="mutations" element={<MutationsPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        
        {/* 7. Content */}
        <Route path="banners" element={<BannersPage />} />
        <Route path="flashsales" element={<FlashsalesPage />} />
        <Route path="news" element={<NewsPageAdmin />} />
        <Route path="vouchers" element={<VouchersPage />} />
        
        {/* 8. Reports */}
        <Route path="reports-sales" element={<ReportsSalesPage />} />
        <Route path="reports-transactions" element={<ReportsTransactionsPage />} />
        <Route path="reports-deposits" element={<ReportsDepositsPage />} />
        
        {/* 9. Logs */}
        <Route path="logs-activity" element={<LogsActivityPage />} />
        <Route path="logs-webhook" element={<LogsWebhookPage />} />
        <Route path="logs-error" element={<LogsErrorPage />} />
        
        {/* 10. Settings */}
        <Route path="settings-general" element={<SettingsGeneralPage />} />
        <Route path="settings-api" element={<SettingsApiPage />} />
        <Route path="settings-notifications" element={<SettingsNotificationsPage />} />
        <Route path="settings-security" element={<SettingsSecurityPage />} />
        <Route path="settings-system" element={<SettingsSystemPage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};


