// Unica fuente de verdad estetica. Solo numeros, ninguna logica.
// Es lo unico que se toca para ajustar el look.
export const PRESET = {
  palette: {
    // La placa va al turquesa profundo: sobre el hero celeste, el
    // turquesa de marca a plena luz se fundia con el fondo.
    teal:   '#17677B',
    purple: '#8B3A9B',
    frame:  '#1C1A1D',   // negro calido, nunca #000
  },

  geometry: {
    depth:          0.30,
    bevelThickness: 0.085,
    bevelSize:      0.085,
    bevelSegments:  12,
    curveSegments:  32,
    cornerRadius:   0.16,  // subir si se ve cortado con cuchillo
    gap:            0.030, // separacion entre piezas: el parametro clave
    frameDepth:     0.46,
    frameWidth:     0.34,
    tileSize:       3.2,
    squircleN:      4.2,
  },

  material: {
    roughness:          0.86,  // mate. Sobre 0.9 se ve yeso
    metalness:          0.0,
    clearcoat:          0.06,  // apenas un velo graso
    clearcoatRoughness: 0.85,
    sheen:              0.35,
    sheenRoughness:     1.0,
    normalScale:        0.30,
    envMapIntensity:    0.9,
  },

  noise: { size: 512, coarse: 0.62, fine: 0.5, repeat: 0.42 },

  camera: {
    fov: 19,
    position: [0.9, 28, 2.8],
    groupTilt: [-0.035, 0.02, 0.0],
  },

  lights: {
    ambient: 0.55,
    softboxIntensity: 3.2,
    softboxScale: [14, 14],
    softboxPos: [-2.5, 8, 3],
    keyIntensity: 0.9,
    keyPosition: [-4, 9, 4],
    shadowOpacity: 0.22,
  },

  post: {
    aoIntensity: 4.2,   // ALTO: es lo que dibuja las juntas
    aoRadius:    0.16,  // CORTO: un radio largo ensucia las caras planas
    aoColor:     '#0d2a33',
    bloomIntensity: 0.10,
    bloomThreshold: 0.95,
    vignette: 0.30,
    grain:    0.028,
    exposure: 1.05,
  },
};
