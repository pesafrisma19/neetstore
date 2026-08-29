import React from 'react';
import { SITE_LINKS } from '../../../../config/siteLinks';
import { MessageCircle, Play } from 'lucide-react';

export const HomeInfoBar: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 py-1">
      {/* 1. Tombol Grup WhatsApp */}
      <a
        href={SITE_LINKS.whatsappGroup}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--nb-mint)] border-[2px] border-black shadow-[2px_2px_0px_0px_#000] text-black font-black text-[11px] sm:text-xs uppercase transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        title="Gabung Grup Komunitas WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>GRUP WHATSAPP</span>
      </a>

      {/* 2. Tombol Web Nonton */}
      <a
        href={SITE_LINKS.neetflixStreaming}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--nb-yellow)] border-[2px] border-black shadow-[2px_2px_0px_0px_#000] text-black font-black text-[11px] sm:text-xs uppercase transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        title="Kunjungi Website Nonton Streaming"
      >
        <Play className="w-3.5 h-3.5 fill-black stroke-[2.5]" />
        <span>WEB NONTON</span>
      </a>
    </div>
  );
};
