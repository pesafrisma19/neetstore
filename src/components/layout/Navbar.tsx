import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Menu, X, LogOut, Settings, CreditCard, Sun, Moon,
  Search, Gamepad2, Tag, Newspaper, FileText, ChevronRight
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { SearchBar } from '../form/SearchBar';

import { usePublicSettings } from '../../hooks/usePublicSettings';

export const Navbar: React.FC = () => {
  const { user, logoutUser, isLoading } = useAuth();
  const { settings } = usePublicSettings();
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // State navigasi & pencarian
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // 1. Generate Random Neon Themes (Dipanggil secara tidak bersyarat / konsisten)
  const { navShadowTone, logoBgTone, activeNavTone, mobileBtnTone } = React.useMemo(() => {
    const tones = ['yellow', 'pink', 'mint', 'purple', 'cyan'] as const;
    const shuffled = [...tones].sort(() => Math.random() - 0.5);
    return {
      navShadowTone: shuffled[0],
      logoBgTone: shuffled[1],
      activeNavTone: shuffled[2],
      mobileBtnTone: shuffled[3],
    };
  }, []);

  // Daftar menu navigasi resmi (sesuai arahan: Daftar Harga, Riwayat Transaksi, News)
  const navLinks = [
    { name: 'HOME', path: '/', icon: <Gamepad2 className="w-4 h-4" /> },
    { name: 'DAFTAR HARGA', path: '/daftar-harga', icon: <Tag className="w-4 h-4" /> },
    { name: 'RIWAYAT TRANSAKSI', path: '/riwayat-transaksi', icon: <FileText className="w-4 h-4" /> },
    { name: 'NEWS', path: '/news', icon: <Newspaper className="w-4 h-4" /> },
  ];

  // Menu Dropdown Profile
  const userMenuItems = [
    { label: 'DASHBOARD', icon: <User className="w-4 h-4" />, onClick: () => navigate('/dashboard') },
    { label: 'DEPOSIT SALDO', icon: <CreditCard className="w-4 h-4" />, onClick: () => navigate('/dashboard') },
    { label: 'PENGATURAN', icon: <Settings className="w-4 h-4" />, onClick: () => navigate('/dashboard') },
    {
      label: 'LOGOUT',
      icon: <LogOut className="w-4 h-4 text-red-600" />,
      tone: 'danger' as const,
      onClick: () => {
        logoutUser();
        navigate('/');
      }
    },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full bg-[var(--nb-surface-alt)] border-b-[3px] border-[var(--nb-border)]"
      style={{ boxShadow: `0 4px 0 0 var(--nb-shadow-${navShadowTone})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">

          {/* ----------------------------------------------------
              KIRI: LOGO & TOMBOL SIDEBAR (MOBILE) / LOGO (PC)
             ---------------------------------------------------- */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tombol Sidebar Kiri di Mobile */}
            <div className="flex items-center md:hidden">
              <IconButton
                variant={mobileBtnTone}
                size="sm"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Buka Menu Sidebar"
              >
                <Menu className="w-5 h-5 stroke-[3]" />
              </IconButton>
            </div>

            {/* Logo & Nama Web */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              {settings.logo_url && !logoError ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_name || 'Logo'}
                  onError={() => setLogoError(true)}
                  className="w-10 h-10 sm:w-11 sm:h-11 border-[3px] border-[var(--nb-border)] object-contain bg-[var(--nb-surface)] p-1 shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 border-[3px] border-[var(--nb-border)] flex items-center justify-center font-black text-lg sm:text-xl text-[#000000] transform group-hover:-rotate-6 transition-transform shrink-0"
                  style={{
                    backgroundColor: `var(--nb-${logoBgTone})`,
                    boxShadow: `3px 3px 0px 0px var(--nb-shadow-${logoBgTone})`,
                  }}
                >
                  {(settings.site_name || 'N/S').slice(0, 3).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter text-[var(--nb-text)] uppercase leading-none">
                  {settings.site_name || 'NETSTORE'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-[var(--nb-pink)] tracking-widest leading-none mt-0.5">
                  {settings.site_tagline || 'GAME TOP-UP'}
                </span>
              </div>
            </Link>
          </div>

          {/* ----------------------------------------------------
              TENGAH: MENU HORIZONTAL (DESKTOP md:flex)
             ---------------------------------------------------- */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path}>
                  <div
                    className={`px-3 lg:px-4 py-2 text-xs font-black uppercase tracking-wider border-[2px] transition-all flex items-center gap-1.5 ${isActive
                        ? 'border-[var(--nb-border)] -translate-y-[2px] text-[#000000]'
                        : 'border-transparent text-[var(--nb-text)] hover:border-[var(--nb-border)]/40 hover:bg-[var(--nb-surface)]/50'
                      }`}
                    style={
                      isActive
                        ? {
                          backgroundColor: `var(--nb-${activeNavTone})`,
                          boxShadow: `3px 3px 0px 0px var(--nb-shadow-${activeNavTone})`,
                        }
                        : {}
                    }
                  >
                    {link.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* ----------------------------------------------------
              KANAN: SEARCH BAR (PC) / SEARCH IKON (MOBILE) + USER / TEMA
             ---------------------------------------------------- */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Bar (Tampil dari layar md ke atas) */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Tombol Search Icon di Mobile (Hanya di layar kecil < md) */}
            <div className="flex items-center md:hidden">
              <IconButton
                variant="yellow"
                size="sm"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                aria-label="Cari Game"
              >
                <Search className="w-4 h-4 stroke-[3]" />
              </IconButton>
            </div>

            {/* Theme Toggle (PC - di md ke atas) */}
            <div className="hidden md:flex items-center">
              <IconButton
                variant={isDark ? 'yellow' : 'dark'}
                size="sm"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-4 h-4 stroke-[3]" /> : <Moon className="w-4 h-4 stroke-[3]" />}
              </IconButton>
            </div>

            {/* Profile Avatar / Login Button */}
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-[2px] border-[var(--nb-border)]">
                <span className="text-xs font-black">Loading...</span>
              </div>
            ) : user ? (
              <Dropdown
                trigger={
                  <div className="flex items-center justify-center border-[2.5px] border-[var(--nb-border)] bg-[var(--nb-surface)] p-1 shadow-[2px_2px_0px_0px_var(--nb-shadow)] hover:bg-[var(--nb-yellow)] transition-colors cursor-pointer">
                    <Avatar fallback={user.username.substring(0, 2).toUpperCase()} size="sm" variant="pink" />
                  </div>
                }
                items={userMenuItems}
              />
            ) : (
              <>
                {/* Desktop: tombol Masuk & Daftar */}
                <div className="hidden md:flex gap-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">MASUK</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="yellow" size="sm">DAFTAR</Button>
                  </Link>
                </div>
                {/* Mobile: icon User → link ke /login */}
                <Link
                  to="/login"
                  aria-label="Masuk ke akun"
                  className="flex items-center md:hidden w-8 h-8 items-center justify-center border-[3px] border-[var(--nb-border)] bg-[var(--nb-mint)] text-[var(--nb-text-on-accent)] hover:bg-[var(--nb-mint-hover)] transition-all"
                  style={{ boxShadow: '2px 2px 0px 0px var(--nb-shadow-mint)' }}
                >
                  <User className="w-4 h-4 stroke-[3]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          MOBILE SEARCH OVERLAY (Muncul dari Atas Saat Klik Ikon 🔍)
         ---------------------------------------------------- */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t-[3px] border-[var(--nb-border)] bg-[var(--nb-surface-alt)] p-4 flex flex-col gap-3 animate-in slide-in-from-top duration-200 z-[100]">
          <SearchBar isMobile onCloseMobile={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* ----------------------------------------------------
          MOBILE SIDEBAR DRAWER (Muncul dari Kiri saat Klik ≡)
         ---------------------------------------------------- */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* Backdrop gelap untuk menutup sidebar saat diklik */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Content di Sisi Kiri */}
          <div className="relative w-80 max-w-[85vw] h-full bg-[var(--nb-surface-alt)] border-r-[4px] border-[var(--nb-border)] flex flex-col justify-between p-5 z-10 shadow-[10px_0px_0px_0px_var(--nb-shadow)] overflow-y-auto">
            {/* Bagian Atas Drawer: Logo & Tombol Close */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b-[3px] border-[var(--nb-border)] pb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 border-[2.5px] border-[var(--nb-border)] flex items-center justify-center font-black text-sm text-[#000000]"
                    style={{ backgroundColor: `var(--nb-${logoBgTone})` }}
                  >
                    N/S
                  </div>
                  <span className="font-black text-lg tracking-tighter text-[var(--nb-text)] uppercase">
                    NETSTORE
                  </span>
                </div>
                <IconButton
                  variant="pink"
                  size="sm"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </IconButton>
              </div>

              {/* Menu Navigasi di Sidebar Kiri */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <div
                        className={`p-3 border-[2.5px] font-black uppercase tracking-wider text-xs flex items-center justify-between transition-all ${isActive
                            ? 'border-[var(--nb-border)] text-[#000000] translate-x-1'
                            : 'border-[var(--nb-border)]/40 text-[var(--nb-text)] bg-[var(--nb-surface)] hover:border-[var(--nb-border)]'
                          }`}
                        style={
                          isActive
                            ? {
                              backgroundColor: `var(--nb-${activeNavTone})`,
                              boxShadow: `3px 3px 0px 0px var(--nb-shadow-${activeNavTone})`,
                            }
                            : {}
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          {link.icon}
                          <span>{link.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bagian Bawah Drawer: Tombol Masuk/Daftar (jika belum login) + Theme Toggle & Info Copyright */}
            <div className="flex flex-col gap-3 pt-4 border-t-[3px] border-[var(--nb-border)]/30">
              {!user && (
                // Belum login → tampilkan tombol Masuk & Daftar
                <div className="flex gap-2">
                  <Link to="/login" className="flex-1" onClick={() => setMobileSidebarOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">MASUK</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileSidebarOpen(false)}>
                    <Button variant="yellow" size="sm" className="w-full">DAFTAR</Button>
                  </Link>
                </div>
              )}

              <Button
                variant={isDark ? 'yellow' : 'dark'}
                size="sm"
                fullWidth
                onClick={() => {
                  toggleTheme();
                }}
                className="flex items-center justify-center gap-2 font-black text-xs py-2.5"
              >
                {isDark ? <Sun className="w-4 h-4 stroke-[3]" /> : <Moon className="w-4 h-4 stroke-[3]" />}
                {isDark ? 'MODE TERANG (LIGHT)' : 'MODE GELAP (DARK)'}
              </Button>

              <div className="text-[10px] font-black text-center text-[var(--nb-text-muted)] uppercase">
                &copy; 2026 NETSTORE GAME TOP-UP
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
