import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Dialog } from '../../../../components/ui/Dialog';
import { 
  Plus, 
  Trash2, 
  Power, 
  Image as ImageIcon, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { 
  getAdminBanners, 
  createAdminBanner, 
  updateAdminBanner, 
  deleteAdminBanner 
} from '../../../../utils/api';
import { useToast } from '../../../../components/ui/ToastContext';

export interface BannerItem {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
}

export const BannersPage: React.FC = () => {
  const { addToast } = useToast();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchBanners = async () => {
    try {
      const data = await getAdminBanners();
      setBanners(data || []);
    } catch (err: any) {
      addToast({
        title: 'GAGAL MEMUAT BANNER',
        message: err.message || 'Gagal mengambil data banner dari server.',
        type: 'error',
      });
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await updateAdminBanner(id, { isActive: !currentStatus });
      addToast({
        title: 'STATUS BANNER DIUBAH',
        message: `Banner sekarang ${!currentStatus ? 'AKTIF (Tayang)' : 'NON-AKTIF'}.`,
        type: 'success',
      });
      fetchBanners();
    } catch (err: any) {
      addToast({
        title: 'GAGAL MENGUBAH STATUS',
        message: err.message || 'Terjadi kesalahan saat mengubah status banner.',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus banner ini secara permanen?')) return;
    try {
      await deleteAdminBanner(id);
      addToast({
        title: 'BANNER DIHAPUS 🗑️',
        message: 'Banner promo berhasil dihapus dari sistem.',
        type: 'success',
      });
      fetchBanners();
    } catch (err: any) {
      addToast({
        title: 'GAGAL MENGHAPUS',
        message: err.message || 'Gagal menghapus banner.',
        type: 'error',
      });
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      addToast({
        title: 'FORM BELUM LENGKAP',
        message: 'Judul dan URL gambar wajib diisi.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdminBanner({ title, imageUrl, linkUrl, isActive: true });
      addToast({
        title: 'BANNER DITAMBAHKAN! 🎉',
        message: 'Banner promo baru berhasil tayang di beranda.',
        type: 'success',
      });
      setModalOpen(false);
      setTitle('');
      setImageUrl('');
      setLinkUrl('');
      fetchBanners();
    } catch (err: any) {
      addToast({
        title: 'GAGAL MENAMBAHKAN',
        message: err.message || 'Gagal menyimpan banner baru.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-left font-sans pb-12">
      {/* 1. HEADER JUDUL & TOMBOL TAMBAH */}
      <div className="bg-[var(--nb-yellow)] border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="cyan" size="sm" className="border-2 font-black uppercase">
              CONTENT MANAGEMENT
            </Badge>
            <Badge variant="white" size="sm" className="border-2 font-mono">
              TOTAL: {banners.length} BANNER
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>📢</span>
            <span>PROMO BANNERS</span>
          </h1>
          <p className="text-sm font-bold text-black/80 mt-1">
            Kelola gambar slider promo yang bergeser (carousel) di halaman utama pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            onClick={fetchBanners}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <RefreshCw className="w-4 h-4 stroke-[3]" />
            <span>REFRESH</span>
          </Button>
          <Button
            variant="purple"
            size="md"
            onClick={() => setModalOpen(true)}
            className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ TAMBAH BANNER</span>
          </Button>
        </div>
      </div>

      {/* 2. GRID DAFTAR BANNER */}
      {banners.length === 0 ? (
        <Card variant="white" className="p-8 text-center border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <ImageIcon className="w-12 h-12 stroke-[2] mx-auto mb-3 text-neutral-400" />
          <h3 className="text-lg font-black uppercase">BELUM ADA BANNER PROMO</h3>
          <p className="text-xs font-bold text-neutral-500 mt-1">
            Klik tombol &ldquo;+ TAMBAH BANNER&rdquo; untuk membuat banner pertama Anda.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <Card
              key={banner.id}
              variant="white"
              className={`border-[4px] border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden transition-all ${
                !banner.isActive ? 'opacity-60 bg-neutral-100' : ''
              }`}
            >
              {/* Image Preview */}
              <div className="relative w-full h-44 bg-neutral-900 border-b-[4px] border-black overflow-hidden flex items-center justify-center">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Badge
                    variant={banner.isActive ? 'mint' : 'pink'}
                    size="sm"
                    className="border-2 font-black uppercase shadow-[2px_2px_0px_0px_#000]"
                  >
                    {banner.isActive ? 'AKTIF 🟢' : 'NON-AKTIF 🔴'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-black leading-tight">
                    {banner.title}
                  </h3>
                  {banner.linkUrl ? (
                    <a
                      href={banner.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                      <span>{banner.linkUrl}</span>
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-neutral-400 block mt-1">
                      Tidak ada tautan (link)
                    </span>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t-[2px] border-black">
                  <Button
                    variant={banner.isActive ? 'pink' : 'mint'}
                    size="sm"
                    onClick={() => handleToggleActive(banner.id, banner.isActive)}
                    className="font-black uppercase text-xs"
                  >
                    <Power className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{banner.isActive ? 'NONAKTIFKAN' : 'AKTIFKAN'}</span>
                  </Button>

                  <Button
                    variant="white"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                    className="font-black uppercase text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[3]" />
                    <span>HAPUS</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 3. MODAL TAMBAH BANNER */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="TAMBAH BANNER PROMO BARU"
        className="max-w-lg"
      >
        <form onSubmit={handleCreateBanner} className="space-y-4 text-left">
          <Input
            label="Judul Banner / Promo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Diskon Topup MLBB 20%"
            required
          />

          <Input
            label="URL Gambar Banner (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/banner-promo.jpg"
            required
          />

          <Input
            label="URL Tujuan (Opsional)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com/promo/mlbb"
          />

          {imageUrl && (
            <div className="p-3 bg-neutral-100 border-[2px] border-black">
              <span className="text-xs font-black uppercase text-neutral-500 block mb-2">
                Preview Gambar:
              </span>
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-32 object-cover border-[2px] border-black"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t-[3px] border-black">
            <Button
              type="button"
              variant="white"
              size="md"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              BATAL
            </Button>
            <Button
              type="submit"
              variant="yellow"
              size="md"
              disabled={isSubmitting}
              className="font-black uppercase shadow-[4px_4px_0px_0px_#000]"
            >
              <span>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN BANNER 🚀'}</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
