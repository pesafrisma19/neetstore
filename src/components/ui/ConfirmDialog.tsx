import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'pink' | 'danger' | 'yellow' | 'cyan' | 'mint' | 'warning';
  isLoading?: boolean;
  icon?: 'trash' | 'warning' | 'none';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  description = 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'HAPUS',
  cancelLabel = 'BATAL',
  confirmVariant = 'pink',
  isLoading = false,
  icon = 'trash',
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={title}>
      <div className="flex flex-col gap-4 text-left">
        <div className="flex items-start gap-3.5">
          {icon === 'trash' && (
            <div className="p-2.5 bg-[var(--nb-pink)] text-[var(--nb-text-on-accent)] border-[2px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] shrink-0">
              <Trash2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          {icon === 'warning' && (
            <div className="p-2.5 bg-[var(--nb-yellow)] text-[var(--nb-text-on-accent)] border-[2px] border-[var(--nb-border)] shadow-[2px_2px_0px_0px_var(--nb-shadow)] shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
          )}
          <div className="flex-1 text-sm font-bold text-[var(--nb-text)] leading-relaxed">
            {typeof description === 'string' ? (
              <p className="m-0 text-sm font-bold text-[var(--nb-text)]">{description}</p>
            ) : (
              description
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t-[2px] border-[var(--nb-border)] mt-2">
          <Button
            type="button"
            variant="white"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
