import { useState } from 'react';
import Toast from './Toast';
import { dismissCorruptionNotice, isCorruptionPending } from '../store/useAppStore';

// Shows a one-time notice when the persisted demo data was corrupted and the
// app fell back to seed data. Mount in every shell.
export default function StorageGuard() {
  const [show, setShow] = useState(() => isCorruptionPending());

  if (!show) return null;
  const onClose = () => {
    dismissCorruptionNotice();
    setShow(false);
  };
  return <Toast message="Saved demo data was damaged, so the demo has been reset." onClose={onClose} />;
}
