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
            isPathActive(['/secret-admin-dashboard/overview']) || true
          }
        >
          <SidebarItem
            to="/secret-admin-dashboard/overview"
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
            '/secret-admin-dashboard/categories',
            '/secret-admin-dashboard/brands',
            '/secret-admin-dashboard/regions',
            '/secret-admin-dashboard/product-categories',
            '/secret-admin-dashboard/products',
            '/secret-admin-dashboard/providers',
          ])}
        >
          <SidebarItem
            to="/secret-admin-dashboard/categories"
            label="Category"
          />
          <SidebarItem
            to="/secret-admin-dashboard/brands"
            label="Brand"
          />
          <SidebarItem
            to="/secret-admin-dashboard/regions"
            label="Region"
          />
          <SidebarItem
            to="/secret-admin-dashboard/product-categories"
            label="Product Category"
          />
          <SidebarItem
            to="/secret-admin-dashboard/products"
            label="Product"
          />
          <SidebarItem
            to="/secret-admin-dashboard/providers"
            label="Provider"
          />
        </SidebarGroup>

        {/* 3. Pricing */}
        <SidebarGroup
          title="Pricing"
          emoji="💰"
          color="pink"
          count={1}
          defaultOpen={isPathActive(['/secret-admin-dashboard/pricing-rules'])}
        >
          <SidebarItem
            to="/secret-admin-dashboard/pricing-rules"
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
            '/secret-admin-dashboard/orders',
            '/secret-admin-dashboard/transactions',
            '/secret-admin-dashboard/deposits',
          ])}
        >
          <SidebarItem to="/secret-admin-dashboard/orders" label="Orders" />
          <SidebarItem
            to="/secret-admin-dashboard/transactions"
            label="Transactions"
          />
          <SidebarItem
            to="/secret-admin-dashboard/deposits"
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
            '/secret-admin-dashboard/payment-gateways',
            '/secret-admin-dashboard/payment-methods',
          ])}
        >
          <SidebarItem
            to="/secret-admin-dashboard/payment-gateways"
            label="Payment Gateway"
          />
          <SidebarItem
            to="/secret-admin-dashboard/payment-methods"
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
            '/secret-admin-dashboard/users',
            '/secret-admin-dashboard/mutations',
            '/secret-admin-dashboard/reviews',
          ])}
        >
          <SidebarItem to="/secret-admin-dashboard/users" label="Users" />
          <SidebarItem
            to="/secret-admin-dashboard/mutations"
            label="Balance Mutation"
          />
          <SidebarItem
            to="/secret-admin-dashboard/reviews"
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
            '/secret-admin-dashboard/banners',
            '/secret-admin-dashboard/flashsales',
            '/secret-admin-dashboard/news',
            '/secret-admin-dashboard/vouchers',
          ])}
        >
          <SidebarItem to="/secret-admin-dashboard/banners" label="Banner" />
          <SidebarItem
            to="/secret-admin-dashboard/flashsales"
            label="Flashsale"
          />
          <SidebarItem
            to="/secret-admin-dashboard/news"
            label="News / Blog"
          />
          <SidebarItem
            to="/secret-admin-dashboard/vouchers"
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
            '/secret-admin-dashboard/reports-sales',
            '/secret-admin-dashboard/reports-transactions',
            '/secret-admin-dashboard/reports-deposits',
          ])}
        >
          <SidebarItem
            to="/secret-admin-dashboard/reports-sales"
            label="Sales"
          />
          <SidebarItem
            to="/secret-admin-dashboard/reports-transactions"
            label="Transactions"
          />
          <SidebarItem
            to="/secret-admin-dashboard/reports-deposits"
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
            '/secret-admin-dashboard/logs-activity',
            '/secret-admin-dashboard/logs-webhook',
            '/secret-admin-dashboard/logs-error',
          ])}
        >
          <SidebarItem
            to="/secret-admin-dashboard/logs-activity"
            label="Activity Log"
          />
          <SidebarItem
            to="/secret-admin-dashboard/logs-webhook"
            label="Webhook Log"
          />
          <SidebarItem
            to="/secret-admin-dashboard/logs-error"
            label="Error Log"
          />
        </SidebarGroup>

        {/* 10. Settings */}
        <SidebarGroup
          title="Settings"
          emoji="⚙️"
          color="cyan"
          count={5}
          defaultOpen={isPathActive([
            '/secret-admin-dashboard/settings-general',
            '/secret-admin-dashboard/settings-api',
            '/secret-admin-dashboard/settings-notifications',
            '/secret-admin-dashboard/settings-security',
            '/secret-admin-dashboard/settings-system',
          ])}
        >
          <SidebarItem
            to="/secret-admin-dashboard/settings-general"
            label="General"
          />
          <SidebarItem
            to="/secret-admin-dashboard/settings-api"
            label="API Integration"
          />
          <SidebarItem
            to="/secret-admin-dashboard/settings-notifications"
            label="Notifications"
          />
          <SidebarItem
            to="/secret-admin-dashboard/settings-security"
            label="Security"
          />
          <SidebarItem
            to="/secret-admin-dashboard/settings-system"
            label="System"
          />
        </SidebarGroup>
      </nav>
    </div>
  );
};


