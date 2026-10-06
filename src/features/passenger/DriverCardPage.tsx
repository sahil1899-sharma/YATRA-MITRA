import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, BadgeCheck, ShieldX } from 'lucide-react';
import { GUARANTEE_CARD_TEXT } from '../../data/constants';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const TRUST_STACK = [
  'Police-verified',
  'Trained in history, hospitality and first aid',
  'Fixed fares',
  'Digital receipt',
  'Live trip-sharing',
  'SOS',
  'Complaint line connected to RTO grievance channels',
];

export default function DriverCardPage() {
  const { mitraId } = useParams();
  const driver = useAppStore((s) => s.drivers.find((d) => d.mitraId === mitraId));

  if (!driver) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-lg font-bold text-cream">No such Mitra ID</h1>
          <p className="mt-2 text-sm text-cream/65">
            We could not find a driver with that Mitra ID.
          </p>
          <Link to="/p" className="mt-4 inline-block">
            <Button>Browse circuits</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const verified = driver.verificationStatus === 'badged';
  const verifyUrl = `${window.location.origin}/verify/${driver.mitraId}`;

  return (
    <div className="px-4 py-6 md:px-2">
      <Link
        to="/p"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-cream/60 hover:text-saffron"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to circuits
      </Link>

      <Card className="mt-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] font-display text-xl font-bold text-ink shadow-glow"
          >
            {driver.initials}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold text-cream">{driver.name}</h1>
            <p className="mt-0.5 text-sm text-cream/55">Mitra ID {driver.mitraId}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-verified/50 bg-verified/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Verified Mitra
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-alert/50 bg-alert/15 px-2.5 py-1 text-xs font-bold text-red-300">
                  <ShieldX size={14} aria-hidden="true" />
                  Not verified
                </span>
              )}
              {driver.cohort === 'sakhi' ? <Badge variant="sakhi">Sakhi</Badge> : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-card border border-white/10 bg-white/[0.04] px-2 py-3">
            <p className="font-display text-xl font-bold text-cream">{driver.tripsCompleted}</p>
            <p className="mt-0.5 text-[11px] text-cream/50">Trips completed</p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/[0.04] px-2 py-3">
            <p className="font-display text-xl font-bold text-cream">
              {driver.rating > 0 ? `★ ${driver.rating.toFixed(1)}` : '—'}
            </p>
            <p className="mt-0.5 text-[11px] text-cream/50">Rating</p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/[0.04] px-2 py-3">
            <p className="font-display text-xl font-bold text-cream">{driver.languages.length}</p>
            <p className="mt-0.5 text-[11px] text-cream/50">Languages</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {driver.languages.map((l) => (
            <Chip key={l}>{l}</Chip>
          ))}
        </div>
      </Card>

      <Card className="mt-4 text-center">
        <div className="mx-auto w-fit rounded-card border border-white/15 bg-white p-3">
          <QRCodeSVG value={verifyUrl} size={168} aria-label={`Verify ${driver.name}`} />
        </div>
        <p className="mt-3 text-sm font-semibold text-cream/75">Scan to verify this driver live</p>
        <p className="mt-1 break-all text-xs text-cream/40">{verifyUrl}</p>
      </Card>

      <Card className="mt-4">
        <h2 className="font-display text-xl font-bold text-cream">The trust stack</h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {TRUST_STACK.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[15px] text-cream/85">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-verified/20 text-xs font-bold text-emerald-300"
              >
                ✓
              </span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-white/10 pt-3 text-center font-display text-sm italic leading-relaxed text-cream/60">
          “{GUARANTEE_CARD_TEXT}”
        </p>
      </Card>
    </div>
  );
}
