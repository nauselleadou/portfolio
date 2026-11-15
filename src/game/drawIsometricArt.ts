import Phaser from 'phaser';
import { StationDefinition, StationLandmark } from '../data/stations';
import { drawIsoBox, drawIsoDiamond, worldToIso } from './isoMath';
import {
  BRIDGE_SPANS,
  RailSample,
  SceneryProp,
  TUNNEL_SPANS,
  evaluateWorldTrack,
  getStationWorldAnchor,
  sampleRailAt,
} from './railPath';
import { TimeOfDayState, getTimeOfDayState, lerpHexColor } from './timeOfDay';

export const PALETTE = {
  nightBlueDeep: 0x0b1622,
  nightBlue: 0x102133,
  petrolDark: 0x102f3b,
  petrol: 0x184354,
  petrolLight: 0x235d73,
  forestDark: 0x142c21,
  forest: 0x1b3b2b,
  forestMid: 0x274d3a,
  sage: 0x6e8c7a,
  sageLight: 0x8aa694,
  anthraciteDark: 0x1a1e22,
  anthracite: 0x24292e,
  slate: 0x3a4149,
  slateLight: 0x636e7a,
  ivory: 0xf5f1e8,
  ivoryWarm: 0xeae4d7,
  sand: 0xd8ccb8,
  sandDark: 0xb8aa93,
  champagneLight: 0xf2dfb4,
  champagne: 0xd8b77a,
  copper: 0xb87d4b,
  warmLight: 0xf6cf88,
  glassDay: 0x9ec0d1,
  glassNight: 0x234357,
  skinBrown: 0x8d5534,
  skinShadow: 0x6b3e24,
  hairDark: 0x1d1418,
};

export interface SkyStar {
  xFrac: number;
  yFrac: number;
  size: number;
  phase: number;
}

/**
 * Draws the fixed-to-camera dynamic sky gradient, sun/sunset halo, stars, and parallax mountain ridges.
 */
export function drawSkyBackdrop(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  camX: number,
  timeState: TimeOfDayState,
  stars: SkyStar[],
  animTime: number
) {
  g.clear();
  const w = Math.max(1, width);
  const h = Math.max(1, height);

  // Smooth multi-band vertical sky gradient
  const bands = 22;
  const bandH = h / bands + 1;
  for (let i = 0; i < bands; i++) {
    const f = i / (bands - 1);
    const col =
      f < 0.52
        ? lerpHexColor(timeState.skyTop, timeState.skyMid, f / 0.52)
        : lerpHexColor(timeState.skyMid, timeState.skyHorizon, (f - 0.52) / 0.48);
    g.fillStyle(col, 1);
    g.fillRect(0, i * (h / bands), w, bandH);
  }

  // Stars at dusk/night
  if (timeState.starAlpha > 0.02) {
    for (const s of stars) {
      const twinkle = 0.65 + 0.35 * Math.sin(animTime * 1.4 + s.phase);
      g.fillStyle(PALETTE.ivory, timeState.starAlpha * twinkle * 0.85);
      g.fillCircle(s.xFrac * w, s.yFrac * h * 0.62, s.size);
    }
  }

  // Descending / setting sun during day & sunset transition
  if (timeState.sunAlpha > 0.02) {
    const sunX = w * 0.72 - (camX * 0.015) % (w * 0.15);
    const sunY = h * (0.08 + timeState.sunYNorm * 0.48);
    g.fillStyle(timeState.sunColor, timeState.sunAlpha * 0.14);
    g.fillCircle(sunX, sunY, 96);
    g.fillStyle(timeState.sunColor, timeState.sunAlpha * 0.28);
    g.fillCircle(sunX, sunY, 54);
    g.fillStyle(timeState.sunColor, timeState.sunAlpha * 0.92);
    g.fillCircle(sunX, sunY, 24);
  }

  // Parallax far mountain range along the upper horizon
  const farShift = ((camX * 0.04) % 420 + 420) % 420;
  g.fillStyle(timeState.mountainFar, 0.72);
  g.beginPath();
  g.moveTo(0, h);
  for (let x = -420; x <= w + 420; x += 140) {
    const sx = x - farShift;
    const peak =
      h * 0.36 +
      Math.sin((x + 120) * 0.0045) * 42 +
      Math.cos(x * 0.011) * 24;
    g.lineTo(sx, peak);
  }
  g.lineTo(w, h);
  g.closePath();
  g.fillPath();

  // Parallax near mountain range
  const nearShift = ((camX * 0.085) % 360 + 360) % 360;
  g.fillStyle(timeState.mountainNear, 0.58);
  g.beginPath();
  g.moveTo(0, h);
  for (let x = -360; x <= w + 360; x += 120) {
    const sx = x - nearShift;
    const peak =
      h * 0.45 +
      Math.sin((x + 40) * 0.006) * 34 +
      Math.cos(x * 0.014) * 18;
    g.lineTo(sx, peak);
  }
  g.lineTo(w, h);
  g.closePath();
  g.fillPath();

  // Soft horizon atmospheric haze blending distant peaks into the isometric valley
  g.fillStyle(timeState.skyHorizon, 0.24);
  g.fillRect(0, h * 0.42, w, h * 0.58);
}

/**
 * Draws the continuous landscape corridor, rivers/lakes under bridges, viaduct piers, and railway ballast + steel rails.
 */
export function drawWorldCorridorAndRails(
  g: Phaser.GameObjects.Graphics,
  activeTimeState?: TimeOfDayState
) {
  g.clear();
  const baseNight = activeTimeState?.nightFactor ?? 0;

  // 1. Continuous valley landscape ribbon + lakes under bridges
  const groundSteps = 190;
  for (let i = 0; i < groundSteps; i++) {
    const t = i / groundSteps;
    const localTime = getTimeOfDayState(t);
    // Blend local zone time gently with active camera time so transitions never clash
    const nightMix = activeTimeState ? baseNight * 0.65 + localTime.nightFactor * 0.35 : localTime.nightFactor;
    const terrainColor = lerpHexColor(localTime.terrainBase, PALETTE.forestDark, nightMix * 0.45);
    const terraceColor = lerpHexColor(localTime.terrainAccent, PALETTE.petrolDark, nightMix * 0.35);

    const s = sampleRailAt(t);

    if (s.isBridge) {
      // Natural river & valley lake beneath the viaduct
      const pRiver = worldToIso(s.wx, s.wy, 0);
      g.fillStyle(localTime.waterColor, 0.78);
      g.fillEllipse(pRiver.x, pRiver.y + 42, 340, 128);
      g.fillStyle(localTime.waterSpecular, 0.28);
      g.fillEllipse(pRiver.x - 20, pRiver.y + 38, 175, 44);
      continue;
    }

    drawIsoDiamond(g, s.wx, s.wy, s.wz - 14, 380, 380, terrainColor, 0.72);
    drawIsoDiamond(
      g,
      s.wx + s.platNormalWx * 145,
      s.wy + s.platNormalWy * 145,
      s.wz - 16,
      290,
      290,
      terraceColor,
      0.42
    );
  }

  // 2. Concrete & masonry viaduct piers under bridges
  for (const bridge of BRIDGE_SPANS) {
    const bridgeTime = getTimeOfDayState((bridge.startT + bridge.endT) * 0.5);
    const pierTop = lerpHexColor(PALETTE.sand, PALETTE.slate, bridgeTime.nightFactor * 0.45);
    const pierLeft = lerpHexColor(PALETTE.sandDark, PALETTE.anthracite, bridgeTime.nightFactor * 0.45);
    const pierRight = lerpHexColor(PALETTE.slateLight, PALETTE.nightBlue, bridgeTime.nightFactor * 0.5);

    const pillars = 6;
    for (let k = 0; k <= pillars; k++) {
      const t = bridge.startT + ((bridge.endT - bridge.startT) * k) / pillars;
      const p = evaluateWorldTrack(t);
      drawIsoBox(
        g,
        p.wx,
        p.wy,
        0,
        24,
        24,
        p.wz - 4,
        pierTop,
        pierLeft,
        pierRight,
        0.96,
        PALETTE.anthracite,
        0.35
      );
    }
  }

  // 3. Ballast bed, sleepers & steel rails
  const railSteps = 540;
  const railHalfWidth = 14;
  const leftRailPts: { x: number; y: number }[] = [];
  const rightRailPts: { x: number; y: number }[] = [];
  const centerPts: { x: number; y: number; isBridge: boolean }[] = [];

  for (let i = 0; i <= railSteps; i++) {
    const t = i / railSteps;
    const s = sampleRailAt(t);
    const pCenter = worldToIso(s.wx, s.wy, s.wz);
    centerPts.push({ x: pCenter.x, y: pCenter.y, isBridge: s.isBridge });

    const pLeft = worldToIso(
      s.wx + s.platNormalWx * railHalfWidth,
      s.wy + s.platNormalWy * railHalfWidth,
      s.wz + 2
    );
    const pRight = worldToIso(
      s.wx - s.platNormalWx * railHalfWidth,
      s.wy - s.platNormalWy * railHalfWidth,
      s.wz + 2
    );
    leftRailPts.push(pLeft);
    rightRailPts.push(pRight);

    if (i % 2 === 0) {
      g.lineStyle(4, s.isBridge ? PALETTE.slate : 0x4b4640, 0.85);
      g.beginPath();
      g.moveTo(pLeft.x, pLeft.y);
      g.lineTo(pRight.x, pRight.y);
      g.strokePath();
    }
  }

  // Sub-ballast shadow
  g.lineStyle(32, PALETTE.anthraciteDark, 0.32);
  g.beginPath();
  centerPts.forEach((pt, idx) => {
    if (idx === 0) g.moveTo(pt.x, pt.y + 4);
    else g.lineTo(pt.x, pt.y + 4);
  });
  g.strokePath();

  // Crushed stone ballast / bridge deck
  g.lineStyle(22, lerpHexColor(PALETTE.sandDark, PALETTE.slate, baseNight * 0.45), 0.9);
  g.beginPath();
  centerPts.forEach((pt, idx) => {
    if (idx === 0) g.moveTo(pt.x, pt.y + 1);
    else g.lineTo(pt.x, pt.y + 1);
  });
  g.strokePath();

  // Steel rails with subtle warm champagne/metallic sheen at night
  const railColor = lerpHexColor(PALETTE.ivoryWarm, PALETTE.champagne, 0.25 + baseNight * 0.55);
  g.lineStyle(3, railColor, 0.95);
  g.beginPath();
  leftRailPts.forEach((pt, idx) => {
    if (idx === 0) g.moveTo(pt.x, pt.y);
    else g.lineTo(pt.x, pt.y);
  });
  g.strokePath();

  g.lineStyle(3, railColor, 0.95);
  g.beginPath();
  rightRailPts.forEach((pt, idx) => {
    if (idx === 0) g.moveTo(pt.x, pt.y);
    else g.lineTo(pt.x, pt.y);
  });
  g.strokePath();
}

/**
 * Draws realistic stone-and-concrete mountain tunnel portals over TUNNEL_SPANS.
 */
export function drawTunnelsOverlay(
  g: Phaser.GameObjects.Graphics,
  activeTimeState?: TimeOfDayState
) {
  g.clear();
  const night = activeTimeState?.nightFactor ?? 0;
  const stoneColor = lerpHexColor(0x6d747a, 0x303942, night * 0.55);
  const stoneTrim = lerpHexColor(PALETTE.sand, PALETTE.slateLight, night * 0.55);

  for (const tunnel of TUNNEL_SPANS) {
    const rings = 9;
    for (let r = 0; r <= rings; r++) {
      const t = tunnel.startT + ((tunnel.endT - tunnel.startT) * r) / rings;
      const s = sampleRailAt(t);
      const base = worldToIso(s.wx, s.wy, s.wz);
      const isPortal = r === 0 || r === rings;

      // Rocky mountainside shoulder
      g.fillStyle(stoneColor, isPortal ? 0.92 : 0.72);
      g.fillEllipse(base.x, base.y - 22, isPortal ? 104 : 90, isPortal ? 76 : 64);

      // Dark recessed tunnel arch interior
      g.fillStyle(PALETTE.nightBlueDeep, isPortal ? 0.88 : 0.55);
      g.fillEllipse(base.x, base.y - 18, 62, 48);

      // Stone portal masonry ring
      if (isPortal) {
        g.lineStyle(6, stoneTrim, 0.95);
        g.strokeEllipse(base.x, base.y - 20, 74, 58);

        // Warm interior tunnel safety sconce
        g.fillStyle(PALETTE.champagneLight, 0.45 + night * 0.5);
        g.fillCircle(base.x - 24, base.y - 22, 3.2);
        g.fillCircle(base.x + 24, base.y - 22, 3.2);
      }
    }
  }
}

/**
 * Draws a realistic 2.5D landscape or architectural scenery prop.
 */
export function drawSceneryProp(
  g: Phaser.GameObjects.Graphics,
  prop: SceneryProp,
  timeState?: TimeOfDayState
) {
  g.clear();
  const s = prop.scale;
  const iso = worldToIso(prop.wx, prop.wy, prop.wz);
  const localTime = timeState ?? getTimeOfDayState(prop.t);
  const night = localTime.nightFactor;
  const warm = localTime.warmthFactor;

  switch (prop.kind) {
    case 'pine_tree': {
      // Directional cast shadow
      g.fillStyle(PALETTE.nightBlueDeep, localTime.shadowAlpha);
      g.fillEllipse(localTime.shadowOffsetX * 0.35 * s, 4, 34 * s, 14 * s);

      // Timber trunk
      g.fillStyle(0x4a382c, 1);
      g.fillRect(-3 * s, -16 * s, 6 * s, 18 * s);

      // Layered conifer foliage
      const darkPine = lerpHexColor(PALETTE.forest, PALETTE.forestDark, night * 0.65);
      const midPine = lerpHexColor(PALETTE.forestMid, PALETTE.forest, night * 0.55);
      const litPine = lerpHexColor(PALETTE.sage, PALETTE.forestMid, night * 0.5);

      g.fillStyle(darkPine, 0.98);
      g.fillTriangle(0, -42 * s, -17 * s, -12 * s, 17 * s, -12 * s);
      g.fillStyle(midPine, 0.98);
      g.fillTriangle(0, -56 * s, -14 * s, -24 * s, 14 * s, -24 * s);
      g.fillStyle(litPine, 0.96);
      g.fillTriangle(0, -68 * s, -10 * s, -38 * s, 10 * s, -38 * s);
      break;
    }
    case 'deciduous_tree': {
      g.fillStyle(PALETTE.nightBlueDeep, localTime.shadowAlpha);
      g.fillEllipse(localTime.shadowOffsetX * 0.35 * s, 4, 40 * s, 16 * s);

      g.fillStyle(0x524034, 1);
      g.fillRoundedRect(-3.5 * s, -22 * s, 7 * s, 24 * s, 2);

      const leafDark = lerpHexColor(0x3a5d48, PALETTE.forestDark, night * 0.6);
      const leafLit = lerpHexColor(PALETTE.sage, PALETTE.forestMid, night * 0.5);
      const leafSun = lerpHexColor(PALETTE.sageLight, PALETTE.copper, warm * 0.45);

      g.fillStyle(leafDark, 0.96);
      g.fillCircle(-9 * s, -28 * s, 15 * s);
      g.fillCircle(9 * s, -26 * s, 14 * s);
      g.fillStyle(leafLit, 0.96);
      g.fillCircle(0, -39 * s, 17 * s);
      g.fillStyle(night > 0.6 ? leafLit : leafSun, 0.65);
      g.fillCircle(-4 * s, -43 * s, 9 * s);
      break;
    }
    case 'rock_outcrop': {
      g.fillStyle(PALETTE.nightBlueDeep, localTime.shadowAlpha);
      g.fillEllipse(localTime.shadowOffsetX * 0.25 * s, 3, 36 * s, 14 * s);

      const rockDark = lerpHexColor(0x525b63, PALETTE.anthracite, night * 0.55);
      const rockLit = lerpHexColor(0x889199, PALETTE.slate, night * 0.5);

      g.fillStyle(rockDark, 0.98);
      g.fillTriangle(-16 * s, 2, -4 * s, -18 * s, 10 * s, 2);
      g.fillStyle(rockLit, 0.95);
      g.fillTriangle(-2 * s, 2, 7 * s, -13 * s, 17 * s, 2);
      break;
    }
    case 'urban_building': {
      g.fillStyle(PALETTE.nightBlueDeep, localTime.shadowAlpha * 1.1);
      g.fillEllipse(localTime.shadowOffsetX * 0.45 * s, 6, 62 * s, 26 * s);

      const roofCol = lerpHexColor(PALETTE.ivoryWarm, PALETTE.slate, night * 0.55);
      const leftWall = lerpHexColor(PALETTE.slate, PALETTE.anthracite, night * 0.5);
      const rightWall = lerpHexColor(PALETTE.petrol, PALETTE.nightBlue, night * 0.55);

      drawIsoBox(
        g,
        0,
        0,
        0,
        36 * s,
        36 * s,
        96 * s,
        roofCol,
        leftWall,
        rightWall,
        0.98,
        PALETTE.anthracite,
        0.4
      );

      // Architectural window grid (cool sky glass by day, warm illuminated amber at dusk/night)
      const winCol = lerpHexColor(PALETTE.glassDay, PALETTE.warmLight, Math.min(1, night * 1.25));
      const winAlpha = 0.55 + night * 0.4;
      for (let row = 0; row < 4; row++) {
        const wy = -20 * s - row * 18 * s;
        g.fillStyle(winCol, winAlpha);
        g.fillRect(-13 * s, wy, 9 * s, 8 * s);
        g.fillRect(4 * s, wy, 9 * s, 8 * s);
      }
      break;
    }
    case 'platform_lamp': {
      g.fillStyle(PALETTE.nightBlueDeep, localTime.shadowAlpha);
      g.fillEllipse(0, 2, 18 * s, 8 * s);
      g.lineStyle(3, PALETTE.anthracite, 0.95);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(0, -34 * s);
      g.strokePath();

      // Ground warm pool & luminaire glow when dusk/night settles
      const lampStrength = Math.max(0.18, night * 0.95);
      g.fillStyle(PALETTE.warmLight, 0.14 * lampStrength);
      g.fillEllipse(0, 2, 46 * s, 20 * s);
      g.fillStyle(PALETTE.warmLight, 0.25 * lampStrength);
      g.fillCircle(0, -36 * s, 14 * s);
      g.fillStyle(PALETTE.champagneLight, 0.96);
      g.fillCircle(0, -36 * s, 4 * s);
      break;
    }
    case 'distant_cloud': {
      const cloudCol = lerpHexColor(PALETTE.ivory, 0xe8b98a, warm * 0.6);
      const alpha = Math.max(0, 0.72 * (1 - night * 1.1));
      if (alpha > 0.03) {
        g.fillStyle(cloudCol, alpha);
        g.fillEllipse(0, 0, 96 * s, 26 * s);
        g.fillCircle(-20 * s, -7 * s, 16 * s);
        g.fillCircle(8 * s, -10 * s, 19 * s);
        g.fillCircle(28 * s, -4 * s, 13 * s);
      }
      break;
    }
  }
  g.setPosition(iso.x, iso.y);
}

/**
 * Draws a contemporary architectural station platform and signature glass-and-steel terminal.
 */
export function drawStationPlatformAndArchitecture(
  g: Phaser.GameObjects.Graphics,
  station: StationDefinition,
  isHovered = false,
  isDiscovered = false,
  activeTimeState?: TimeOfDayState
) {
  g.clear();
  const anchor = getStationWorldAnchor(station.stopT);
  const { railSample, platformCenterWx, platformCenterWy } = anchor;
  const wz = railSample.wz;

  const localTime = activeTimeState ?? getTimeOfDayState(station.stopT);
  const night = localTime.nightFactor;

  const deckTop = lerpHexColor(PALETTE.ivory, 0x3b4856, night * 0.48);
  const deckLeft = lerpHexColor(PALETTE.sand, PALETTE.anthracite, night * 0.55);
  const deckRight = lerpHexColor(PALETTE.sandDark, PALETTE.nightBlueDeep, night * 0.6);
  const inlayFill = lerpHexColor(PALETTE.ivoryWarm, 0x2a3947, night * 0.52);

  // Elevated concrete & limestone isometric platform
  drawIsoBox(
    g,
    platformCenterWx,
    platformCenterWy,
    wz - 14,
    390,
    245,
    20,
    deckTop,
    deckLeft,
    deckRight,
    0.99,
    isHovered ? PALETTE.champagneLight : PALETTE.champagne,
    isHovered ? 1 : 0.65
  );

  // Architectural platform paving inlay
  drawIsoDiamond(
    g,
    platformCenterWx,
    platformCenterWy,
    wz + 7,
    350,
    206,
    isHovered ? lerpHexColor(inlayFill, PALETTE.champagneLight, 0.22) : inlayFill,
    0.94,
    isDiscovered ? 0x2f855a : isHovered ? PALETTE.champagneLight : PALETTE.champagne,
    isHovered ? 2.8 : 1.6
  );

  // Subtle architectural bollard lights along platform edge
  for (let b = -1; b <= 1; b++) {
    const bollardIso = worldToIso(
      railSample.wx + railSample.platNormalWx * 46 + b * 85,
      railSample.wy + railSample.platNormalWy * 46 - b * 50,
      wz + 8
    );
    if (night > 0.18) {
      g.fillStyle(PALETTE.warmLight, 0.2 * night);
      g.fillEllipse(bollardIso.x, bollardIso.y + 2, 34, 14);
    }
    g.fillStyle(PALETTE.champagneLight, 0.75 + night * 0.25);
    g.fillCircle(bollardIso.x, bollardIso.y, 3.2);
  }

  // Contemporary architectural terminal behind platform
  const backWx = platformCenterWx + railSample.platNormalWx * 142;
  const backWy = platformCenterWy + railSample.platNormalWy * 142;
  const backIso = worldToIso(backWx, backWy, wz + 8);

  const glassColor = lerpHexColor(PALETTE.glassDay, PALETTE.warmLight, Math.min(1, night * 1.15));
  const wallLight = lerpHexColor(PALETTE.ivory, PALETTE.slate, night * 0.45);
  const wallSide = lerpHexColor(PALETTE.sand, PALETTE.anthracite, night * 0.55);
  const wallPetrol = lerpHexColor(PALETTE.petrol, PALETTE.petrolDark, night * 0.35);

  // Ambient architectural night pool around terminal
  if (night > 0.25) {
    g.fillStyle(PALETTE.warmLight, 0.12 * night);
    g.fillEllipse(backIso.x, backIso.y + 8, 250, 95);
  }

  switch (station.index) {
    case 0: {
      // Gare 01 (Morning): Contemporary limestone & timber-steel glass pavilion
      drawIsoBox(
        g,
        backWx,
        backWy,
        wz + 6,
        180,
        96,
        66,
        wallLight,
        wallSide,
        wallPetrol,
        0.98,
        PALETTE.anthracite,
        0.45
      );
      // Tall bay glass windows
      g.fillStyle(glassColor, 0.85);
      g.fillRoundedRect(backIso.x - 54, backIso.y - 62, 46, 44, 3);
      g.fillRoundedRect(backIso.x + 8, backIso.y - 62, 46, 44, 3);
      g.lineStyle(2, PALETTE.anthracite, 0.9);
      g.strokeRoundedRect(backIso.x - 54, backIso.y - 62, 46, 44, 3);
      g.strokeRoundedRect(backIso.x + 8, backIso.y - 62, 46, 44, 3);
      // Canopy cornice
      g.fillStyle(PALETTE.copper, 0.95);
      g.fillRect(backIso.x - 76, backIso.y - 72, 152, 6);
      break;
    }
    case 1: {
      // Gare 02 (Midday): Sleek technical laboratory in steel, glass & petrol cladding
      drawIsoBox(
        g,
        backWx,
        backWy,
        wz + 6,
        196,
        102,
        82,
        PALETTE.slateLight,
        wallPetrol,
        PALETTE.anthracite,
        0.98,
        PALETTE.champagne,
        0.4
      );
      // Glass curtain wall with vertical mullions
      g.fillStyle(glassColor, 0.82);
      g.fillRect(backIso.x - 66, backIso.y - 78, 132, 54);
      g.lineStyle(1.8, PALETTE.anthraciteDark, 0.85);
      for (let m = -44; m <= 44; m += 22) {
        g.beginPath();
        g.moveTo(backIso.x + m, backIso.y - 78);
        g.lineTo(backIso.x + m, backIso.y - 24);
        g.strokePath();
      }
      // Rooftop architectural louvre frame
      g.lineStyle(3, PALETTE.champagne, 0.9);
      g.strokeRect(backIso.x - 58, backIso.y - 96, 116, 12);
      break;
    }
    case 2: {
      // Gare 03 (Late Afternoon): Twin civic architectural towers with copper sun-breakers
      drawIsoBox(
        g,
        backWx - 55,
        backWy - 25,
        wz + 6,
        68,
        66,
        122,
        wallLight,
        wallPetrol,
        PALETTE.anthracite,
        0.98
      );
      drawIsoBox(
        g,
        backWx + 48,
        backWy + 22,
        wz + 6,
        74,
        66,
        102,
        wallLight,
        wallSide,
        wallPetrol,
        0.98
      );
      // Lit architectural window strips
      g.fillStyle(glassColor, 0.88);
      for (let row = 0; row < 4; row++) {
        g.fillRect(backIso.x - 54, backIso.y - 102 + row * 19, 34, 9);
        g.fillRect(backIso.x + 14, backIso.y - 84 + row * 19, 36, 9);
      }
      // Skybridge connector
      g.fillStyle(PALETTE.copper, 0.95);
      g.fillRect(backIso.x - 24, backIso.y - 74, 44, 8);
      break;
    }
    case 3: {
      // Gare 04 (Early Evening — Night): Prestigious illuminated gallery terminal for certifications & hackathons
      drawIsoBox(
        g,
        backWx,
        backWy,
        wz + 6,
        220,
        98,
        84,
        PALETTE.champagne,
        PALETTE.anthracite,
        PALETTE.petrolDark,
        0.98,
        PALETTE.champagneLight,
        0.75
      );
      // Warm illuminated glass gallery vitrines
      g.fillStyle(PALETTE.warmLight, 0.9);
      for (let v = -68; v <= 68; v += 34) {
        g.fillRoundedRect(backIso.x + v - 11, backIso.y - 76, 22, 50, 2);
        g.lineStyle(2, PALETTE.champagne, 0.95);
        g.strokeRoundedRect(backIso.x + v - 11, backIso.y - 76, 22, 50, 2);
      }
      // Subtle trophy silhouettes inside vitrines
      g.fillStyle(PALETTE.copper, 0.95);
      g.fillCircle(backIso.x, backIso.y - 54, 6);
      g.fillRect(backIso.x - 2, backIso.y - 48, 4, 12);
      g.fillStyle(PALETTE.ivory, 0.95);
      g.fillRect(backIso.x - 40, backIso.y - 62, 12, 16);
      g.fillRect(backIso.x + 28, backIso.y - 62, 12, 16);
      break;
    }
    case 4: {
      // Gare 05 (Deep Starry Night): Cantilevered ridge observatory in dark steel & warm glass
      drawIsoBox(
        g,
        backWx,
        backWy,
        wz + 6,
        175,
        102,
        66,
        PALETTE.slate,
        PALETTE.anthracite,
        PALETTE.nightBlueDeep,
        0.98,
        PALETTE.petrolLight,
        0.65
      );
      // Panoramic illuminated observatory glass dome & horizon ring
      g.fillStyle(PALETTE.warmLight, 0.24);
      g.fillEllipse(backIso.x, backIso.y - 82, 128, 38);
      g.fillStyle(PALETTE.warmLight, 0.85);
      g.fillRoundedRect(backIso.x - 56, backIso.y - 64, 112, 26, 4);
      g.lineStyle(2.5, PALETTE.champagne, 0.95);
      g.strokeEllipse(backIso.x, backIso.y - 80, 124, 34);
      break;
    }
    case 5: {
      // Gare 06 (Nocturnal Finale): Grand contemporary glass-vault terminus with warm interior lighting
      drawIsoBox(
        g,
        backWx,
        backWy,
        wz + 6,
        220,
        108,
        90,
        PALETTE.slateLight,
        PALETTE.anthracite,
        PALETTE.petrolDark,
        0.98,
        PALETTE.champagne,
        0.8
      );
      // Sweeping illuminated arched glass vault
      g.fillStyle(PALETTE.warmLight, 0.88);
      g.fillEllipse(backIso.x, backIso.y - 42, 130, 74);
      g.lineStyle(3.5, PALETTE.champagne, 0.98);
      g.strokeEllipse(backIso.x, backIso.y - 42, 132, 76);
      // Vertical steel mullions across the illuminated vault
      g.lineStyle(2, PALETTE.anthraciteDark, 0.85);
      for (let m = -40; m <= 40; m += 20) {
        g.beginPath();
        g.moveTo(backIso.x + m, backIso.y - 74);
        g.lineTo(backIso.x + m, backIso.y - 12);
        g.strokePath();
      }
      // Subtle floor reflection on plaza
      g.fillStyle(PALETTE.warmLight, 0.22);
      g.fillEllipse(backIso.x, backIso.y + 16, 150, 32);
      break;
    }
  }
}

/**
 * Draws an architectural platform landmark / structure at local coordinates (0,0).
 */
export function drawLandmarkSprite(
  g: Phaser.GameObjects.Graphics,
  landmark: StationLandmark,
  _isDiscovered: boolean,
  isHovered: boolean,
  pulsePhase: number,
  timeState?: TimeOfDayState
) {
  g.clear();
  const c = Phaser.Display.Color.HexStringToColor(landmark.accentHex).color;
  const night = timeState?.nightFactor ?? 0;
  const hoverScale = isHovered ? 1.04 : 1;

  // Subtle architectural base pad
  g.fillStyle(PALETTE.nightBlueDeep, 0.18 + (isHovered ? 0.12 : 0));
  g.fillEllipse(0, 6, 52 * hoverScale, 24 * hoverScale);

  const pedTop = lerpHexColor(PALETTE.ivory, PALETTE.slateLight, night * 0.45);
  const pedLeft = lerpHexColor(PALETTE.sand, PALETTE.anthracite, night * 0.55);
  const pedRight = lerpHexColor(PALETTE.sandDark, PALETTE.nightBlue, night * 0.6);

  drawIsoBox(
    g,
    0,
    0,
    0,
    32 * hoverScale,
    32 * hoverScale,
    10,
    pedTop,
    pedLeft,
    pedRight,
    0.98,
    PALETTE.champagne,
    0.55
  );

  const glassCol = lerpHexColor(PALETTE.glassDay, PALETTE.warmLight, Math.min(1, night * 1.15));

  switch (landmark.visualKind) {
    case 'arch': {
      g.lineStyle(5, PALETTE.champagne, 0.96);
      g.strokeEllipse(0, -32, 36 * hoverScale, 44 * hoverScale);
      g.fillStyle(glassCol, 0.35 + night * 0.25);
      g.fillEllipse(0, -32, 26 * hoverScale, 34 * hoverScale);
      break;
    }
    case 'pillar':
    case 'project_tower': {
      drawIsoBox(
        g,
        0,
        0,
        10,
        22 * hoverScale,
        22 * hoverScale,
        44 * hoverScale,
        pedTop,
        c,
        PALETTE.anthracite,
        0.96,
        PALETTE.champagne,
        0.5
      );
      g.fillStyle(glassCol, 0.85);
      g.fillRect(-5, -48 * hoverScale, 10, 20 * hoverScale);
      break;
    }
    case 'beacon':
    case 'ai_prism':
    case 'data_core': {
      drawIsoBox(
        g,
        0,
        0,
        10,
        22 * hoverScale,
        22 * hoverScale,
        24,
        c,
        PALETTE.anthracite,
        PALETTE.petrolDark,
        0.96
      );
      const bob = Math.sin(pulsePhase * 2) * 2.5;
      g.fillStyle(glassCol, 0.9);
      g.fillRoundedRect(-11, -54 + bob, 22, 16, 2);
      g.lineStyle(1.8, PALETTE.champagne, 0.95);
      g.strokeRoundedRect(-11, -54 + bob, 22, 16, 2);
      break;
    }
    case 'lab_console':
    case 'holo_screen':
    case 'cv_kiosk': {
      drawIsoBox(
        g,
        0,
        0,
        10,
        26 * hoverScale,
        18 * hoverScale,
        24,
        pedTop,
        PALETTE.anthracite,
        PALETTE.petrol,
        0.96
      );
      g.fillStyle(glassCol, 0.78);
      g.fillRoundedRect(-18 * hoverScale, -58, 36 * hoverScale, 24, 3);
      g.lineStyle(1.8, PALETTE.champagne, 0.95);
      g.strokeRoundedRect(-18 * hoverScale, -58, 36 * hoverScale, 24, 3);
      break;
    }
    case 'trophy_case': {
      drawIsoBox(
        g,
        0,
        0,
        10,
        26 * hoverScale,
        26 * hoverScale,
        40,
        PALETTE.champagneLight,
        glassCol,
        PALETTE.petrol,
        0.55,
        PALETTE.champagne,
        0.95
      );
      g.fillStyle(PALETTE.champagne, 1);
      g.fillCircle(0, -32, 8);
      g.fillRect(-2.5, -24, 5, 10);
      break;
    }
    case 'observatory':
    case 'contact_pavilion': {
      drawIsoBox(
        g,
        0,
        0,
        10,
        30 * hoverScale,
        30 * hoverScale,
        28,
        pedTop,
        PALETTE.slate,
        PALETTE.petrol,
        0.97
      );
      g.fillStyle(glassCol, 0.85);
      g.fillCircle(0, -40, 15 * hoverScale);
      g.lineStyle(2, PALETTE.champagne, 0.95);
      g.strokeEllipse(0, -40, 38 * hoverScale, 13);
      break;
    }
  }
}

/**
 * Draws the sleek, realistic 3-car contemporary high-speed express train articulated along the rail spline.
 */
export function drawFuturisticTrain(
  g: Phaser.GameObjects.Graphics,
  trainT: number,
  doorOpenFactor: number,
  speedNorm: number,
  timeState?: TimeOfDayState
) {
  g.clear();
  const localTime = timeState ?? getTimeOfDayState(trainT);
  const night = localTime.nightFactor;

  const carOffsets = [0, -0.0132, -0.0264];
  const samples: RailSample[] = carOffsets.map((off) =>
    sampleRailAt(Math.max(0.001, Math.min(0.999, trainT + off)))
  );

  for (let idx = samples.length - 1; idx >= 0; idx--) {
    const s = samples[idx];
    const isLead = idx === 0;
    const isMiddle = idx === 1;

    const len = isLead ? 46 : 42;
    const width = 15;
    const height = 22;

    const ux = s.dirX;
    const uy = s.dirY;
    const nx = -uy;
    const ny = ux;

    const cx = s.isoX;
    const cy = s.isoY - 6;

    // Ground shadow
    g.fillStyle(PALETTE.nightBlueDeep, 0.34 + night * 0.14);
    g.fillEllipse(cx + localTime.shadowOffsetX * 0.15, s.isoY + 5, len * 1.9, 22);

    const frontX = cx + ux * (isLead ? len * 1.18 : len);
    const frontY = cy + uy * (isLead ? len * 1.18 : len);
    const backX = cx - ux * len;
    const backY = cy - uy * len;

    // Lower skirt hull (anthracite/petrol)
    g.fillStyle(PALETTE.petrolDark, 1);
    g.beginPath();
    g.moveTo(backX + nx * width, backY + ny * width + 6);
    g.lineTo(frontX + nx * (isLead ? 7 : width), frontY + ny * (isLead ? 7 : width) + 6);
    g.lineTo(frontX + nx * (isLead ? 7 : width), frontY + ny * (isLead ? 7 : width) - height + 8);
    g.lineTo(backX + nx * width, backY + ny * width - height + 8);
    g.closePath();
    g.fillPath();

    // Brushed ivory main carriage body
    const bodyCol = lerpHexColor(PALETTE.ivory, 0xd8dce0, night * 0.3);
    g.fillStyle(bodyCol, 1);
    g.beginPath();
    g.moveTo(backX + nx * width, backY + ny * width - 2);
    g.lineTo(frontX + nx * (isLead ? 7 : width), frontY + ny * (isLead ? 7 : width) - 2);
    g.lineTo(frontX - nx * (isLead ? 4 : width * 0.5), frontY - ny * (isLead ? 4 : width * 0.5) - height);
    g.lineTo(backX - nx * (width * 0.5), backY - ny * (width * 0.5) - height);
    g.closePath();
    g.fillPath();

    // Aerodynamic anthracite roof crown
    g.fillStyle(PALETTE.anthracite, 1);
    g.beginPath();
    g.moveTo(backX - nx * width, backY - ny * width - height + 4);
    g.lineTo(frontX - nx * (isLead ? 5 : width), frontY - ny * (isLead ? 5 : width) - height + 4);
    g.lineTo(frontX + nx * (isLead ? 4 : width * 0.35), frontY + ny * (isLead ? 4 : width * 0.35) - height - 3);
    g.lineTo(backX + nx * (width * 0.35), backY + ny * (width * 0.35) - height - 3);
    g.closePath();
    g.fillPath();

    // Champagne-copper architectural livery stripe
    g.lineStyle(2.5, PALETTE.champagne, 0.98);
    g.beginPath();
    g.moveTo(backX + nx * width * 0.85, backY + ny * width * 0.85 - 4);
    g.lineTo(frontX + nx * (isLead ? 6 : width * 0.85), frontY + ny * (isLead ? 6 : width * 0.85) - 4);
    g.strokePath();

    // Passenger windows (cool tinted glass by day, warm interior lighting at dusk/night)
    const winCol = lerpHexColor(0x304c5c, PALETTE.warmLight, Math.min(1, night * 1.2));
    const winCount = isLead ? 2 : 3;
    for (let w = 0; w < winCount; w++) {
      const frac = -0.5 + ((w + 0.5) / winCount) * 1.05;
      const wx = cx + ux * (len * frac) + nx * (width * 0.45);
      const wy = cy + uy * (len * frac) + ny * (width * 0.45) - 11;
      g.fillStyle(winCol, 0.96);
      g.fillRoundedRect(wx - 7, wy - 4, 14, 7, 1.5);
      g.lineStyle(1, PALETTE.anthracite, 0.7);
      g.strokeRoundedRect(wx - 7, wy - 4, 14, 7, 1.5);
    }

    // Animated sliding passenger door on middle car
    if (isMiddle) {
      const doorBaseX = cx + nx * (width * 0.55);
      const doorBaseY = cy + ny * (width * 0.55) - 10;
      if (doorOpenFactor > 0.05) {
        g.fillStyle(PALETTE.warmLight, 0.92 * doorOpenFactor);
        g.fillRoundedRect(doorBaseX - 8, doorBaseY - 7, 16, 15, 1.5);
      }
      const slide = doorOpenFactor * 7;
      g.fillStyle(PALETTE.petrol, 0.98);
      g.fillRoundedRect(doorBaseX - 7 - slide, doorBaseY - 7, 6, 15, 1);
      g.fillRoundedRect(doorBaseX + 1 + slide, doorBaseY - 7, 6, 15, 1);
    }

    // Lead locomotive nose cone, cockpit glass & directional headlights
    if (isLead) {
      g.fillStyle(PALETTE.anthraciteDark, 0.96);
      g.fillEllipse(frontX - ux * 11, frontY - uy * 11 - 12, 16, 9);
      g.fillStyle(PALETTE.glassDay, 0.75);
      g.fillEllipse(frontX - ux * 10, frontY - uy * 10 - 13, 10, 5);

      // Headlight beam intensifies smoothly as dusk & night arrive
      const beamAlpha = 0.08 + speedNorm * 0.1 + night * 0.24;
      const beamLen = 90 + night * 75;
      g.fillStyle(PALETTE.warmLight, beamAlpha);
      g.fillTriangle(
        frontX,
        frontY - 6,
        frontX + ux * beamLen + nx * (22 + night * 14),
        frontY + uy * beamLen + ny * (22 + night * 14) - 4,
        frontX + ux * beamLen - nx * (22 + night * 14),
        frontY + uy * beamLen - ny * (22 + night * 14) - 4
      );
      g.fillStyle(PALETTE.champagneLight, 0.98);
      g.fillCircle(frontX, frontY - 6, 3.8);
    }
  }
}

/**
 * Draws the realistic, poised female protagonist:
 * warm brown skin, voluminous dark curly hair, tailored ivory blazer over petrol-blue & anthracite outfit.
 */
export function drawProtagonist(
  g: Phaser.GameObjects.Graphics,
  walkPhase: number,
  isWalking: boolean,
  facingRight: boolean,
  timeState?: TimeOfDayState
) {
  g.clear();
  const dir = facingRight ? 1 : -1;
  const bob = isWalking ? Math.abs(Math.sin(walkPhase * 8)) * 3 : Math.sin(walkPhase * 2) * 0.8;
  const legSwing = isWalking ? Math.sin(walkPhase * 8) * 4.5 : 0;
  const shadowAlpha = timeState?.shadowAlpha ?? 0.25;

  // Ground shadow
  g.fillStyle(PALETTE.nightBlueDeep, shadowAlpha + 0.08);
  g.fillEllipse(2, 4, 22, 9);

  // Tailored anthracite trousers & boots
  g.lineStyle(4.2, PALETTE.anthracite, 1);
  g.beginPath();
  g.moveTo(-3.8, -14 - bob);
  g.lineTo(-3.8 + legSwing * 0.6, 2);
  g.moveTo(3.8, -14 - bob);
  g.lineTo(3.8 - legSwing * 0.6, 2);
  g.strokePath();

  g.fillStyle(PALETTE.anthraciteDark, 1);
  g.fillCircle(-3.8 + legSwing * 0.6, 2, 2.3);
  g.fillCircle(3.8 - legSwing * 0.6, 2, 2.3);

  // Tailored ivory architectural blazer & petrol top
  g.fillStyle(PALETTE.ivory, 1);
  g.fillRoundedRect(-8.5, -35 - bob, 17, 22, 4);
  g.fillStyle(PALETTE.petrol, 0.98);
  g.fillRoundedRect(-4, -35 - bob, 8, 17, 2);
  // Subtle champagne belt clasp
  g.fillStyle(PALETTE.champagne, 1);
  g.fillRect(-7.5, -21 - bob, 15, 2);
  g.fillCircle(1.5 * dir, -28 - bob, 1.8);

  // Arms
  g.lineStyle(3.6, PALETTE.skinBrown, 1);
  g.beginPath();
  g.moveTo(-7.5, -32 - bob);
  g.lineTo(-10 - legSwing * 0.35, -20 - bob);
  g.moveTo(7.5, -32 - bob);
  g.lineTo(10 + legSwing * 0.35, -20 - bob);
  g.strokePath();

  // Voluminous dark curly hair halo
  g.fillStyle(PALETTE.hairDark, 1);
  g.fillCircle(0, -49 - bob, 12);
  g.fillCircle(-7.5, -46 - bob, 7);
  g.fillCircle(7.5, -46 - bob, 7);
  g.fillCircle(-4.5, -55 - bob, 6.5);
  g.fillCircle(4.5, -55 - bob, 6.5);

  // Warm brown face
  g.fillStyle(PALETTE.skinBrown, 1);
  g.fillCircle(0, -46 - bob, 8);

  // Eyes & warm composed expression
  g.fillStyle(PALETTE.hairDark, 1);
  g.fillCircle(-2.8 + dir * 1.1, -46 - bob, 1.2);
  g.fillCircle(2.8 + dir * 1.1, -46 - bob, 1.2);
  g.lineStyle(1.2, 0x5c2b1e, 0.9);
  g.beginPath();
  g.arc(dir * 0.8, -43 - bob, 2.4, 0.25, Math.PI - 0.25, false);
  g.strokePath();

  // Subtle champagne stud earrings
  g.fillStyle(PALETTE.champagneLight, 1);
  g.fillCircle(-7.8, -45 - bob, 1.4);
  g.fillCircle(7.8, -45 - bob, 1.4);
}
