import React from 'react';
import { StatusDot } from '../ui/StatusDot';
import { Shield, Zap, CreditCard, Headphones, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const paymentMethods = [
    { name: 'QRIS', color: 'bg-[var(--nb-yellow)]' },
    { name: 'DANA', color: 'bg-[var(--nb-cyan)]' },
    { name: 'GOPAY', color: 'bg-[var(--nb-mint)]' },
    { name: 'OVO', color: 'bg-[var(--nb-purple)]' },
    { name: 'SHOPEEPAY', color: 'bg-[var(--nb-pink)] text-white' },
    { name: 'BANK VA', color: 'bg-[var(--nb-surface)]' },
  ];

  return (
    <footer className="w-full bg-black text-white border-t-[4px] border-[var(--nb-border)] mt-20 text-left">
      
      {/* Top Feature Bar */}
      <div className="bg-[var(--nb-yellow)] text-[var(--nb-text)] border-b-[3px] border-[var(--nb-border)] py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 border-[2px] border-[var(--nb-border)] p-3 bg-[var(--nb-surface)] shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            <Zap className="w-6 h-6 stroke-[3] text-[var(--nb-text)]" />
            <div>
              <h4 className="font-black uppercase text-xs">PROSES OTOMATIS 24/7</h4>
              <p className="text-[10px] font-bold text-[var(--nb-text-muted)]">Top-up instan detik itu juga</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 border-[2px] border-[var(--nb-border)] p-3 bg-[var(--nb-surface)] shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            <Shield className="w-6 h-6 stroke-[3] text-[var(--nb-text)]" />
            <div>
              <h4 className="font-black uppercase text-xs">100% AMAN & LEGAL</h4>
              <p className="text-[10px] font-bold text-[var(--nb-text-muted)]">Direct distributor resmi</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 border-[2px] border-[var(--nb-border)] p-3 bg-[var(--nb-surface)] shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            <CreditCard className="w-6 h-6 stroke-[3] text-[var(--nb-text)]" />
            <div>
              <h4 className="font-black uppercase text-xs">METODE LENGKAP</h4>
              <p className="text-[10px] font-bold text-[var(--nb-text-muted)]">QRIS, E-Wallet & Bank VA</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 border-[2px] border-[var(--nb-border)] p-3 bg-[var(--nb-surface)] shadow-[3px_3px_0px_0px_var(--nb-shadow)]">
            <Headphones className="w-6 h-6 stroke-[3] text-[var(--nb-text)]" />
            <div>
              <h4 className="font-black uppercase text-xs">CS SIAP BANTU</h4>
              <p className="text-[10px] font-bold text-[var(--nb-text-muted)]">Support WhatsApp 24 jam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--nb-yellow)] text-[var(--nb-text)] border-[3px] border-white shadow-[3px_3px_0px_0px_#fff] flex items-center justify-center font-black text-lg">
                N/S
              </div>
              <span className="font-black text-2xl tracking-tight uppercase">NETSTORE</span>
            </div>
            <p className="text-xs font-semibold text-gray-300 leading-relaxed">
              Platform Top-Up Game & Voucher Game paling murah, aman, dan instan di Indonesia. Didukung oleh Digiflazz API.
            </p>
            <div className="p-3 bg-gray-900 border-[2px] border-gray-700 inline-block">
              <StatusDot status="success" label="SISTEM OPERASIONAL 100%" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#FFDC00]">MENU UTAMA</h4>
            <ul className="flex flex-col gap-2 text-xs font-bold text-gray-300">
              <li className="hover:text-white hover:underline cursor-pointer">Top-Up Mobile Legends</li>
              <li className="hover:text-white hover:underline cursor-pointer">Top-Up Free Fire</li>
              <li className="hover:text-white hover:underline cursor-pointer">Top-Up Valorant Points</li>
              <li className="hover:text-white hover:underline cursor-pointer">Genshin Impact Genesis</li>
              <li className="hover:text-white hover:underline cursor-pointer">Cek Invoice Otomatis</li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#FF4D79]">DUKUNGAN</h4>
            <ul className="flex flex-col gap-2 text-xs font-bold text-gray-300">
              <li className="hover:text-white hover:underline cursor-pointer">Pusat Bantuan / FAQ</li>
              <li className="hover:text-white hover:underline cursor-pointer">Syarat & Ketentuan</li>
              <li className="hover:text-white hover:underline cursor-pointer">Kebijakan Privasi</li>
              <li className="hover:text-white hover:underline cursor-pointer">Hubungi Customer Service</li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col gap-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#6EE7B7]">METODE PEMBAYARAN</h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((pm) => (
                <span
                  key={pm.name}
                  className={`text-[10px] font-black uppercase px-2.5 py-1 border-[2px] border-white shadow-[2px_2px_0px_0px_#fff] text-[var(--nb-text)] ${pm.color}`}
                >
                  {pm.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-gray-400 gap-4">
          <p>© 2026 NETSTORE VITE. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-1">
            <span>BUILT WITH</span>
            <Heart className="w-3.5 h-3.5 fill-[#FF4D79] text-[#FF4D79]" />
            <span>IN VITE + REACT & NEON BRUTALISM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
