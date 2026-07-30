import React from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Avatar } from '../../../../components/ui/Avatar';
import { Badge } from '../../../../components/ui/Badge';

interface AdminHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-20 w-full bg-[var(--nb-surface-alt)] border-b-[3.5px] border-[var(--nb-border)] shadow-[0_4px_0_0_var(--nb-shadow)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-left">
      
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 bg-[var(--nb-yellow)] border-[2.5px] border-[var(--nb-border)] shadow-[2.5px_2.5px_0px_0px_#000]"
          aria-label="Toggle Sidebar"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 stroke-[3] text-[var(--nb-text)] hidden sm:block" />
          <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-[var(--nb-text)] m-0">
            SYSTEM CONTROL CENTER
          </h2>
          <Badge variant="mint" size="sm" className="hidden sm:inline-flex">LIVE</Badge>
        </div>
      </div>

      {/* Right: Supplier Balance, Sync CTA, & Admin Avatar */}
      <div className="flex items-center gap-3">
        


        {/* Admin Profile Avatar */}
        <div className="flex items-center gap-2 border-[2.5px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1 shadow-[2.5px_2.5px_0px_0px_#000]">
          <Avatar fallback="AD" size="sm" variant="pink" />
          <span className="text-xs font-black uppercase pr-1 text-[var(--nb-text)] hidden sm:inline">ADMIN MASTER</span>
        </div>

      </div>

    </header>
  );
};

