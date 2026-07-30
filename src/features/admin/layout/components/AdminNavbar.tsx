import React from 'react';
import { StatusDot } from '../../../../components/ui/StatusDot';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { LogOut } from 'lucide-react';

interface AdminNavbarProps {
  onLogout: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#181820] text-white border-b-[4px] border-[var(--nb-border)] shadow-[0_4px_0_0_var(--nb-shadow)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--nb-yellow)] text-[var(--nb-text)] border-[3px] border-[var(--nb-border)] shadow-[3px_3px_0px_0px_#fff] flex items-center justify-center font-black text-lg">
              ADM
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter uppercase leading-none text-white">
                NETSTORE CONTROL PANEL
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusDot status="success" />
                <span className="text-[10px] font-black uppercase text-[#6EE7B7] tracking-wider">
                  MODULAR ARCHITECTURE READY
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="yellow" size="sm" className="hidden sm:inline-flex">
              SUPER ADMIN
            </Badge>
            <Button variant="pink" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">LOGOUT</span>
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
};

