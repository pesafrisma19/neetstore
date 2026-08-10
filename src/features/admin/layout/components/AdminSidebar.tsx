import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '../../../../components/ui/Badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarItemProps {
  to: string;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-2.5 py-1.5 px-2 text-xs font-black uppercase transition-all
        ${isActive
          ? 'text-[var(--nb-text)] translate-x-1.5 bg-[var(--nb-yellow)] border-2 border-black shadow-[2px_2px_0px_0px_#000]'
          : 'text-[var(--nb-text-muted)] hover:text-[var(--nb-text)] hover:translate-x-1'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <div
            className={`w-2 h-2 border-2 border-black ${
              isActive ? 'bg-black' : 'bg-transparent'
            }`}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};

interface SidebarGroupProps {
  title: string;
  emoji: string;
  color?: 'yellow' | 'pink' | 'mint' | 'cyan' | 'purple';
  children: React.ReactNode;
  defaultOpen?: boolean;
  count: number;
}

const SidebarGroup: React.FC<SidebarGroupProps> = ({
  title,
  emoji,
  color = 'yellow',
  children,
  defaultOpen = false,
  count,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-1.5 px-1 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{emoji}</span>
          <Badge
            variant={color}
            size="sm"
            className="shadow-[2px_2px_0px_0px_var(--nb-shadow)] border-2 font-black uppercase tracking-wider"
          >
            {title}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge
            variant="white"
            size="sm"
            className="shadow-[2px_2px_0px_0px_var(--nb-shadow)] border-2 font-mono px-1.5"
          >
            {count}
          </Badge>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 stroke-[3] text-black" />
          ) : (
            <ChevronRight className="w-4 h-4 stroke-[3] text-black" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 ml-3 pl-2 border-l-2 border-dashed border-black space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const isPathActive = (paths: string[]) =>
    paths.some((p) => location.pathname.startsWith(p));

  return (
    <div className="w-full h-full flex flex-col font-sans">
      {/* Brand Header */}
      <div className="hidden lg:block mb-6">
        <h2 className="font-black text-3xl tracking-tighter text-[var(--nb-text)] m-0 leading-none">
          NETSTORE
          <span className="text-[var(--nb-yellow)] drop-shadow-[2px_2px_0px_var(--nb-shadow)]">
            .
          </span>
        </h2>
        <p className="font-bold text-xs uppercase tracking-widest mt-1 text-[var(--nb-text-muted)]">
          Admin Control Center
        </p>
      </div>

      <nav className="flex flex-col overflow-y-auto pr-2 pb-16 space-y-1">
        {/* 1. Dashboard */}
        <SidebarGroup
          title="Dashboard"
          emoji="📊"
          color="yellow"
          count={1}
          defaultOpen={
            isPathActive(['/admin/overview']) || true
          }
        >
          <SidebarItem
            to="/admin/overview"
            label="Overview"
          />
        </SidebarGroup>

        {/* 2. Layanan */}
        <SidebarGroup
          title="Layanan"
          emoji="📁"
          color="mint"
          count={6}
          defaultOpen={isPathActive([
            '/admin/categories',
            '/admin/brands',
            '/admin/regions',
            '/admin/product-categories',
            '/admin/products',
            '/admin/providers',
          ])}
        >
          <SidebarItem
            to="/admin/categories"
            label="Category"
          />
          <SidebarItem
            to="/admin/brands"
            label="Brand"
          />
          <SidebarItem
            to="/admin/regions"
            label="Region"
          />
          <SidebarItem
            to="/admin/product-categories"
            label="Product Category"
          />
          <SidebarItem
            to="/admin/products"
            label="Product"
          />
          <SidebarItem
            to="/admin/providers"
            label="Provider"
          />
        </SidebarGroup>

        {/* 3. Pricing */}
        <SidebarGroup
          title="Pricing"
          emoji="💰"
          color="pink"
          count={1}
          defaultOpen={isPathActive(['/admin/pricing-rules'])}
        >
          <SidebarItem
            to="/admin/pricing-rules"
            label="Pricing Rules"
          />
        </SidebarGroup>

        {/* 4. Transactions */}
        <SidebarGroup
          title="Transactions"
          emoji="🛒"
          color="purple"
          count={3}
          defaultOpen={isPathActive([
            '/admin/orders',
            '/admin/transactions',
            '/admin/deposits',
          ])}
        >
          <SidebarItem to="/admin/orders" label="Antrean Pesanan" />
          <SidebarItem
            to="/admin/transactions"
            label="Riwayat Transaksi"
          />
          <SidebarItem
            to="/admin/deposits"
            label="Deposits"
          />
        </SidebarGroup>

        {/* 5. Payments */}
        <SidebarGroup
          title="Payments"
          emoji="💳"
          color="cyan"
          count={2}
          defaultOpen={isPathActive([
            '/admin/payment-gateways',
            '/admin/payment-methods',
          ])}
        >
          <SidebarItem
            to="/admin/payment-gateways"
            label="Payment Gateway"
          />
          <SidebarItem
            to="/admin/payment-methods"
            label="Payment Method"
          />
        </SidebarGroup>

        {/* 6. Users */}
        <SidebarGroup
          title="Users"
          emoji="👥"
          color="yellow"
          count={3}
          defaultOpen={isPathActive([
            '/admin/users',
            '/admin/mutations',
            '/admin/reviews',
          ])}
        >
          <SidebarItem to="/admin/users" label="Users" />
          <SidebarItem
            to="/admin/mutations"
            label="Balance Mutation"
          />
          <SidebarItem
            to="/admin/reviews"
            label="Reviews"
          />
        </SidebarGroup>

        {/* 7. Content */}
        <SidebarGroup
          title="Content"
          emoji="📢"
          color="pink"
          count={4}
          defaultOpen={isPathActive([
            '/admin/banners',
            '/admin/flashsales',
            '/admin/news',
            '/admin/vouchers',
          ])}
        >
          <SidebarItem to="/admin/banners" label="Banner" />
          <SidebarItem
            to="/admin/flashsales"
            label="Flashsale"
          />
          <SidebarItem
            to="/admin/news"
            label="News / Blog"
          />
          <SidebarItem
            to="/admin/vouchers"
            label="Voucher"
          />
        </SidebarGroup>

        {/* 8. Reports */}
        <SidebarGroup
          title="Reports"
          emoji="📈"
          color="mint"
          count={3}
          defaultOpen={isPathActive([
            '/admin/reports-sales',
            '/admin/reports-transactions',
            '/admin/reports-deposits',
          ])}
        >
          <SidebarItem
            to="/admin/reports-sales"
            label="Sales"
          />
          <SidebarItem
            to="/admin/reports-transactions"
            label="Laporan Transaksi"
          />
          <SidebarItem
            to="/admin/reports-deposits"
            label="Deposits"
          />
        </SidebarGroup>

        {/* 9. Logs */}
        <SidebarGroup
          title="Logs"
          emoji="📋"
          color="purple"
          count={3}
          defaultOpen={isPathActive([
            '/admin/logs-activity',
            '/admin/logs-webhook',
            '/admin/logs-error',
          ])}
        >
          <SidebarItem
            to="/admin/logs-activity"
            label="Activity Log"
          />
          <SidebarItem
            to="/admin/logs-webhook"
            label="Webhook Log"
          />
          <SidebarItem
            to="/admin/logs-error"
            label="Error Log"
          />
        </SidebarGroup>

        {/* 10. Settings */}
        <SidebarGroup
          title="Settings"
          emoji="⚙️"
          color="cyan"
          count={4}
          defaultOpen={isPathActive([
            '/admin/settings-general',
            '/admin/settings-api',
            '/admin/settings-notifications',
            '/admin/settings-system',
          ])}
        >
          <SidebarItem
            to="/admin/settings-general"
            label="General"
          />
          <SidebarItem
            to="/admin/settings-api"
            label="API Integration"
          />
          <SidebarItem
            to="/admin/settings-notifications"
            label="Notifications"
          />
          <SidebarItem
            to="/admin/settings-system"
            label="System"
          />
        </SidebarGroup>
      </nav>
    </div>
  );
};


