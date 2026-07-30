import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminHeader } from '../components/AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../../../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top of main content when route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--nb-bg)] text-[var(--nb-text)] font-black text-2xl uppercase">
        Memuat...
      </div>
    );
  }

  // Jika bukan admin, tendang ke home
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--nb-bg)] flex flex-col font-sans">
      <AdminHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <div className="flex flex-1 overflow-hidden relative max-w-7xl mx-auto w-full">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 border-r-[3.5px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] p-4 overflow-y-auto">
          <AdminSidebar />
        </aside>

        {/* Sidebar Mobile */}
        <aside className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-[var(--nb-surface-alt)] border-r-[3.5px] border-[var(--nb-border)] transform transition-transform duration-300 ease-in-out pt-16 p-4 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <AdminSidebar />
        </aside>

        {/* Overlay Mobile */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

