import { useState } from 'react';
import { Copy } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

// Shared "Share live trip" dialog (receipt + ride screens).
export default function ShareTripModal({
  open,
  onClose,
  token,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/share/${token}`;

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share live trip">
      <p className="break-all rounded-card border border-white/10 bg-night-soft px-3 py-2.5 text-sm text-cream/85">
        {shareUrl}
      </p>
      <p className="mt-2 text-xs text-cream/55">Anyone with this link can follow your ride.</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={doCopy}>
          <Copy size={16} aria-hidden="true" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Modal>
  );
}
