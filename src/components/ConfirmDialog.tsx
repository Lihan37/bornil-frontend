import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const danger = tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-[1100] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={() => (loading ? null : onCancel())}
      role="presentation"
    >
      <div
        className="animate-fade-scale w-full max-w-sm rounded-4xl border border-white/60 bg-white p-6 text-center shadow-lux sm:p-8"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${danger ? 'bg-red-50 text-red-500' : 'bg-blush text-roseGold'}`}>
          <AlertTriangle size={26} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">{message}</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary flex-1 disabled:opacity-60">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-14px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-ink hover:bg-roseGold'
            }`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
