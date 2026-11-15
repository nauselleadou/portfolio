import Phaser from 'phaser';

export interface IsoPoint {
  x: number;
  y: number;
}

export interface WorldPoint {
  wx: number;
  wy: number;
  wz: number;
}

/**
 * Projects 3D world coordinates (wx, wy, wz) into 2.5D isometric screen coordinates.
 */
export function worldToIso(wx: number, wy: number, wz = 0): IsoPoint {
  return {
    x: (wx - wy) * 0.85,
    y: (wx + wy) * 0.44 - wz,
  };
}

/**
 * Draws a filled 3D isometric box centered at (wx, wy) resting on elevation wz.
 */
export function drawIsoBox(
  g: Phaser.GameObjects.Graphics,
  wx: number,
  wy: number,
  wz: number,
  sizeX: number,
  sizeY: number,
  height: number,
  topColor: number,
  leftColor: number,
  rightColor: number,
  alpha = 1,
  strokeColor?: number,
  strokeAlpha = 0.25
) {
  const hx = sizeX / 2;
  const hy = sizeY / 2;

  // Top face corners
  const tN = worldToIso(wx - hx, wy - hy, wz + height);
  const tE = worldToIso(wx + hx, wy - hy, wz + height);
  const tS = worldToIso(wx + hx, wy + hy, wz + height);
  const tW = worldToIso(wx - hx, wy + hy, wz + height);

  // Bottom face corners
  const bE = worldToIso(wx + hx, wy - hy, wz);
  const bS = worldToIso(wx + hx, wy + hy, wz);
  const bW = worldToIso(wx - hx, wy + hy, wz);

  // Left visible face (W -> S)
  g.fillStyle(leftColor, alpha);
  g.beginPath();
  g.moveTo(tW.x, tW.y);
  g.lineTo(tS.x, tS.y);
  g.lineTo(bS.x, bS.y);
  g.lineTo(bW.x, bW.y);
  g.closePath();
  g.fillPath();

  // Right visible face (S -> E)
  g.fillStyle(rightColor, alpha);
  g.beginPath();
  g.moveTo(tS.x, tS.y);
  g.lineTo(tE.x, tE.y);
  g.lineTo(bE.x, bE.y);
  g.lineTo(bS.x, bS.y);
  g.closePath();
  g.fillPath();

  // Top face
  g.fillStyle(topColor, alpha);
  g.beginPath();
  g.moveTo(tN.x, tN.y);
  g.lineTo(tE.x, tE.y);
  g.lineTo(tS.x, tS.y);
  g.lineTo(tW.x, tW.y);
  g.closePath();
  g.fillPath();

  if (strokeColor !== undefined) {
    g.lineStyle(1.2, strokeColor, strokeAlpha);
    g.beginPath();
    g.moveTo(tN.x, tN.y);
    g.lineTo(tE.x, tE.y);
    g.lineTo(tS.x, tS.y);
    g.lineTo(tW.x, tW.y);
    g.closePath();
    g.strokePath();
  }
}

/**
 * Draws a flat isometric diamond / platform slab on elevation wz.
 */
export function drawIsoDiamond(
  g: Phaser.GameObjects.Graphics,
  wx: number,
  wy: number,
  wz: number,
  sizeX: number,
  sizeY: number,
  fillColor: number,
  alpha = 1,
  strokeColor?: number,
  strokeWidth = 1.5
) {
  const hx = sizeX / 2;
  const hy = sizeY / 2;
  const pN = worldToIso(wx - hx, wy - hy, wz);
  const pE = worldToIso(wx + hx, wy - hy, wz);
  const pS = worldToIso(wx + hx, wy + hy, wz);
  const pW = worldToIso(wx - hx, wy + hy, wz);

  g.fillStyle(fillColor, alpha);
  g.beginPath();
  g.moveTo(pN.x, pN.y);
  g.lineTo(pE.x, pE.y);
  g.lineTo(pS.x, pS.y);
  g.lineTo(pW.x, pW.y);
  g.closePath();
  g.fillPath();

  if (strokeColor !== undefined) {
    g.lineStyle(strokeWidth, strokeColor, 0.7);
    g.strokePath();
  }
}
