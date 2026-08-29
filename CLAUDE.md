# ualabi

Landing estática con un hero 3D en React Three Fiber. El resto de la
página es HTML y CSS en `index.html`; Vite la usa como entry y solo
monta React dentro de `#blob`.

## Build

```
npm install
npm run dev      # desarrollo
npm run build    # produce dist/
```

Cloudflare Pages: comando `npm run build`, directorio de salida `dist`.
Antes de la migración servía el repo tal cual, así que ese ajuste es
obligatorio o el deploy publica el HTML sin el bundle.

## Reglas del hero 3D

Para ajustes de LOOK: modificar SOLO `src/preset.js`. No tocar
`Logo3D.jsx` ni `ClayMaterial.jsx`.

Para cambios de ESTRUCTURA (geometría, layout, interacción): se puede
tocar `Logo3D.jsx`.

Nunca inventar props de drei. Verificar contra las versiones fijas del
package.json: drei rompe API entre versiones menores, por eso están
pinneadas sin `^`.

## Definición del look plasticina

1. Bisel visible en toda arista (radius >= 0.2 del lado menor).
2. roughness 0.55-0.90. Nunca 1.0, que es yeso; nunca <0.4, que es ABS.
3. clearcoat 0.03-0.35 con clearcoatRoughness alto: brillo grasoso, no espejo.
4. Ninguna luz puntual dura. Solo área o direccional suave más entorno.
5. El AO en post es el efecto dominante. Si el modelo se ve flotando,
   subir aoIntensity antes que tocar las luces.
6. Asimetría intencional: escalas 0.97-1.03, rotaciones 2-8°. La
   simetría perfecta mata el look.
7. Las piezas no se tocan. El hueco entre ellas separa los colores.
8. Esquinas redondeadas en XY: la plasticina no sostiene puntas.

## Prohibido

- MeshStandardMaterial pelado.
- normalScale > 0.35, que se ve roca.
- transmission > 0.1, que se ve gomita.
- ACESFilmicToneMapping: apaga los morados y cianes de la marca. Va
  NeutralToneMapping.
- Sombras duras (shadow-radius 0).

## Accesibilidad

Todos los pares de color pasan WCAG AA. Verificar antes de cambiar
cualquier color: el hero es tinta sobre turquesa (6.08:1) y la placa
del logo va oscurecida porque el turquesa de marca sobre el hero
daba 1.00:1, o sea el mismo color.

El 3D es decorativo: no se monta bajo 1101px ni con
prefers-reduced-motion, y la página funciona sin él.
