import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows, SoftShadows } from '@react-three/drei';
import { ClayMaterial } from './ClayMaterial';
import { roundedShape, squirclePoints, extrudeClay, frameShape, shrink, TRIS } from './clayGeometry';

/** El logo en plasticina: marco, base y tres triangulos separados
 *  por un hueco. Al tocar una pieza, se hunde y vuelve sola. */
export function Logo3D({ p }) {
  const g = p.geometry;
  const S = g.tileSize;
  const group = useRef();

  const frameGeo = useMemo(() => extrudeClay(frameShape(g), g, g.frameDepth), [g]);
  const baseGeo = useMemo(
    () => extrudeClay(roundedShape(squirclePoints(S - 0.02, g.squircleN), 0.02), g),
    [g, S]
  );
  const triGeos = useMemo(
    () => TRIS.map((pts) =>
      extrudeClay(
        roundedShape(
          shrink(pts.map(([x, y]) => [x * S, y * S]), g.gap * S * 0.5),
          g.cornerRadius * S * 0.16
        ),
        g
      )
    ),
    [g, S]
  );

  // hundimiento por pieza, se relaja solo
  const [press, setPress] = useState({});
  const dents = useRef({});

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = p.camera.groupTilt[1] + Math.sin(t * 0.16) * 0.10;
      group.current.rotation.x = p.camera.groupTilt[0] + Math.sin(t * 0.13) * 0.035;
    }
    let changed = false;
    for (const k of Object.keys(dents.current)) {
      const d = dents.current[k];
      const next = d * Math.pow(0.06, dt);
      dents.current[k] = next < 0.002 ? 0 : next;
      if (dents.current[k] !== d) changed = true;
    }
    if (changed) setPress({ ...dents.current });
  });

  const poke = (key) => () => {
    dents.current[key] = 1;
    setPress({ ...dents.current });
  };

  const sink = (key) => -(press[key] || 0) * 0.09;

  return (
    <>
      <SoftShadows samples={12} size={26} focus={0.85} />

      <group ref={group} rotation={p.camera.groupTilt}>
        <mesh geometry={frameGeo} castShadow receiveShadow
              onPointerDown={poke('frame')}
              position={[0, sink('frame'), 0]}>
          <ClayMaterial color={p.palette.frame}
            material={{ ...p.material, roughness: 0.92 }}
            sss={{ color: '#3a2b3d', intensity: 0.10, power: 3.2 }}
            noise={p.noise} />
        </mesh>

        <mesh geometry={baseGeo} castShadow receiveShadow
              onPointerDown={poke('base')}
              position={[0, 0.06 + sink('base'), 0]}>
          <ClayMaterial color={p.palette.teal}
            material={p.material}
            sss={{ color: '#5fd0e6', intensity: 0.14, power: 3 }}
            noise={p.noise} />
        </mesh>

        {triGeos.map((geo, i) => (
          <mesh key={i} geometry={geo} castShadow receiveShadow
                onPointerDown={poke('t' + i)}
                // z desigual y jitter: la simetria perfecta mata el look
                position={[0, 0.06 + 0.16 + (i % 2) * 0.012 + sink('t' + i), 0]}
                rotation={[0, (i % 2 ? 1 : -1) * 0.007, 0]}>
            <ClayMaterial color={p.palette.purple}
              material={p.material}
              sss={{ color: '#c07ad4', intensity: 0.12, power: 3 }}
              noise={p.noise} />
          </mesh>
        ))}

        <ContactShadows position={[0, -0.32, 0]} opacity={p.lights.shadowOpacity}
          blur={2.4} scale={16} far={2} resolution={1024} />
      </group>

      <ambientLight intensity={p.lights.ambient} />
      <directionalLight castShadow position={p.lights.keyPosition}
        intensity={p.lights.keyIntensity} shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005} shadow-normalBias={0.02} />

      {/* softbox cenital: da el highlight ancho sin HDRI externo */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={p.lights.softboxIntensity}
          scale={p.lights.softboxScale} position={p.lights.softboxPos}
          rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.1} scale={[10, 10]}
          position={[4, 4, -6]} rotation-y={Math.PI} />
      </Environment>
    </>
  );
}
