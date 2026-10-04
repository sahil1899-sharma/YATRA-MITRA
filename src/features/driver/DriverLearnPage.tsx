import { useState } from 'react';
import { BookOpen, ChevronDown, HeartHandshake, Languages, ScrollText } from 'lucide-react';
import { SEED_STOPS } from '../../data/seed';
import Card from '../../components/Card';
import Reveal from '../../components/Reveal';
import Badge from '../../components/Badge';

const HOSPITALITY = [
  'Greet every passenger with a smile and a Namaste before the ride begins.',
  'Never bargain or ask for more than the fixed circuit fare.',
  'No surprise stops — follow the circuit route unless the passenger asks.',
  'Never push commission shopping halts; the route has no shopping stops.',
  'Help seniors and families board comfortably; wait till everyone is seated.',
  'Learn a greeting in your passenger\u2019s language — a small effort, a big welcome.',
];

const FIRST_AID = [
  {
    title: 'Bleeding',
    steps: [
      'Press firmly on the wound with the cleanest cloth you have.',
      'Keep the injured part raised above heart level if you can.',
      'Call 112 in an emergency.',
    ],
  },
  {
    title: 'Fainting',
    steps: [
      'Lay the person flat and loosen any tight clothing.',
      'Do not pour water into the mouth of someone unconscious.',
      'Call 112 in an emergency.',
    ],
  },
  {
    title: 'Heat exhaustion',
    steps: [
      'Move the person to shade and give cool water to sip.',
      'Cool the skin with a wet cloth on the neck and forehead.',
      'Call 112 in an emergency.',
    ],
  },
];

const PHRASES = [
  { en: 'Namaste', hi: 'Namaste', note: 'Hello / greetings' },
  { en: 'Welcome', hi: 'Swagat hai', note: 'Welcome aboard' },
  { en: 'Please sit', hi: 'Kripya baithiye', note: 'Please be seated' },
  { en: 'Thank you', hi: 'Dhanyavaad', note: 'Thank you' },
];

const SECTIONS = [
  { id: 'stories', label: 'Story scripts', icon: ScrollText },
  { id: 'hospitality', label: 'Hospitality refreshers', icon: HeartHandshake },
  { id: 'firstaid', label: 'First-aid cards', icon: BookOpen },
  { id: 'phrases', label: 'Language phrases', icon: Languages },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function DriverLearnPage() {
  const [open, setOpen] = useState<SectionId | null>('stories');
  const storyStops = SEED_STOPS.filter((s) => s.hasStory);

  return (
    <div className="bg-jaali-dark px-4 pb-10 pt-6 md:px-2">
      <h1 className="font-display text-2xl font-bold text-cream">Learn</h1>
      <p className="mt-1 text-sm text-cream/60">
        Scripts, etiquette and quick-reference cards for Mitra drivers.
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        {SECTIONS.map(({ id, label, icon: Icon }, i) => {
          const isOpen = open === id;
          return (
            <Reveal key={id} delay={Math.min(i * 0.07, 0.35)}>
            <Card className="card-lift !p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="text-saffron" aria-hidden="true" />
                  <span className="font-display text-base font-bold text-cream">{label}</span>
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`shrink-0 text-cream/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && id === 'stories' ? (
                <div className="flex flex-col gap-3 border-t border-white/10 p-4">
                  {storyStops.map((s) => (
                    <div key={s.id} className="rounded-card border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-sm font-bold text-cream">{s.name}</p>
                      {s.storyEn ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-cream/75">
                          <span className="font-semibold text-cream/50">Sample narration (EN) — </span>
                          {s.storyEn}
                        </p>
                      ) : null}
                      {s.storyHi ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-cream/75">
                          <span className="font-semibold text-cream/50">Sample narration (HI) — </span>
                          {s.storyHi}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {isOpen && id === 'hospitality' ? (
                <ul className="flex flex-col gap-2.5 border-t border-white/10 p-4">
                  {HOSPITALITY.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[15px] text-cream/85">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-saffron/20 text-xs font-bold text-saffron"
                      >
                        {i + 1}
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              ) : null}

              {isOpen && id === 'firstaid' ? (
                <div className="flex flex-col gap-3 border-t border-white/10 p-4">
                  {FIRST_AID.map((c) => (
                    <div key={c.title} className="rounded-card border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-base font-bold text-cream">{c.title}</p>
                        <Badge variant="simulated">Sample content</Badge>
                      </div>
                      <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-cream/75">
                        {c.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                  <p className="text-xs text-cream/45">
                    These cards are quick reminders only, not medical advice.
                  </p>
                </div>
              ) : null}

              {isOpen && id === 'phrases' ? (
                <div className="flex flex-col gap-2 border-t border-white/10 p-4">
                  {PHRASES.map((p) => (
                    <div
                      key={p.en}
                      className="flex items-center justify-between gap-3 rounded-card border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-bold text-cream">{p.hi}</p>
                        <p className="text-xs text-cream/50">{p.note}</p>
                      </div>
                      <p className="text-sm text-cream/60">{p.en}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
