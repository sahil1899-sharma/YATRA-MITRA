import { X } from 'lucide-react';

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-card border border-white/15 bg-night-soft/95 px-4 py-3 text-sm font-medium text-cream shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-white/10"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
