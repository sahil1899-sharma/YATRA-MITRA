import { useParams } from 'react-router-dom';
import { BadgeCheck, ShieldX } from 'lucide-react';
import { GUARANTEE_CARD_TEXT } from '../../data/constants';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Badge from '../../components/Badge';

const PIPELINE_LABEL: Record<string, string> = {
  applied: 'Applied',
  documents: 'Documents',
  police_check: 'Police check',
  training: 'Training',
  assessment: 'Assessment',
};

// Public live-verification page. Reads straight from the store, so what the
// passenger sees always matches the driver's current verification state.
export default function VerifyPage() {
  const { mitraId } = useParams();
  const driver = useAppStore((s) => s.drivers.find((d) => d.mitraId === mitraId));

  if (!driver) {
    return (
      <Card className="text-center">
        <ShieldX size={44} className="mx-auto text-red-300" aria-hidden="true" />
        <h1 className="mt-3 font-display text-2xl font-bold text-cream">No such Mitra ID</h1>
        <p className="mt-2 text-sm text-cream/65">
          {mitraId} is not a Yatra Mitra driver ID. Do not board.
        </p>
      </Card>
    );
  }

  const verified = driver.verificationStatus === 'badged';

  return (
    <div className="flex flex-col gap-4">
      <Card className="text-center">
        {verified ? (
          <>
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-verified/15 shadow-[0_0_36px_rgba(30,142,90,0.45)]">
              <BadgeCheck size={44} className="text-emerald-300" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-emerald-300">Verified Mitra</h1>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-alert/15 shadow-[0_0_36px_rgba(192,57,43,0.45)]">
              <ShieldX size={44} className="text-red-300" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-red-300">
              Not a verified Mitra — do not board
            </h1>
            <p className="mt-2 text-sm text-cream/65">
              Current step: {PIPELINE_LABEL[driver.verificationStatus] ?? driver.verificationStatus}
            </p>
          </>
        )}

        <p className="mt-4 font-display text-xl font-bold text-cream">{driver.name}</p>
        <p className="mt-0.5 text-sm text-cream/55">Mitra ID {driver.mitraId}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {driver.cohort === 'sakhi' ? <Badge variant="sakhi">Yatra Sakhi</Badge> : null}
          {driver.languages.map((l) => (
            <Chip key={l}>{l}</Chip>
          ))}
        </div>
      </Card>

      {verified ? (
        <Card>
          <p className="text-center font-display text-[15px] italic leading-relaxed text-cream/75">
            “{GUARANTEE_CARD_TEXT}”
          </p>
        </Card>
      ) : null}
    </div>
  );
}
