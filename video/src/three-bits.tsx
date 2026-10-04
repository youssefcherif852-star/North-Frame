import React, {useMemo} from 'react';
import * as THREE from 'three';
import {continueRender, delayRender, staticFile} from 'remotion';
import {useThree} from '@react-three/fiber';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader.js';
import {LOGO_BOX, LOGO_D, LOGO_SPLIT_X} from './logo';
import {IVORY, INK} from './theme';
import {lerp, prog, rand, inOut, back} from './lib';

/** Drifting point field that streams toward the camera. */
export const Field: React.FC<{f: number; color: string; count?: number; speed?: number; size?: number}> = ({
  f,
  color,
  count = 1400,
  speed = 0.06,
  size = 0.035,
}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return g;
  }, [count]);
  const arr = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < count; i++) {
    const depth = 40;
    const z0 = rand(i * 3 + 2) * depth;
    const z = ((z0 + f * speed) % depth) - depth + 6;
    arr[i * 3] = (rand(i * 3) - 0.5) * 30;
    arr[i * 3 + 1] = (rand(i * 3 + 1) - 0.5) * 18;
    arr[i * 3 + 2] = z;
  }
  geo.attributes.position.needsUpdate = true;
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} size={size} sizeAttenuation />
    </points>
  );
};

/** A flat bar between two points, used to build the mark in 3D. */
const Bar: React.FC<{a: [number, number]; b: [number, number]; w: number; color: string; grow?: number}> = ({
  a,
  b,
  w,
  color,
  grow = 1,
}) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) * grow;
  const ang = Math.atan2(dy, dx);
  const cx = a[0] + Math.cos(ang) * len * 0.5;
  const cy = a[1] + Math.sin(ang) * len * 0.5;
  if (len <= 0.0001) return null;
  return (
    <mesh position={[cx, cy, 0]} rotation={[0, 0, ang]}>
      <boxGeometry args={[len + w, w, w]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

/**
 * The North Frame mark in 3D. Four parts fly in from depth and lock into place
 * between `start` and `start+60`; the diagonal then draws.
 */
export const Mark3D: React.FC<{f: number; start: number; color?: string; scale?: number; spin?: number}> = ({
  f,
  start,
  color = IVORY,
  scale = 1,
  spin = 0,
}) => {
  const s = 2;
  // mark on a 32-unit grid: frame M6 26 V6 h20 v20, diagonal 6,26 → 26,6 (y flipped)
  const P = (x: number, y: number): [number, number] => [((x - 16) / 10) * s, ((16 - y) / 10) * s];
  const parts: {a: [number, number]; b: [number, number]; seed: number; t: number}[] = [
    {a: P(6, 26), b: P(6, 6), seed: 1, t: 0},
    {a: P(6, 6), b: P(26, 6), seed: 2, t: 8},
    {a: P(26, 6), b: P(26, 26), seed: 3, t: 16},
  ];
  const w = 0.16;
  const diag = prog(f, start + 44, start + 64, inOut);
  return (
    <group scale={scale} rotation={[0, spin, 0]}>
      {parts.map((p) => {
        const k = prog(f, start + p.t, start + p.t + 34, back);
        const ox = (rand(p.seed) - 0.5) * 16;
        const oy = (rand(p.seed + 9) - 0.5) * 10;
        const oz = -30 + rand(p.seed + 4) * 10;
        return (
          <group
            key={p.seed}
            position={[lerp(ox, 0, k), lerp(oy, 0, k), lerp(oz, 0, Math.min(1, k))]}
            rotation={[lerp(rand(p.seed + 1) * 6, 0, k), lerp(rand(p.seed + 2) * 6, 0, k), lerp(rand(p.seed + 3) * 3, 0, k)]}
          >
            <Bar a={p.a} b={p.b} w={w} color={color} />
          </group>
        );
      })}
      {diag > 0 && <Bar a={P(6, 26)} b={P(26, 6)} w={w} color={color} grow={diag} />}
    </group>
  );
};

/**
 * A hollow outlined tube (the site's ribbon): ink shell behind, fill in front,
 * one highlight line. Grows from its start as `p` goes 0→1.
 */
export const Ribbon: React.FC<{
  points: [number, number, number][];
  radius: number;
  p: number;
  fill: string;
  line: string;
  outline?: number;
}> = ({points, radius, p, fill, line, outline = 0.05}) => {
  const {curve, outer, inner, hi} = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(points.map((q) => new THREE.Vector3(...q)), false, 'catmullrom', 0.5);
    const seg = 400;
    const outerG = new THREE.TubeGeometry(c, seg, radius + outline, 32, false);
    const innerG = new THREE.TubeGeometry(c, seg, radius, 32, false);
    const hiPts = c.getPoints(seg).map((v, i, all) => {
      const t = all[Math.min(i + 1, all.length - 1)].clone().sub(all[Math.max(i - 1, 0)]).normalize();
      const n = new THREE.Vector3(0, 0, 1).cross(t).normalize();
      return v.clone().add(n.multiplyScalar(radius * 0.45)).add(new THREE.Vector3(0, 0, radius * 0.85));
    });
    const hiG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hiPts), seg, outline * 0.6, 8, false);
    return {curve: c, outer: outerG, inner: innerG, hi: hiG};
  }, [points, radius, outline]);
  void curve;
  const setRange = (g: THREE.TubeGeometry, radial: number) => {
    const n = Math.floor(400 * Math.max(0, Math.min(1, p))) * radial * 6;
    g.setDrawRange(0, n);
  };
  setRange(outer, 32);
  setRange(inner, 32);
  setRange(hi, 8);
  return (
    <group>
      <mesh geometry={outer}>
        <meshBasicMaterial color={line} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={inner}>
        <meshBasicMaterial color={fill} />
      </mesh>
      <mesh geometry={hi}>
        <meshBasicMaterial color={line} />
      </mesh>
    </group>
  );
};

/** Loads textures once and holds the render until they are ready. */
const cache = new Map<string, THREE.Texture>();
export const useTextures = (files: string[]) => {
  const [handle] = React.useState(() => {
    const missing = files.filter((f) => !cache.has(f));
    return missing.length ? delayRender('textures') : null;
  });
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (handle === null) return;
    const loader = new THREE.TextureLoader();
    let left = files.length;
    files.forEach((file) => {
      if (cache.has(file)) {
        if (--left === 0) {
          force(1);
          continueRender(handle);
        }
        return;
      }
      loader.load(staticFile(file), (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        cache.set(file, t);
        if (--left === 0) {
          force(1);
          continueRender(handle);
        }
      });
    });
  }, [handle, files]);
  return files.map((f) => cache.get(f) ?? null);
};

export {INK, IVORY};

/** Drives the camera every frame (the Canvas `camera` prop only applies on mount). */
export const Cam: React.FC<{z: number; x?: number; y?: number; fov: number}> = ({x = 0, y = 0, z, fov}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(x, y, z);
  camera.fov = fov;
  camera.lookAt(x, y, z - 1);
  camera.updateProjectionMatrix();
  return null;
};

const svgShapes = (d: string) => {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
  return data.paths.flatMap((p) => SVGLoader.createShapes(p));
};

/** Keeps the triangles whose centre lies on one side of x = split, preserving material groups. */
const splitGeometry = (src: THREE.BufferGeometry, split: number, left: boolean) => {
  const pos = src.getAttribute('position') as THREE.BufferAttribute;
  const out: number[] = [];
  const groups: {start: number; count: number; materialIndex: number}[] = [];
  const srcGroups = src.groups.length ? src.groups : [{start: 0, count: pos.count, materialIndex: 0}];
  for (const gr of srcGroups) {
    const start = out.length / 3;
    for (let i = gr.start; i < gr.start + gr.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      if (cx < split === left) for (let k = 0; k < 3; k++) out.push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k));
    }
    groups.push({start, count: out.length / 3 - start, materialIndex: gr.materialIndex ?? 0});
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  groups.forEach((gr) => g.addGroup(gr.start, gr.count, gr.materialIndex));
  return g;
};

/**
 * One letter of the extruded logo: ivory face, ink sides, ivory edge lines (the
 * site's outlined look). The traced letters are a single shape, so N keeps the
 * triangles left of the split and F the rest.
 */
const Letter: React.FC<{side: 'N' | 'F'}> = ({side}) => {
  const {geo, edges} = useMemo(() => {
    const whole = new THREE.ExtrudeGeometry(svgShapes(LOGO_D), {
      depth: 16,
      bevelEnabled: true,
      bevelThickness: 1.2,
      bevelSize: 0.15,
      bevelSegments: 1,
      curveSegments: 10,
    });
    const g = splitGeometry(whole.toNonIndexed(), LOGO_SPLIT_X, side === 'N');
    // centre on the letters' box, flip SVG's y-down
    g.translate(-(LOGO_BOX.x + LOGO_BOX.w / 2), -(LOGO_BOX.y + LOGO_BOX.h / 2), -8);
    g.scale(1, -1, 1);
    g.computeVertexNormals();
    return {geo: g, edges: new THREE.EdgesGeometry(g, 25)};
  }, [side]);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial attach="material-0" color={IVORY} side={THREE.DoubleSide} />
        <meshBasicMaterial attach="material-1" color={INK} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={IVORY} />
      </lineSegments>
    </group>
  );
};

/**
 * The NF logo in 3D. The tile's four sides fly in and lock into a square,
 * then N and F arrive from depth on either side and set together.
 * Letters are 4 world units wide at scale 1.
 */
export const Logo3D: React.FC<{f: number; start: number; scale?: number}> = ({f, start, scale = 1}) => {
  const k = 4 / LOGO_BOX.w;
  const half = (272 / 2) * k;
  const w = 0.05;
  const sides: {a: [number, number]; b: [number, number]; seed: number; t: number}[] = [
    {a: [-half, -half], b: [-half, half], seed: 11, t: 0},
    {a: [-half, half], b: [half, half], seed: 12, t: 4},
    {a: [half, half], b: [half, -half], seed: 13, t: 8},
    {a: [half, -half], b: [-half, -half], seed: 14, t: 12},
  ];
  const n = prog(f, start + 18, start + 44, back);
  const fl = prog(f, start + 24, start + 50, back);
  const settle = prog(f, start + 44, start + 70, inOut);
  return (
    <group scale={scale}>
      {sides.map((p) => {
        const q = prog(f, start + p.t, start + p.t + 26, back);
        return (
          <group
            key={p.seed}
            position={[lerp((rand(p.seed) - 0.5) * 18, 0, q), lerp((rand(p.seed + 9) - 0.5) * 12, 0, q), lerp(-26, 0, Math.min(1, q))]}
            rotation={[lerp(rand(p.seed + 1) * 5, 0, q), lerp(rand(p.seed + 2) * 5, 0, q), lerp(rand(p.seed + 3) * 3, 0, q)]}
          >
            <Bar a={p.a} b={p.b} w={w} color={IVORY} />
          </group>
        );
      })}
      <group scale={[k, k, k]} rotation={[0, lerp(0.5, 0, settle), 0]}>
        <group position={[lerp(-160, 0, n), lerp(40, 0, n), lerp(-500, 0, Math.min(1, n))]} rotation={[0, lerp(-2.4, 0, n), 0]}>
          <Letter side="N" />
        </group>
        <group position={[lerp(160, 0, fl), lerp(-40, 0, fl), lerp(-500, 0, Math.min(1, fl))]} rotation={[0, lerp(2.4, 0, fl), 0]}>
          <Letter side="F" />
        </group>
      </group>
    </group>
  );
};
