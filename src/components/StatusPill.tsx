const statusStyles: Record<string, string> = {
  booked: 'border-amber/50 bg-amber/15 text-amber',
  driver_assigned: 'border-amber/50 bg-amber/15 text-amber',
  accepted: 'border-saffron/50 bg-saffron/15 text-saffron',
  in_progress: 'border-maroon/40 bg-maroon/15 text-rose-300',
  completed: 'border-verified/40 bg-verified/15 text-emerald-300',
  aborted: 'border-alert/40 bg-alert/15 text-red-300',
  open: 'border-alert/40 bg-alert/15 text-red-300',
  escalated: 'border-alert/60 bg-alert/20 text-red-300',
  resolved: 'border-verified/40 bg-verified/15 text-emerald-300',
};

const statusLabels: Record<string, string> = {
  booked: 'Booked',
  driver_assigned: 'Driver assigned',
  accepted: 'Accepted',
  in_progress: 'In progress',
  completed: 'Completed',
  aborted: 'Aborted',
  open: 'Open',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

export default function StatusPill({ status }: { status: string }) {
  const style = statusStyles[status] ?? 'border-white/15 bg-white/10 text-cream/70';
  const label = statusLabels[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}
