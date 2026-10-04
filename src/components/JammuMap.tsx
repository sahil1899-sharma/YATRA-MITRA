import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Stop } from '../types';
import { STOP_COORDS, CIRCUIT_ROUTES } from '../data/routeGeometry';
import JammuMapFallback from './JammuMapFallback';

// Real interactive street map of Jammu (Leaflet + CARTO dark tiles, OSM data).
// Route geometry is real road routing, precomputed at build time from OSRM —
// no runtime routing dependency. Falls back to the illustrated schematic map
// when map tiles cannot load (offline).
//
// Modes mirror the old schematic map:
// - default: self-driving rickshaw preview; tap a stop for its story popup.
// - progress (0–100): the rickshaw is driven externally (ride / live share)
//   and the travelled road glows behind it.
// - readOnly: no pan, zoom or popups (public live-share page).

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIB =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const LIVE_CAPTION = 'Live street map of Jammu — drag to explore, tap a stop for its story.';
const OFFLINE_CAPTION = 'Offline illustrated map — connect to the internet for the live street map.';

interface RouteGeom {
  latlngs: L.LatLng[];
  cumMeters: number[];
  totalMeters: number;
  stopMeters: number[];
}

function haversineM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h =
    s1 * s1 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Match the stops to a precomputed OSRM circuit route; fall back to straight lines. */
function buildGeometry(stops: Stop[]): RouteGeom | null {
  const ids = stops.map((s) => s.id);
  const match = CIRCUIT_ROUTES.find(
    (r) => r.stopIds.length === ids.length && r.stopIds.every((id, i) => id === ids[i]),
  );
  let line: [number, number][];
  let stopMeters: number[];
  if (match && match.line.length > 1) {
    line = match.line;
    stopMeters = match.stopDistances;
  } else {
    line = [];
    stopMeters = [];
    let cum = 0;
    ids.forEach((id, i) => {
      const c = STOP_COORDS[id];
      if (!c) return;
      if (i > 0) {
        const prev = STOP_COORDS[ids[i - 1]];
        if (prev) cum += haversineM(prev, c);
      }
      line.push([c.lng, c.lat]);
      stopMeters.push(cum);
    });
  }
  if (line.length < 2) return null;
  const latlngs = line.map(([lng, lat]) => L.latLng(lat, lng));
  const cumMeters: number[] = [0];
  for (let i = 1; i < latlngs.length; i++) {
    cumMeters.push(cumMeters[i - 1] + haversineM(latlngs[i - 1], latlngs[i]));
  }
  return { latlngs, cumMeters, totalMeters: cumMeters[cumMeters.length - 1], stopMeters };
}

function pointAtDistance(geom: RouteGeom, d: number): L.LatLng {
  const { latlngs, cumMeters, totalMeters } = geom;
  const target = Math.min(Math.max(d, 0), totalMeters);
  let lo = 0;
  let hi = cumMeters.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumMeters[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const d0 = cumMeters[i - 1];
  const d1 = cumMeters[i];
  const t = d1 > d0 ? (target - d0) / (d1 - d0) : 0;
  const a = latlngs[i - 1];
  const b = latlngs[i];
  return L.latLng(a.lat + (b.lat - a.lat) * t, a.lng + (b.lng - a.lng) * t);
}

function sliceUpTo(geom: RouteGeom, d: number): L.LatLng[] {
  const target = Math.min(Math.max(d, 0), geom.totalMeters);
  const pts: L.LatLng[] = [geom.latlngs[0]];
  for (let i = 1; i < geom.latlngs.length; i++) {
    if (geom.cumMeters[i] <= target) pts.push(geom.latlngs[i]);
    else {
      pts.push(pointAtDistance(geom, target));
      break;
    }
  }
  return pts;
}

function pinHtml(n: number, story: boolean): string {
  return `<div class="ym-pin${story ? ' ym-pin-story' : ''}"><span>${n}</span>${
    story ? '<i class="ym-pin-flame"></i>' : ''
  }</div>`;
}

const RICKSHAW_SVG = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
<circle cx="18" cy="18" r="16" fill="#0B060C" opacity="0.55"/>
<rect x="6" y="13" width="24" height="9" rx="4" fill="#E8890C"/>
<rect x="6" y="9" width="24" height="5" rx="2.5" fill="#7A1F2B"/>
<rect x="14" y="5" width="8" height="5" rx="2" fill="#E8890C" opacity="0.9"/>
<circle cx="12" cy="25" r="3.6" fill="#0B060C" stroke="#FFF8EC" stroke-width="1.5"/>
<circle cx="24" cy="25" r="3.6" fill="#0B060C" stroke="#FFF8EC" stroke-width="1.5"/>
</svg>`;

function popupHtml(s: Stop, idx: number): string {
  const story =
    s.hasStory && s.storyEn
      ? `<p class="ym-popup-story"><span>Sample narration — </span>${s.storyEn}</p>`
      : '';
  return `<div class="ym-popup"><p class="ym-popup-kicker">Stop ${idx + 1}</p><p class="ym-popup-title">${s.name}</p>${story}</div>`;
}

interface LiveMapProps {
  stops: Stop[];
  progress?: number | null;
  readOnly?: boolean;
  caption?: string;
  onOffline: () => void;
}

function LiveMap({ stops, progress = null, readOnly = false, caption, onOffline }: LiveMapProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const geom = useMemo(() => buildGeometry(stops), [stops]);
  const [interacted, setInteracted] = useState(false);
  const layers = useRef<{ map: L.Map; rickshaw: L.Marker; doneLine: L.Polyline } | null>(null);
  const driven = progress !== null && progress !== undefined;

  useEffect(() => {
    const el = divRef.current;
    if (!el || !geom) return;

    const map = L.map(el, {
      zoomControl: !readOnly,
      dragging: !readOnly,
      scrollWheelZoom: false,
      doubleClickZoom: !readOnly,
      touchZoom: !readOnly,
      boxZoom: false,
      keyboard: !readOnly,
    });

    let settled = false;
    const goOffline = () => {
      if (settled) return;
      settled = true;
      onOffline();
    };
    let loaded = 0;
    let errors = 0;
    const tiles = L.tileLayer(TILE_URL, {
      attribution: ATTRIB,
      maxZoom: 19,
    });
    tiles.on('tileload', () => {
      loaded += 1;
    });
    tiles.on('tileerror', () => {
      errors += 1;
      if (errors >= 5 && loaded === 0) goOffline();
    });
    tiles.addTo(map);
    const watchdog = window.setTimeout(() => {
      if (loaded === 0) goOffline();
    }, 12000);

    // full route (dim base; bright when self-driving)
    L.polyline(geom.latlngs, {
      color: '#E8890C',
      weight: 4,
      opacity: driven ? 0.3 : 0.85,
      className: 'ym-route',
    }).addTo(map);

    // travelled portion — bright, only in driven mode
    const doneLine = L.polyline([geom.latlngs[0]], {
      color: '#FFB84D',
      weight: 5,
      opacity: 0.95,
      className: 'ym-route-done',
    }).addTo(map);
    if (!driven) doneLine.setStyle({ opacity: 0 });

    // stop pins
    stops.forEach((s, i) => {
      const c = STOP_COORDS[s.id];
      if (!c) return;
      const m = L.marker([c.lat, c.lng], {
        icon: L.divIcon({
          className: 'ym-pin-wrap',
          html: pinHtml(i + 1, s.hasStory),
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        keyboard: !readOnly,
        zIndexOffset: 100,
      }).addTo(map);
      if (!readOnly) m.bindPopup(popupHtml(s, i), { maxWidth: 250, closeButton: true });
    });

    // e-rickshaw marker
    const rickshaw = L.marker(geom.latlngs[0], {
      icon: L.divIcon({
        className: 'ym-rick-wrap',
        html: `<div class="ym-rick">${RICKSHAW_SVG}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
      interactive: false,
      keyboard: false,
      zIndexOffset: 200,
    }).addTo(map);

    layers.current = { map, rickshaw, doneLine };

    map.fitBounds(L.latLngBounds(geom.latlngs).pad(0.15));
    map.setMinZoom(10);
    map.setMaxZoom(18);

    const mark = () => {
      setInteracted(true);
      if (!readOnly) map.scrollWheelZoom.enable();
    };
    map.on('click', mark);
    map.on('dragstart', mark);
    map.on('zoomstart', mark);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);

    return () => {
      settled = true;
      window.clearTimeout(watchdog);
      ro.disconnect();
      layers.current = null;
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geom, readOnly]);

  // externally driven progress: move the rickshaw + glow the travelled road
  useEffect(() => {
    const l = layers.current;
    if (!l || !geom || !driven) return;
    const d = (Math.min(100, Math.max(0, progress ?? 0)) / 100) * geom.totalMeters;
    l.rickshaw.setLatLng(pointAtDistance(geom, d));
    l.doneLine.setLatLngs(sliceUpTo(geom, d));
  }, [progress, driven, geom]);

  // self-driving preview loop with dwells at each stop
  useEffect(() => {
    const l = layers.current;
    if (!l || !geom || driven || readOnly) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const place = (d: number) => l.rickshaw.setLatLng(pointAtDistance(geom, d));
    if (reduced) {
      place(0);
      return;
    }
    const stopD = geom.stopMeters;
    const total = geom.totalMeters;
    const TRAVEL_MS = 38000;
    const DWELL_MS = 1400;
    const segLens = stopD.map((d, i) => (i === 0 ? d : d - stopD[i - 1]));
    const segTimes = segLens.map((len) => (len / total) * TRAVEL_MS);
    const cycle = TRAVEL_MS + stopD.length * DWELL_MS;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const el2 = (now - start) % cycle;
      let time = 0;
      let dist = 0;
      for (let i = 0; i < stopD.length; i++) {
        if (el2 < time + segTimes[i]) {
          dist = (i === 0 ? 0 : stopD[i - 1]) + ((el2 - time) / segTimes[i]) * segLens[i];
          break;
        }
        time += segTimes[i];
        dist = stopD[i];
        if (el2 < time + DWELL_MS) break;
        time += DWELL_MS;
      }
      place(dist);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [driven, readOnly, geom]);

  if (!geom) {
    return <JammuMapFallback stops={stops} progress={progress} readOnly={readOnly} caption={caption} />;
  }

  return (
    <figure className="overflow-hidden rounded-card border border-white/10 bg-night-soft">
      <div ref={divRef} className="relative aspect-[4/3] w-full" role="application" aria-label="Interactive street map of Jammu with the circuit route">
        {!readOnly && !interacted ? (
          <div className="animate-pulse-soft pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full border border-saffron/40 bg-night/80 px-4 py-1.5 text-xs font-bold text-saffron backdrop-blur-md">
            Tap to explore — pinch or scroll to zoom
          </div>
        ) : null}
      </div>
      <figcaption className="border-t border-white/10 px-4 py-2.5 text-center text-xs text-cream/50">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function JammuMap({
  stops,
  progress = null,
  readOnly = false,
  caption = LIVE_CAPTION,
}: {
  stops: Stop[];
  progress?: number | null;
  readOnly?: boolean;
  caption?: string;
}) {
  const [offline, setOffline] = useState(false);
  if (offline) {
    return (
      <JammuMapFallback
        stops={stops}
        progress={progress}
        readOnly={readOnly}
        caption={OFFLINE_CAPTION}
      />
    );
  }
  return (
    <LiveMap
      key={stops.map((s) => s.id).join(',')}
      stops={stops}
      progress={progress}
      readOnly={readOnly}
      caption={caption}
      onOffline={() => setOffline(true)}
    />
  );
}
