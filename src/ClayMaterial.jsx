import * as THREE from 'three';
import { useMemo, useRef, useLayoutEffect } from 'react';

/** Normal map procedural: abolladuras grandes + grano de huella.
 *  Las UV de ExtrudeGeometry vienen en unidades de mundo (span ~6),
 *  asi que repeat va por debajo de 1 o el grano se vuelve invisible. */
function useClayNormalMap({ size, coarse, fine, repeat }) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);

    const rnd = (x, y) => {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };
    const smooth = (x, y, s) => {
      const xi = Math.floor(x * s), yi = Math.floor(y * s);
      const xf = x * s - xi, yf = y * s - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = rnd(xi, yi), b = rnd(xi + 1, yi);
      const cc = rnd(xi, yi + 1), d = rnd(xi + 1, yi + 1);
      return a * (1 - u) * (1 - v) + b * u * (1 - v) + cc * (1 - u) * v + d * u * v;
    };

    const h = new Float32Array(size * size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        h[y * size + x] =
          smooth(x / size, y / size, 8) * coarse +
          smooth(x / size, y / size, 48) * fine;

    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const l = h[y * size + ((x - 1 + size) % size)];
        const r = h[y * size + ((x + 1) % size)];
        const u = h[((y - 1 + size) % size) * size + x];
        const d = h[((y + 1) % size) * size + x];
        const n = new THREE.Vector3((l - r) * 2, (u - d) * 2, 1).normalize();
        img.data[i] = (n.x * 0.5 + 0.5) * 255;
        img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
        img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    return tex;
  }, [size, coarse, fine, repeat]);
}

export function ClayMaterial({ material, sss, noise, color, ...props }) {
  const normalMap = useClayNormalMap(noise);

  const uniforms = useRef({
    uSSSColor: { value: new THREE.Color(sss.color) },
    uSSSIntensity: { value: sss.intensity },
    uSSSPower: { value: sss.power },
  });

  useLayoutEffect(() => {
    uniforms.current.uSSSColor.value.set(sss.color);
    uniforms.current.uSSSIntensity.value = sss.intensity;
    uniforms.current.uSSSPower.value = sss.power;
  }, [sss.color, sss.intensity, sss.power]);

  const onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms.current);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        `uniform vec3  uSSSColor;
         uniform float uSSSIntensity;
         uniform float uSSSPower;
         void main() {`
      )
      .replace(
        '#include <opaque_fragment>',
        `// fake subsurface: fresnel invertido en los bordes
         float clayFres = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));
         outgoingLight += uSSSColor * pow(clayFres, uSSSPower) * uSSSIntensity;
         #include <opaque_fragment>`
      );
  };

  return (
    <meshPhysicalMaterial
      color={color}
      roughness={material.roughness}
      metalness={material.metalness}
      clearcoat={material.clearcoat}
      clearcoatRoughness={material.clearcoatRoughness}
      sheen={material.sheen}
      sheenRoughness={material.sheenRoughness}
      envMapIntensity={material.envMapIntensity}
      normalMap={normalMap}
      normalScale={[material.normalScale, material.normalScale]}
      onBeforeCompile={onBeforeCompile}
      customProgramCacheKey={() => 'clay-v1'}
      {...props}
    />
  );
}
