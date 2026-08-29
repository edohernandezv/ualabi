import * as THREE from 'three';

/** Poligono con esquinas redondeadas. La plasticina no sostiene puntas. */
export function roundedShape(pts, r) {
  const n = pts.length;
  const v = (i) => new THREE.Vector2(...pts[(i + n) % n]);
  const shape = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const p0 = v(i - 1), p1 = v(i), p2 = v(i + 1);
    const d0 = new THREE.Vector2().subVectors(p0, p1);
    const d2 = new THREE.Vector2().subVectors(p2, p1);
    // nunca comer mas del 45% de la arista mas corta
    const r0 = Math.min(r, d0.length() * 0.45);
    const r2 = Math.min(r, d2.length() * 0.45);
    const a = p1.clone().addScaledVector(d0.normalize(), r0);
    const b = p1.clone().addScaledVector(d2.normalize(), r2);
    i === 0 ? shape.moveTo(a.x, a.y) : shape.lineTo(a.x, a.y);
    shape.quadraticCurveTo(p1.x, p1.y, b.x, b.y);
  }
  shape.closePath();
  return shape;
}

/** Superelipse. n=4 se acerca al redondeo de iOS. */
export function squirclePoints(size, n = 4.2, seg = 120) {
  const pts = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    pts.push([
      Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * size,
      Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * size,
    ]);
  }
  return pts;
}

export function extrudeClay(shape, g, depth = g.depth) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: g.bevelThickness,
    bevelSize: g.bevelSize,
    bevelOffset: 0,
    bevelSegments: g.bevelSegments,
    curveSegments: g.curveSegments,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export function frameShape(g) {
  const outer = roundedShape(squirclePoints(g.tileSize + g.frameWidth, g.squircleN), 0.02);
  const inner = new THREE.Path(
    squirclePoints(g.tileSize, g.squircleN).map(([x, y]) => new THREE.Vector2(x, y))
  );
  inner.closePath();
  outer.holes.push(inner);
  return outer;
}

/** Encoge hacia el centroide para abrir el hueco entre piezas. */
export function shrink(pts, gap) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return pts.map(([x, y]) => {
    const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1;
    return [x - (dx / l) * gap, y - (dy / l) * gap];
  });
}

/** Los tres triangulos de la marca, en coordenadas del tile (-1..1). */
export const TRIS = [
  [[-0.62, 0.86], [0.02, 0.86], [0.02, 0.30]],
  [[0.24, 0.80], [0.94, 0.24], [0.94, -0.12], [0.18, -0.02]],
  [[-0.78, -0.12], [0.40, -0.68], [-0.78, -1.00]],
];
