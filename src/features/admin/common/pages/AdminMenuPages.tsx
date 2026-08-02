

import { ProductTypesPage as RealProductTypesPage } from '../../product/pages/ProductTypesPage';
import { RegionsPage as RealRegionsPage } from '../../region/pages/RegionsPage';
import { ProductCategoriesPage as RealProductCategoriesPage } from '../../product-category/pages/ProductCategoriesPage';
import { ProviderMappingPage as RealProviderMappingPage } from '../../provider-mapping/pages/ProviderMappingPage';
import { OrdersPage as RealOrdersPage } from '../../transaction/pages/OrdersPage';
import { DepositsPage as RealDepositsPage } from '../../deposit/pages/DepositsPage';

// 2. Layanan
export const ProductTypesPage = RealProductTypesPage;
export const RegionsPage = RealRegionsPage;
export const ProductCategoriesPage = RealProductCategoriesPage;
export const ProviderMappingPage = RealProviderMappingPage;

// 4. Transactions
export const OrdersPage = RealOrdersPage;
export const DepositsPage = RealDepositsPage;

import { PaymentGatewaysPage as RealPaymentGatewaysPage } from '../../deposit/pages/PaymentGatewaysPage';

// 5. Payments
export const PaymentGatewaysPage = RealPaymentGatewaysPage;

// 6. Users
import { ReviewsPage as RealReviewsPage } from '../../review/pages/ReviewsPage';
export const ReviewsPage = RealReviewsPage;

import { BannersPage as RealBannersPage } from '../../banner/pages/BannersPage';

// 7. Content
import { FlashsalesPage as RealFlashsalesPage } from '../../flashsale/pages/FlashsalesPage';
import { NewsPageAdmin as RealNewsPageAdmin } from '../../news/pages/NewsPageAdmin';
import { ReportsSalesPage as RealReportsSalesPage } from '../../report/pages/ReportsSalesPage';
import { ReportsTransactionsPage as RealReportsTransactionsPage } from '../../report/pages/ReportsTransactionsPage';
import { ReportsDepositsPage as RealReportsDepositsPage } from '../../report/pages/ReportsDepositsPage';

export const BannersPage = RealBannersPage;
export const FlashsalesPage = RealFlashsalesPage;
export const NewsPageAdmin = RealNewsPageAdmin;

// 8. Reports
export const ReportsSalesPage = RealReportsSalesPage;
export const ReportsTransactionsPage = RealReportsTransactionsPage;
export const ReportsDepositsPage = RealReportsDepositsPage;

// 9. Logs
import { LogsActivityPage as RealLogsActivityPage } from '../../log/pages/LogsActivityPage';
import { LogsWebhookPage as RealLogsWebhookPage } from '../../log/pages/LogsWebhookPage';
import { LogsErrorPage as RealLogsErrorPage } from '../../log/pages/LogsErrorPage';

export const LogsActivityPage = RealLogsActivityPage;
export const LogsWebhookPage = RealLogsWebhookPage;
export const LogsErrorPage = RealLogsErrorPage;

// 10. Settings
import { SettingsGeneralPage as RealSettingsGeneralPage } from '../../setting/pages/SettingsGeneralPage';
import { SettingsApiPage as RealSettingsApiPage } from '../../setting/pages/SettingsApiPage';
import { SettingsNotificationsPage as RealSettingsNotificationsPage } from '../../setting/pages/SettingsNotificationsPage';
import { SettingsSecurityPage as RealSettingsSecurityPage } from '../../setting/pages/SettingsSecurityPage';
import { SettingsSystemPage as RealSettingsSystemPage } from '../../setting/pages/SettingsSystemPage';

export const SettingsGeneralPage = RealSettingsGeneralPage;
export const SettingsApiPage = RealSettingsApiPage;
export const SettingsNotificationsPage = RealSettingsNotificationsPage;
export const SettingsSecurityPage = RealSettingsSecurityPage;
export const SettingsSystemPage = RealSettingsSystemPage;
