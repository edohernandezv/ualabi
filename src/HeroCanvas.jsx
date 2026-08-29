import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise, N8AO } from '@react-three/postprocessing';
import { PRESET } from './preset';
import { Logo3D } from './Logo3D';

export default function HeroCanvas() {
  const p = PRESET;
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ fov: p.camera.fov, position: p.camera.position, near: 1, far: 60 }}
      onCreated={({ gl, camera }) => {
        // Neutral, no ACES: ACES apaga los morados y cianes saturados
        gl.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = p.post.exposure;
        camera.lookAt(0, 0, 0);
      }}
    >
      <Logo3D p={p} />
      <EffectComposer disableNormalPass multisampling={4}>
        {/* el AO es el efecto dominante: dibuja las juntas entre piezas */}
        <N8AO color={p.post.aoColor} aoRadius={p.post.aoRadius}
          intensity={p.post.aoIntensity} distanceFalloff={0.6} quality="performance" />
        <Bloom intensity={p.post.bloomIntensity}
          luminanceThreshold={p.post.bloomThreshold} mipmapBlur />
        <Vignette darkness={p.post.vignette} offset={0.28} />
        <Noise opacity={p.post.grain} />
      </EffectComposer>
    </Canvas>
  );
}
