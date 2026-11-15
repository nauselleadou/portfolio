import { STATIONS_DATA } from '../data/stations';
import { worldToIso, IsoPoint } from './isoMath';

export interface RailSample {
  t: number;
  wx: number;
  wy: number;
  wz: number;
  isoX: number;
  isoY: number;
  /** Screen-space unit tangent vector */
  dirX: number;
  dirY: number;
  /** Screen-space angle in radians */
  angle: number;
  /** World normal pointing toward the upper-back station platform */
  platNormalWx: number;
  platNormalWy: number;
  isBridge: boolean;
  isTunnel: boolean;
}

export interface SceneryProp {
  id: string;
  t: number;
  wx: number;
  wy: number;
  wz: number;
  kind:
    | 'pine_tree'
    | 'deciduous_tree'
    | 'rock_outcrop'
    | 'urban_building'
    | 'platform_lamp'
    | 'distant_cloud';
  scale: number;
}

export interface BridgeSpan {
  startT: number;
  endT: number;
  label: string;
}

export interface TunnelSpan {
  startT: number;
  endT: number;
}

export const BRIDGE_SPANS: BridgeSpan[] = [
  { startT: 0.11, endT: 0.165, label: 'Viaduc de la Vallée' },
  { startT: 0.50, endT: 0.555, label: 'Viaduc du Crépuscule' },
  { startT: 0.70, endT: 0.76, label: 'Viaduc des Crêtes' },
];

export const TUNNEL_SPANS: TunnelSpan[] = [
  { startT: 0.31, endT: 0.355 },
  { startT: 0.875, endT: 0.91 },
];

/**
 * Computes continuous 3D world coordinates for normalized spline parameter t in [0..1].
 * Designed so the train winds gracefully across 6 distinct elevated station zones.
 */
export function evaluateWorldTrack(t: number): { wx: number; wy: number; wz: number } {
  const clamped = Math.max(0, Math.min(1, t));
  const totalLen = 6200;
  const wx = clamped * totalLen;

  // Base diagonal angle + gentle scenic meanders flattened near stations for crisp docking
  let meander = Math.sin(clamped * Math.PI * 5.2) * 140 + Math.cos(clamped * Math.PI * 2.5) * 65;

  // Flatten meanders slightly right around each station stopT so platforms align gracefully
  for (const st of STATIONS_DATA) {
    const dist = Math.abs(clamped - st.stopT);
    if (dist < 0.045) {
      const flatten = Math.cos((dist / 0.045) * (Math.PI / 2));
      meander *= 1 - flatten * 0.45;
    }
  }

  const wy = -0.58 * wx + meander;

  // Elevation wz: gently climbs toward Station 05 (L'Express du Futur) then glides to Station 06
  let wz = 18;
  // Bridge elevation humps
  for (const b of BRIDGE_SPANS) {
    if (clamped >= b.startT && clamped <= b.endT) {
      const local = (clamped - b.startT) / (b.endT - b.startT);
      wz += Math.sin(local * Math.PI) * 28;
    }
  }
  // Mountain ridge observatory climb around station 5 (t = 0.80)
  const ridgeDist = Math.abs(clamped - 0.80);
  if (ridgeDist < 0.14) {
    wz += Math.cos((ridgeDist / 0.14) * (Math.PI / 2)) * 56;
  }

  return { wx, wy, wz };
}

export function sampleRailAt(t: number): RailSample {
  const clamped = Math.max(0, Math.min(1, t));
  const eps = 0.0008;
  const t0 = Math.max(0, clamped - eps);
  const t1 = Math.min(1, clamped + eps);

  const p = evaluateWorldTrack(clamped);
  const p0 = evaluateWorldTrack(t0);
  const p1 = evaluateWorldTrack(t1);

  const iso = worldToIso(p.wx, p.wy, p.wz);
  const iso0 = worldToIso(p0.wx, p0.wy, p0.wz);
  const iso1 = worldToIso(p1.wx, p1.wy, p1.wz);

  const dx = iso1.x - iso0.x;
  const dy = iso1.y - iso0.y;
  const len = Math.hypot(dx, dy) || 1;

  // World tangent
  const wdx = p1.wx - p0.wx;
  const wdy = p1.wy - p0.wy;
  const wlen = Math.hypot(wdx, wdy) || 1;
  // Normal pointing toward upper/background (-isoY) side
  let nwx = wdy / wlen;
  let nwy = -wdx / wlen;
  // Ensure normal produces smaller isoY (background side of platform)
  if (nwx + nwy > 0) {
    nwx = -nwx;
    nwy = -nwy;
  }

  const isBridge = BRIDGE_SPANS.some((b) => clamped >= b.startT && clamped <= b.endT);
  const isTunnel = TUNNEL_SPANS.some((tn) => clamped >= tn.startT && clamped <= tn.endT);

  return {
    t: clamped,
    wx: p.wx,
    wy: p.wy,
    wz: p.wz,
    isoX: iso.x,
    isoY: iso.y,
    dirX: dx / len,
    dirY: dy / len,
    angle: Math.atan2(dy, dx),
    platNormalWx: nwx,
    platNormalWy: nwy,
    isBridge,
    isTunnel,
  };
}

/**
 * Generates deterministic realistic landscape & architectural props along the journey corridor.
 */
export function buildSceneryProps(): SceneryProp[] {
  const props: SceneryProp[] = [];
  const totalSteps = 165;

  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const sample = sampleRailAt(t);
    if (sample.isBridge || sample.isTunnel) continue;

    // Keep immediate station landing zone clean for platform & interactive architecture
    const nearStation = STATIONS_DATA.some((s) => Math.abs(t - s.stopT) < 0.026);
    const side = i % 2 === 0 ? 1 : -1;
    const dist = nearStation ? 320 + ((i * 37) % 120) : 140 + ((i * 53) % 200);

    const wx = sample.wx + sample.platNormalWx * dist * (nearStation ? 1.15 : side);
    const wy = sample.wy + sample.platNormalWy * dist * (nearStation ? 1.15 : side);

    let kind: SceneryProp['kind'] = 'pine_tree';
    if (t < 0.2) {
      // Gare 01 -> 02: lush green valley & conifers
      kind = i % 4 === 0 ? 'deciduous_tree' : i % 5 === 0 ? 'rock_outcrop' : 'pine_tree';
    } else if (t < 0.48) {
      // Gare 02 -> 03: tech hub & modern urban silhouette blended with forest
      kind =
        i % 4 === 0
          ? 'urban_building'
          : i % 5 === 0
            ? 'platform_lamp'
            : i % 3 === 0
              ? 'deciduous_tree'
              : 'pine_tree';
    } else if (t < 0.7) {
      // Gare 03 -> 04: sunset valley & prestigious evening corridor
      kind = i % 3 === 0 ? 'platform_lamp' : i % 4 === 0 ? 'rock_outcrop' : 'pine_tree';
    } else if (t < 0.88) {
      // Gare 04 -> 05: mountain ridge & pine silhouettes
      kind = i % 3 === 0 ? 'rock_outcrop' : i % 4 === 0 ? 'platform_lamp' : 'pine_tree';
    } else {
      // Gare 05 -> 06: contemporary urban terminal approach
      kind =
        i % 3 === 0
          ? 'urban_building'
          : i % 2 === 0
            ? 'platform_lamp'
            : 'deciduous_tree';
    }

    props.push({
      id: `prop-${i}`,
      t,
      wx,
      wy,
      wz: sample.wz,
      kind,
      scale: 0.85 + ((i * 19) % 35) / 100,
    });

    // Subtle wispy clouds high above the morning/afternoon valley
    if (i % 9 === 0 && t < 0.56) {
      props.push({
        id: `cloud-${i}`,
        t,
        wx: sample.wx + sample.platNormalWx * (410 + ((i * 41) % 130)),
        wy: sample.wy + sample.platNormalWy * (410 + ((i * 41) % 130)),
        wz: sample.wz + 125 + ((i * 17) % 50),
        kind: 'distant_cloud',
        scale: 0.95 + ((i * 13) % 40) / 100,
      });
    }
  }

  return props;
}

export function getStationWorldAnchor(stopT: number): {
  railSample: RailSample;
  platformCenterWx: number;
  platformCenterWy: number;
  platformIso: IsoPoint;
} {
  const railSample = sampleRailAt(stopT);
  const platformOffset = 155;
  const platformCenterWx = railSample.wx + railSample.platNormalWx * platformOffset;
  const platformCenterWy = railSample.wy + railSample.platNormalWy * platformOffset;
  const platformIso = worldToIso(platformCenterWx, platformCenterWy, railSample.wz + 8);
  return {
    railSample,
    platformCenterWx,
    platformCenterWy,
    platformIso,
  };
}
