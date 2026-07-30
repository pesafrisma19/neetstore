import React from 'react';
import { Badge } from '../../../../components/ui/Badge';
import { Database, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface AdminFeaturePlaceholderPageProps {
  title: string;
  group: string;
  modelName: string;
  description: string;
  emoji: string;
  columns: string[];
}

export const AdminFeaturePlaceholderPage: React.FC<AdminFeaturePlaceholderPageProps> = ({
  title,
  group,
  modelName,
  description,
  emoji,
  columns,
}) => {
  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="yellow" size="sm" className="border-2 font-black uppercase">
              {group}
            </Badge>
            <Badge variant="cyan" size="sm" className="border-2 font-mono">
              Prisma Model: {modelName}
            </Badge>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--nb-text)] flex items-center gap-2">
            <span>{emoji}</span>
            <span>{title}</span>
          </h1>
          <p className="text-sm font-bold text-[var(--nb-text-muted)] mt-1">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-[var(--nb-yellow)] border-[3px] border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_var(--nb-shadow)] hover:translate-x-1 hover:translate-y-1 transition-all">
            + Tambah {title}
          </button>
        </div>
      </div>

      {/* Database Schema Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--nb-mint)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_var(--nb-shadow)]">
          <div className="flex items-center gap-2 font-black uppercase text-sm mb-1">
            <Database className="w-5 h-5" />
            <span>Database Connection</span>
          </div>
          <p className="text-xs font-bold mt-1 opacity-90">
            Tabel <code className="bg-black text-white px-1 py-0.5 rounded font-mono">{modelName}</code> sudah dikonfigurasi pada <code className="font-mono">schema.prisma</code>.
          </p>
        </div>

        <div className="bg-[var(--nb-pink)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_var(--nb-shadow)]">
          <div className="flex items-center gap-2 font-black uppercase text-sm mb-1">
            <ShieldAlert className="w-5 h-5" />
            <span>Security & Role</span>
          </div>
          <p className="text-xs font-bold mt-1 opacity-90">
            Dibatasi untuk role <code className="bg-black text-white px-1 py-0.5 rounded font-mono">ADMIN</code> dengan proteksi JWT Auth & Allowed IP.
          </p>
        </div>

        <div className="bg-[var(--nb-cyan)] border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_var(--nb-shadow)]">
          <div className="flex items-center gap-2 font-black uppercase text-sm mb-1">
            <Cpu className="w-5 h-5" />
            <span>Real-time Sync</span>
          </div>
          <p className="text-xs font-bold mt-1 opacity-90">
            Siap diintegrasikan dengan API Fetch & Cron Job otomatis.
          </p>
        </div>
      </div>

      {/* Empty State Table / Schema Preview */}
      <div className="bg-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_var(--nb-shadow)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2 font-black uppercase text-sm">
            <Layers className="w-5 h-5 text-[var(--nb-text)]" />
            <span>Struktur Kolom Database ({modelName})</span>
          </div>
          <Badge variant="white" size="sm" className="border-2 font-mono">
            {columns.length} Fields Defined
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100">
                <th className="py-2.5 px-3 text-xs font-black uppercase">Field Name</th>
                <th className="py-2.5 px-3 text-xs font-black uppercase">Type</th>
                <th className="py-2.5 px-3 text-xs font-black uppercase">Role in System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-xs font-bold">
              {columns.map((col, index) => {
                const [name, type, role] = col.split('|');
                return (
                  <tr key={index} className="hover:bg-neutral-50">
                    <td className="py-2.5 px-3 font-mono text-[var(--nb-purple)]">{name}</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">{type}</td>
                    <td className="py-2.5 px-3 text-neutral-800">{role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
