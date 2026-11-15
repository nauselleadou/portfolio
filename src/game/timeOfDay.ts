export interface TimeOfDayState {
  t: number;
  skyTop: number;
  skyMid: number;
  skyHorizon: number;
  sunYNorm: number;
  sunAlpha: number;
  sunColor: number;
  starAlpha: number;
  nightFactor: number;
  warmthFactor: number;
  shadowAlpha: number;
  shadowOffsetX: number;
  terrainBase: number;
  terrainAccent: number;
  waterColor: number;
  waterSpecular: number;
  mountainFar: number;
  mountainNear: number;
  ambientLightColor: number;
}

function lerpChannel(a: number, b: number, k: number): number {
  return Math.round(a + (b - a) * k);
}

export function lerpHexColor(c1: number, c2: number, k: number): number {
  const t = Math.max(0, Math.min(1, k));
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = lerpChannel(r1, r2, t);
  const g = lerpChannel(g1, g2, t);
  const b = lerpChannel(b1, b2, t);
  return (r << 16) | (g << 8) | b;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const v = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return v * v * (3 - 2 * v);
}

interface KeyframeStop {
  t: number;
  skyTop: number;
  skyMid: number;
  skyHorizon: number;
  sunYNorm: number;
  sunAlpha: number;
  sunColor: number;
  starAlpha: number;
  nightFactor: number;
  warmthFactor: number;
  shadowAlpha: number;
  shadowOffsetX: number;
  terrainBase: number;
  terrainAccent: number;
  waterColor: number;
  waterSpecular: number;
  mountainFar: number;
  mountainNear: number;
  ambientLightColor: number;
}

/**
 * Temporal evolution keyframes across the 6 stations:
 * - Gare 01 (0.055): Bright morning, soft natural light, clear slightly cloudy sky
 * - Gare 02 (0.24):  Midday, intense clear daylight, crisp contrast
 * - Gare 03 (0.43):  Late afternoon, warm golden light, lengthening shadows
 * - Sunset Transition (0.50 -> 0.56 -> 0.62): Progressive sunset into twilight & evening
 * - Gare 04 (0.62):  Early evening night-blue, illuminated architectural glass & vitrines
 * - Gare 05 (0.80):  Deep starry night, mountain silhouettes, luminous observatory
 * - Gare 06 (0.96):  Nocturnal grand terminal, rich warm architectural reflections
 */
const KEYFRAMES: KeyframeStop[] = [
  {
    // Morning — Gare 01
    t: 0.0,
    skyTop: 0x6f98b3,
    skyMid: 0xa3c2d4,
    skyHorizon: 0xdfe7e5,
    sunYNorm: 0.28,
    sunAlpha: 0.72,
    sunColor: 0xfff5dc,
    starAlpha: 0,
    nightFactor: 0,
    warmthFactor: 0.15,
    shadowAlpha: 0.16,
    shadowOffsetX: 16,
    terrainBase: 0x5c7c66,
    terrainAccent: 0x7e9984,
    waterColor: 0x3b6e84,
    waterSpecular: 0xb7d7e4,
    mountainFar: 0x7c97a6,
    mountainNear: 0x4f6d75,
    ambientLightColor: 0xf5f1e8,
  },
  {
    // Midday — Gare 02
    t: 0.24,
    skyTop: 0x3b7699,
    skyMid: 0x7db1cc,
    skyHorizon: 0xd4e4ec,
    sunYNorm: 0.16,
    sunAlpha: 0.85,
    sunColor: 0xfff9ea,
    starAlpha: 0,
    nightFactor: 0,
    warmthFactor: 0.05,
    shadowAlpha: 0.19,
    shadowOffsetX: 8,
    terrainBase: 0x4d7058,
    terrainAccent: 0x718f79,
    waterColor: 0x2a6178,
    waterSpecular: 0xaed4e6,
    mountainFar: 0x628596,
    mountainNear: 0x3f5e68,
    ambientLightColor: 0xfaf7f0,
  },
  {
    // Late Afternoon — Gare 03
    t: 0.43,
    skyTop: 0x456b88,
    skyMid: 0x9aa9aa,
    skyHorizon: 0xe6c38d,
    sunYNorm: 0.36,
    sunAlpha: 0.9,
    sunColor: 0xf7cf86,
    starAlpha: 0,
    nightFactor: 0.08,
    warmthFactor: 0.62,
    shadowAlpha: 0.23,
    shadowOffsetX: 28,
    terrainBase: 0x4c6651,
    terrainAccent: 0x788469,
    waterColor: 0x30596c,
    waterSpecular: 0xe4bf85,
    mountainFar: 0x5d6e7b,
    mountainNear: 0x3e4e57,
    ambientLightColor: 0xf2dec0,
  },
  {
    // Sunset Peak — Between Gare 03 & Gare 04
    t: 0.515,
    skyTop: 0x263e58,
    skyMid: 0x8b5b52,
    skyHorizon: 0xd98a52,
    sunYNorm: 0.5,
    sunAlpha: 0.92,
    sunColor: 0xf09b54,
    starAlpha: 0.08,
    nightFactor: 0.48,
    warmthFactor: 1.0,
    shadowAlpha: 0.27,
    shadowOffsetX: 40,
    terrainBase: 0x34473b,
    terrainAccent: 0x565d4f,
    waterColor: 0x233f52,
    waterSpecular: 0xd98e57,
    mountainFar: 0x41485a,
    mountainNear: 0x29323e,
    ambientLightColor: 0xe3b184,
  },
  {
    // Twilight — Approaching Gare 04
    t: 0.57,
    skyTop: 0x132437,
    skyMid: 0x2c4259,
    skyHorizon: 0x7c5548,
    sunYNorm: 0.64,
    sunAlpha: 0.28,
    sunColor: 0xd47448,
    starAlpha: 0.42,
    nightFactor: 0.82,
    warmthFactor: 0.55,
    shadowAlpha: 0.24,
    shadowOffsetX: 46,
    terrainBase: 0x21362c,
    terrainAccent: 0x344a3f,
    waterColor: 0x163144,
    waterSpecular: 0x9b7e63,
    mountainFar: 0x233447,
    mountainNear: 0x172432,
    ambientLightColor: 0x9bb3c7,
  },
  {
    // Early Evening — Gare 04
    t: 0.62,
    skyTop: 0x0d1b2a,
    skyMid: 0x172d44,
    skyHorizon: 0x294863,
    sunYNorm: 0.85,
    sunAlpha: 0,
    sunColor: 0xd8b77a,
    starAlpha: 0.72,
    nightFactor: 0.96,
    warmthFactor: 0.15,
    shadowAlpha: 0.22,
    shadowOffsetX: 24,
    terrainBase: 0x1d3229,
    terrainAccent: 0x2c4539,
    waterColor: 0x122c3e,
    waterSpecular: 0x5b8299,
    mountainFar: 0x1a2d40,
    mountainNear: 0x122130,
    ambientLightColor: 0x89a5bd,
  },
  {
    // Deep Starry Night — Gare 05
    t: 0.8,
    skyTop: 0x09131e,
    skyMid: 0x102133,
    skyHorizon: 0x1d3850,
    sunYNorm: 1.0,
    sunAlpha: 0,
    sunColor: 0xd8b77a,
    starAlpha: 1.0,
    nightFactor: 1.0,
    warmthFactor: 0.05,
    shadowAlpha: 0.2,
    shadowOffsetX: 20,
    terrainBase: 0x192c25,
    terrainAccent: 0x273f36,
    waterColor: 0x0f2637,
    waterSpecular: 0x4f7891,
    mountainFar: 0x142436,
    mountainNear: 0x0e1b29,
    ambientLightColor: 0x7c9bb5,
  },
  {
    // Nocturnal Grand Terminal — Gare 06
    t: 1.0,
    skyTop: 0x0b1622,
    skyMid: 0x13263a,
    skyHorizon: 0x23415a,
    sunYNorm: 1.0,
    sunAlpha: 0,
    sunColor: 0xd8b77a,
    starAlpha: 0.9,
    nightFactor: 1.0,
    warmthFactor: 0.12,
    shadowAlpha: 0.22,
    shadowOffsetX: 20,
    terrainBase: 0x1c3129,
    terrainAccent: 0x2c443a,
    waterColor: 0x122b3d,
    waterSpecular: 0x6c8ea3,
    mountainFar: 0x172a3d,
    mountainNear: 0x101e2c,
    ambientLightColor: 0x8ba7bf,
  },
];

export function getTimeOfDayState(t: number): TimeOfDayState {
  const clamped = Math.max(0, Math.min(1, t));

  let a = KEYFRAMES[0];
  let b = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clamped >= KEYFRAMES[i].t && clamped <= KEYFRAMES[i + 1].t) {
      a = KEYFRAMES[i];
      b = KEYFRAMES[i + 1];
      break;
    }
  }

  const k = a.t === b.t ? 0 : smoothstep(a.t, b.t, clamped);

  return {
    t: clamped,
    skyTop: lerpHexColor(a.skyTop, b.skyTop, k),
    skyMid: lerpHexColor(a.skyMid, b.skyMid, k),
    skyHorizon: lerpHexColor(a.skyHorizon, b.skyHorizon, k),
    sunYNorm: a.sunYNorm + (b.sunYNorm - a.sunYNorm) * k,
    sunAlpha: a.sunAlpha + (b.sunAlpha - a.sunAlpha) * k,
    sunColor: lerpHexColor(a.sunColor, b.sunColor, k),
    starAlpha: a.starAlpha + (b.starAlpha - a.starAlpha) * k,
    nightFactor: a.nightFactor + (b.nightFactor - a.nightFactor) * k,
    warmthFactor: a.warmthFactor + (b.warmthFactor - a.warmthFactor) * k,
    shadowAlpha: a.shadowAlpha + (b.shadowAlpha - a.shadowAlpha) * k,
    shadowOffsetX: a.shadowOffsetX + (b.shadowOffsetX - a.shadowOffsetX) * k,
    terrainBase: lerpHexColor(a.terrainBase, b.terrainBase, k),
    terrainAccent: lerpHexColor(a.terrainAccent, b.terrainAccent, k),
    waterColor: lerpHexColor(a.waterColor, b.waterColor, k),
    waterSpecular: lerpHexColor(a.waterSpecular, b.waterSpecular, k),
    mountainFar: lerpHexColor(a.mountainFar, b.mountainFar, k),
    mountainNear: lerpHexColor(a.mountainNear, b.mountainNear, k),
    ambientLightColor: lerpHexColor(a.ambientLightColor, b.ambientLightColor, k),
  };
}
