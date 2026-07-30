import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../../../components/layout/Navbar';
import { Footer } from '../../../../components/layout/Footer';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Display } from '../../../../components/ui/Display';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Search, FileText, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const TransactionHistoryPage: React.FC = () => {
  const [invoiceId, setInvoiceId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId.trim()) return;
    navigate(`/invoice/${invoiceId.trim()}`);
  };

  const sampleTransactions = [
    {
      id: 'INV-2026-8891',
      game: 'MOBILE LEGENDS',
      item: '344 DIAMONDS + 36 BONUS',
      price: 'Rp 95.000',
      status: 'SUCCESS',
      date: '27 JULI 2026',
    },
    {
      id: 'INV-2026-9923',
      game: 'VALORANT',
      item: '1120 VALORANT POINTS',
      price: 'Rp 120.000',
      status: 'PENDING',
      date: '26 JULI 2026',
    },
    {
      id: 'INV-2026-7711',
      game: 'FREE FIRE',
      item: '720 DIAMONDS',
      price: 'Rp 70.000',
      status: 'SUCCESS',
      date: '25 JULI 2026',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-grid text-[var(--nb-text)]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title Section */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-8 h-8 stroke-[3] text-[var(--nb-text)]" />
            <Display size="md" highlight="yellow">
              CEK INVOICE &amp; RIWAYAT PESANAN
            </Display>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--nb-text-muted)] max-w-lg">
            Masukkan nomor invoice pesanan Anda untuk mengecek status transaksi real-time secara instan tanpa perlu login.
          </p>
        </div>

        {/* Invoice Check Input Box */}
        <Card
          variant="cream"
          shadow="lg"
          borderWidth="3"
          className="bg-[var(--nb-surface-alt)] p-6 sm:p-8 mb-12"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Masukkan Nomor Invoice (Contoh: INV-2026-8891)"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="bg-[var(--nb-surface)] pl-10 text-xs sm:text-sm py-3 font-bold"
              />
              <Search className="w-5 h-5 text-[var(--nb-text)] stroke-[3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <Button
              type="submit"
              variant="yellow"
              size="lg"
              className="font-black whitespace-nowrap"
            >
              <span>CEK SEKARANG</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </form>

          <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-[var(--nb-text-muted)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Semua data pesanan dijamin aman dan dienkripsi 100% oleh sistem NETSTORE.</span>
          </div>
        </Card>

        {/* Demo / Quick Test Transactions */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
              CONTOH PESANAN TERAKHIR (KLIK UNTUK CEK CEPAT)
            </h3>
            <span className="text-xs font-bold text-[var(--nb-text-muted)]">
              Demo Mode
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sampleTransactions.map((tx) => (
              <Link key={tx.id} to={`/invoice/${tx.id}`}>
                <Card
                  variant="cream"
                  shadow="sm"
                  borderWidth="3"
                  className="bg-[var(--nb-surface-alt)] hover:bg-[var(--nb-surface)] hover:-translate-y-0.5 transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--nb-yellow)] border-[2.5px] border-[var(--nb-border)] flex items-center justify-center font-black text-xs text-[#000000] shrink-0">
                      INV
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-xs sm:text-sm text-[var(--nb-text)]">
                        {tx.id} — {tx.game}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--nb-text-muted)]">
                        {tx.item} • {tx.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--nb-border)]/10">
                    <span className="font-black text-xs sm:text-sm text-[var(--nb-text)]">
                      {tx.price}
                    </span>
                    {tx.status === 'SUCCESS' ? (
                      <Badge variant="mint" size="sm" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SELESAI</span>
                      </Badge>
                    ) : (
                      <Badge variant="yellow" size="sm" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>PENDING</span>
                      </Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
