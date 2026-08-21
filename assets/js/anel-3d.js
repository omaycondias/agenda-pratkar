import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const mount = document.querySelector('.hero__visual');
if (!mount) throw new Error('Contêiner do anel 3D não encontrado.');
const mountRect = () => mount.getBoundingClientRect();

const settings = {
  particleCount: 7600, mobileParticleCount: 3600,
  radius: 1.34, tube: 0.055, particleSize: 0.25,
  mouseRadius: 0.78, mouseStrength: 0.30, mouseSmoothing: 0.052,
  noise: 0.026, glow: 0.42
};

const mobile = matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 0;
const count = mobile ? settings.mobileParticleCount : settings.particleCount;
const scene = new THREE.Scene();
const initialRect = mountRect();
const camera = new THREE.PerspectiveCamera(30, initialRect.width / initialRect.height, 0.1, 100);
camera.position.z = 7.35;
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.15 : 1.35));
renderer.setSize(initialRect.width, initialRect.height, false);
renderer.setClearColor(0x000000, 1);
mount.appendChild(renderer.domElement);

const positions = new Float32Array(count * 3), sizes = new Float32Array(count);
const seeds = new Float32Array(count), colors = new Float32Array(count);
for (let i = 0; i < count; i++) {
  const angle = Math.random() * Math.PI * 2;
  const band = Math.random() < 0.76 ? 0.74 + Math.random() * 0.26 : Math.random();
  const around = Math.random() * Math.PI * 2;
  const bodyWarp = 0.008 * Math.sin(angle * 4.0 + .7) + 0.004 * Math.sin(angle * 11.0 - .4);
  const wobble = 1 + 0.055 * Math.sin(angle * 7 + around * 2) + (Math.random() - 0.5) * 0.06;
  const tube = settings.tube * band * wobble, r = settings.radius + bodyWarp + tube * Math.cos(around), k = i * 3;
  positions[k] = r * Math.cos(angle); positions[k + 1] = r * Math.sin(angle);
  positions[k + 2] = tube * Math.sin(around) * 1.28 + (Math.random() - 0.5) * 0.025;
  sizes[i] = settings.particleSize * (0.45 + Math.random() * 0.72);
  seeds[i] = Math.random();
  colors[i] = THREE.MathUtils.clamp((Math.sin(angle) + 1) * 0.5 + (Math.random() - 0.5) * 0.08, 0, 1);
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 1));

const uniforms = {
  uTime: { value: 0 }, uMouse: { value: new THREE.Vector3() }, uMousePower: { value: 0 },
  uRadius: { value: settings.mouseRadius }, uStrength: { value: settings.mouseStrength },
  uNoise: { value: settings.noise }, uGlow: { value: settings.glow }, uScroll: { value: 0 },
  uTubeX: { value: mobile ? .58 : 1.24 }, uLoad: { value: 0 }
};

// Poucas partículas ambientais, sempre ao fundo e sem interferir na interação.
const backgroundCount = mobile ? 65 : 145;
const backgroundPositions = new Float32Array(backgroundCount * 3);
const backgroundSizes = new Float32Array(backgroundCount);
const backgroundSeeds = new Float32Array(backgroundCount);
for (let i = 0; i < backgroundCount; i++) {
  const k = i * 3;
  backgroundPositions[k] = (Math.random() - .5) * 8.4;
  backgroundPositions[k + 1] = (Math.random() - .5) * 5.0;
  backgroundPositions[k + 2] = -1.0 - Math.random() * 2.8;
  backgroundSizes[i] = .95 + Math.random() * 1.55;
  backgroundSeeds[i] = Math.random();
}
const backgroundGeometry = new THREE.BufferGeometry();
backgroundGeometry.setAttribute('position', new THREE.BufferAttribute(backgroundPositions, 3));
backgroundGeometry.setAttribute('aSize', new THREE.BufferAttribute(backgroundSizes, 1));
backgroundGeometry.setAttribute('aSeed', new THREE.BufferAttribute(backgroundSeeds, 1));
const backgroundVertex = `
  uniform float uTime; attribute float aSize, aSeed; varying float vSeed, vTwinkle;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * .16 + aSeed * 18.0) * .025;
    p.x += cos(uTime * .11 + aSeed * 23.0) * .018;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    vTwinkle = .5 + .5 * sin(uTime * (.55 + aSeed * .8) + aSeed * 34.0);
    vSeed = aSeed;
    float bright = step(.91, aSeed);
    gl_PointSize = aSize * (.95 + vTwinkle * .72 + bright * 1.15);
  }
`;
const backgroundFragment = `
  varying float vSeed, vTwinkle;
  void main() {
    float d = length(gl_PointCoord - .5);
    float core = smoothstep(.48, .06, d);
    float halo = smoothstep(.5, .20, d) * .20;
    float bright = step(.91, vSeed);
    float alpha = (core + halo) * (.22 + vTwinkle * .34 + bright * .24);
    vec3 blue = vec3(.12, .38, 1.0), violet = vec3(.50, .32, .88), ice = vec3(.68, .82, 1.0);
    vec3 color = mix(blue, violet, smoothstep(.25, .72, vSeed));
    color = mix(color, ice, bright * .82);
    gl_FragColor = vec4(color * (.82 + vTwinkle * .62 + bright * .65), alpha);
  }
`;
const backgroundMaterial = new THREE.ShaderMaterial({ uniforms: { uTime: uniforms.uTime }, vertexShader: backgroundVertex, fragmentShader: backgroundFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const backgroundParticles = new THREE.Points(backgroundGeometry, backgroundMaterial);
scene.add(backgroundParticles);

const vertex = `
  uniform float uTime, uMousePower, uRadius, uStrength, uNoise, uScroll, uTubeX, uLoad; uniform vec3 uMouse;
  attribute float aSize, aSeed, aColor; varying float vColor, vAlpha, vDepth;
  void main() {
    vec3 p = position;
    float organic = sin(p.x * 7.0 + uTime * .32 + aSeed * 12.0) * cos(p.y * 6.0 - uTime * .23 + aSeed * 9.0);
    p += normalize(vec3(p.xy, p.z * 1.5)) * organic * uNoise;
    float distanceToMouse = distance(p.xy, uMouse.xy);
    float influence = pow(smoothstep(uRadius, 0.0, distanceToMouse) * uMousePower, .68);
    vec3 radialDirection = normalize(vec3(p.xy, .0));
    vec3 tangentDirection = normalize(vec3(-radialDirection.y, radialDirection.x, .0));
    float ripple = sin(distanceToMouse * 19.0 - uTime * 1.4 + aSeed * 9.0) * .035;
    p += radialDirection * influence * uStrength * (.26 + aSeed * .24);
    p += tangentDirection * influence * sin(aSeed * 18.0 + uTime) * uStrength * .06;
    p += normalize(p) * ripple * influence;
    p += normalize(p) * sin(uTime * .26 + aSeed * 8.0) * .009;
    float loadMorph = smoothstep(0.0, 1.0, uLoad);
    float introAngle = fract(sin(aSeed * 91.73) * 43758.54) * 6.2831853;
    float introRadius = sqrt(fract(sin((aSeed + .37) * 143.17) * 24634.63)) * 1.62;
    vec3 introPosition = vec3(
      cos(introAngle) * introRadius + sin(uTime * 1.2 + aSeed * 18.0) * .018,
      sin(introAngle) * introRadius,
      sin(aSeed * 32.0 + uTime * .7) * .20
    );
    p = mix(introPosition, p, loadMorph);
    float morph = smoothstep(.02, .48, uScroll);
    float travel = smoothstep(.32, .80, uScroll);
    float dissolve = smoothstep(.74, 1.0, uScroll);
    float angle = atan(position.y, position.x);
    float vertical = angle / 3.14159265 * 2.18;
    float waist = .17 + pow(abs(vertical) / 2.18, 1.10) * .66;
    vec3 column = vec3(
      sin(aSeed * 24.0 + vertical * 5.0 + uTime * .75) * waist,
      vertical,
      cos(aSeed * 19.0 + vertical * 4.0 - uTime * .55) * waist * .46
    );
    float loose = step(.82, aSeed);
    column.xz *= mix(1.0, 4.9, loose);
    column.y += loose * sin(aSeed * 40.0) * .65;
    column *= mix(1.0, 1.82, travel);
    column.y -= travel * 1.12 + dissolve * 1.34;
    column.x += dissolve * sin(aSeed * 31.0) * 1.45;
    column.z += dissolve * cos(aSeed * 27.0) * .82;
    column.y += dissolve * sin(aSeed * 43.0) * .52;
    column.x += uTubeX;
    p = mix(p, column, morph);
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    float introColor = clamp((introPosition.y + 1.62) / 3.24, 0.0, 1.0);
    vDepth = clamp((p.z + .28) / .62, 0.0, 1.0); vColor = mix(mix(introColor, aColor, loadMorph), clamp((vertical + 2.18) / 4.36, 0.0, 1.0), morph);
    float spark = pow(.5 + .5 * sin(uTime * 4.4 + aSeed * 38.0 + vertical * 7.0), 16.0) * morph;
    vAlpha = (.25 + influence * .82 + aSeed * .08 + spark * .72) * (1.0 - dissolve);
    gl_PointSize = aSize * (1.0 + vDepth * .25) * (125.0 / -view.z) * mix(1.0, 1.55 + loose * 1.35 + spark * 1.8, morph);
  }
`;
const fragment = `
  uniform float uGlow; varying float vColor, vAlpha, vDepth;
  void main() {
    vec2 p = gl_PointCoord - .5; float d = length(p);
    float core = smoothstep(.5, .12, d), halo = smoothstep(.5, .22, d) * .07;
    vec3 blue = vec3(.08, .30, .95), violet = vec3(.68, .16, .52), red = vec3(1.0, .25, .18);
    vec3 color = mix(blue, violet, smoothstep(.08, .48, vColor)); color = mix(color, red, smoothstep(.52, .92, vColor));
    float alpha = (core + halo) * vAlpha * (1.0 - vDepth * .24) * .68;
    if (alpha < .012) discard;
    gl_FragColor = vec4(color * (.48 + uGlow * vAlpha * .42), alpha);
  }
`;
const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const ring = new THREE.Points(geometry, material); scene.add(ring);

/* A introdução ampliada foi removida a pedido do usuário.
// Membrana inicial: fios verticais sobre uma superfície elíptica, inspirada na referência.
const introColumns = mobile ? 110 : 230, introRows = mobile ? 42 : 70;
const introPositions = new Float32Array(introColumns * introRows * 2 * 3);
const introColors = new Float32Array(introColumns * introRows * 2);
const introSeeds = new Float32Array(introColumns * introRows * 2);
const introEdges = new Float32Array(introColumns * introRows * 2);
let introIndex = 0;
for (let column = 0; column < introColumns; column++) {
  const nx = (column / (introColumns - 1)) * 2 - 1;
  const halfHeight = Math.sqrt(Math.max(0, 1 - nx * nx));
  const seed = Math.random() * 20;
  for (let row = 0; row < introRows; row++) {
    const cell1 = -halfHeight + (row / introRows) * halfHeight * 2;
    const cell2 = -halfHeight + ((row + 1) / introRows) * halfHeight * 2;
    const middle = (cell1 + cell2) * .5, halfSegment = (cell2 - cell1) * .31;
    const y1n = middle - halfSegment, y2n = middle + halfSegment;
    const x1 = nx * 2.70, x2 = nx * 2.70;
    const y1 = y1n * 2.16, y2 = y2n * 2.16;
    const z1 = Math.sqrt(Math.max(0, 1 - nx * nx - y1n * y1n)) * .34;
    const z2 = Math.sqrt(Math.max(0, 1 - nx * nx - y2n * y2n)) * .34;
    const values = [x1, y1, z1, x2, y2, z2];
    for (let v = 0; v < 2; v++) {
      introPositions.set(values.slice(v * 3, v * 3 + 3), introIndex * 3);
      introColors[introIndex] = THREE.MathUtils.clamp(((v ? y2n : y1n) + 1) * .5, 0, 1);
      introSeeds[introIndex] = seed;
      introEdges[introIndex] = THREE.MathUtils.clamp(Math.sqrt(nx * nx + (v ? y2n : y1n) * (v ? y2n : y1n)), 0, 1);
      introIndex++;
    }
  }
}
const introGeometry = new THREE.BufferGeometry();
introGeometry.setAttribute('position', new THREE.BufferAttribute(introPositions, 3));
introGeometry.setAttribute('aColor', new THREE.BufferAttribute(introColors, 1));
introGeometry.setAttribute('aSeed', new THREE.BufferAttribute(introSeeds, 1));
introGeometry.setAttribute('aEdge', new THREE.BufferAttribute(introEdges, 1));
const introVertex = `
  uniform float uTime, uIntro; attribute float aColor, aSeed, aEdge; varying float vColor, vFade, vPulse, vEdge;
  void main() {
    vec3 p = position;
    p.x += sin(p.y * 8.0 + uTime * 2.0 + aSeed) * .045;
    p.x += sin(p.y * 17.0 - uTime * 2.8 + aSeed * .4) * .018;
    p.z += sin(p.y * 5.0 + uTime + aSeed) * .025;
    float eased = smoothstep(.10, .92, uIntro);
    p.xy *= mix(1.08, .72, eased);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vColor = aColor;
    vFade = 1.0 - smoothstep(.18, .76, uIntro);
    vPulse = .55 + .45 * sin(p.y * 11.0 - uTime * 4.2 + aSeed);
    vEdge = aEdge;
  }
`;
const introFragment = `
  varying float vColor, vFade, vPulse, vEdge;
  void main() {
    vec3 blue = vec3(.04, .34, 1.0), violet = vec3(.62, .18, .72), coral = vec3(1.0, .28, .13);
    vec3 color = mix(blue, violet, smoothstep(.12, .55, vColor));
    color = mix(color, coral, smoothstep(.50, .94, vColor));
    color = mix(color, vec3(1.0, .74, .72), smoothstep(.82, 1.0, vEdge) * .55);
    float edgeGlow = 1.0 + smoothstep(.72, 1.0, vEdge) * 2.1;
    gl_FragColor = vec4(color * (1.1 + vPulse * .85) * edgeGlow, vFade * (.13 + vPulse * .14) * edgeGlow);
  }
`;
const introMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader: introVertex, fragmentShader: introFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const introMembrane = new THREE.LineSegments(introGeometry, introMaterial);
introMembrane.rotation.z = -.035;
scene.add(introMembrane);
const introPointVertex = `
  uniform float uTime, uIntro; attribute float aColor, aSeed, aEdge; varying float vColor, vFade, vPulse, vEdge;
  void main() {
    vec3 p = position;
    p.x += sin(p.y * 8.0 + uTime * 2.0 + aSeed) * .045;
    p.x += sin(p.y * 17.0 - uTime * 2.8 + aSeed * .4) * .018;
    float eased = smoothstep(.10, .92, uIntro); p.xy *= mix(1.08, .72, eased);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vColor = aColor; vFade = 1.0 - smoothstep(.18, .76, uIntro); vEdge = aEdge;
    vPulse = .5 + .5 * sin(p.y * 13.0 - uTime * 4.8 + aSeed);
    gl_PointSize = 1.0 + aEdge * 1.45 + vPulse * .65;
  }
`;
const introPointFragment = `
  varying float vColor, vFade, vPulse, vEdge;
  void main() {
    float d = length(gl_PointCoord - .5); float dot = smoothstep(.5, .12, d);
    vec3 blue = vec3(.04, .34, 1.0), violet = vec3(.62, .18, .72), coral = vec3(1.0, .28, .13);
    vec3 color = mix(blue, violet, smoothstep(.12, .55, vColor)); color = mix(color, coral, smoothstep(.50, .94, vColor));
    color = mix(color, vec3(1.0, .82, .78), smoothstep(.84, 1.0, vEdge) * .62);
    gl_FragColor = vec4(color * (1.15 + vPulse), dot * vFade * (.18 + vEdge * .30));
  }
`;
const introPointMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader: introPointVertex, fragmentShader: introPointFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const introPoints = new THREE.Points(introGeometry, introPointMaterial);
introPoints.rotation.z = introMembrane.rotation.z;
scene.add(introPoints);
*/

const strandCount = mobile ? 150 : 330, segments = 64;
const linePositions = new Float32Array(strandCount * segments * 2 * 3);
const lineSeeds = new Float32Array(strandCount * segments * 2), lineColors = new Float32Array(strandCount * segments * 2), lineAngles = new Float32Array(strandCount * segments * 2);
let lineIndex = 0;
for (let strand = 0; strand < strandCount; strand++) {
  const offset = (Math.random() - .5) * .10, seed = Math.random() * 30, strandScale = .95 + Math.random() * .10;
  for (let segment = 0; segment < segments; segment++) {
    const a1 = (segment / segments) * Math.PI * 2, a2 = ((segment + 1) / segments) * Math.PI * 2;
    const wave1 = Math.sin(a1 * 7 + seed) * .012 + Math.sin(a1 * 15 - seed * 1.7) * .006;
    const wave2 = Math.sin(a2 * 7 + seed) * .012 + Math.sin(a2 * 15 - seed * 1.7) * .006;
    const body1 = 0.008 * Math.sin(a1 * 4.0 + .7) + 0.004 * Math.sin(a1 * 11.0 - .4);
    const body2 = 0.008 * Math.sin(a2 * 4.0 + .7) + 0.004 * Math.sin(a2 * 11.0 - .4);
    const r1 = settings.radius + body1 + offset + wave1, r2 = settings.radius + body2 + offset + wave2;
    const values = [r1 * Math.cos(a1) * strandScale, r1 * Math.sin(a1) * strandScale, Math.sin(a1 * 3 + seed) * .018, r2 * Math.cos(a2) * strandScale, r2 * Math.sin(a2) * strandScale, Math.sin(a2 * 3 + seed) * .018];
    const color1 = (Math.sin(a1) + 1) * .5, color2 = (Math.sin(a2) + 1) * .5;
    for (let v = 0; v < 2; v++) { linePositions.set(values.slice(v * 3, v * 3 + 3), lineIndex * 3); lineSeeds[lineIndex] = seed; lineColors[lineIndex] = v ? color2 : color1; lineAngles[lineIndex] = v ? a2 : a1; lineIndex++; }
  }
}
const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
lineGeometry.setAttribute('aSeed', new THREE.BufferAttribute(lineSeeds, 1));
lineGeometry.setAttribute('aColor', new THREE.BufferAttribute(lineColors, 1));
lineGeometry.setAttribute('aAngle', new THREE.BufferAttribute(lineAngles, 1));
const lineVertex = `
  uniform float uTime, uMousePower, uRadius, uStrength, uScroll, uTubeX, uLoad; uniform vec3 uMouse;
  attribute float aSeed, aColor, aAngle; varying float vColor, vAlpha, vFlow, vPole;
  void main() {
    vec3 p = position; float a = atan(p.y, p.x);
    vec3 radial = normalize(vec3(p.xy, .0));

    // Vibração permanente da membrana: deslocamento real das fibras, sem rotação do objeto.
    float fineWave = sin(a * 11.0 - uTime * 2.45 + aSeed * 1.8) * .015;
    fineWave += sin(a * 23.0 + uTime * 3.15 + aSeed * .7) * .007;
    float electricPulse = pow(.5 + .5 * sin(a * 6.0 - uTime * 2.8 + aSeed * .25), 8.0);
    p += radial * (fineWave + electricPulse * .010);

    // Ao carregar, as mesmas fibras preenchem o círculo e depois migram para a borda.
    float loadMorph = smoothstep(0.0, 1.0, uLoad);
    float xNorm = sin(aSeed * 12.9898) * .96;
    float halfHeight = sqrt(max(0.0, 1.0 - xNorm * xNorm)) * 1.68;
    float introProgress = aAngle / 6.2831853;
    float introY = (introProgress * 2.0 - 1.0) * halfHeight;
    float introYNorm = introY / 1.68;
    vec3 introPosition = vec3(
      xNorm * 1.62 + sin(introY * 7.0 - uTime * 1.8 + aSeed) * .030,
      introY,
      sqrt(max(0.0, 1.0 - xNorm * xNorm - introYNorm * introYNorm)) * .25
    );
    p = mix(introPosition, p, loadMorph);

    // No scroll, cada fibra do anel se desenrola em uma coluna elétrica vertical.
    float morph = smoothstep(.02, .48, uScroll);
    float travel = smoothstep(.32, .80, uScroll);
    float dissolve = smoothstep(.74, 1.0, uScroll);
    float vertical = (aAngle / 6.2831853) * 4.36 - 2.18;
    float waist = .15 + pow(abs(vertical) / 2.18, 1.12) * .62;
    vec3 column = vec3(
      sin(aSeed * 1.7 + vertical * 4.4 + uTime * .62) * waist + sin(vertical * 8.0 - uTime * 1.4 + aSeed) * .075,
      vertical,
      cos(aSeed * 1.3 + vertical * 3.5 - uTime * .46) * waist * .68
    );
    column *= mix(1.0, 1.82, travel);
    column.y -= travel * 1.12 + dissolve * 1.34;
    column.x += dissolve * sin(aSeed * 2.7) * 1.05;
    column.z += dissolve * cos(aSeed * 2.1) * .66;
    column.y += dissolve * sin(aSeed * 3.9) * .38;
    column.x += uTubeX;
    p = mix(p, column, morph);

    // Campo amplo e dissipado: espalha as fibras sem formar uma ponta no cursor.
    float influence = smoothstep(uRadius, .0, distance(p.xy, uMouse.xy)) * uMousePower * (1.0 - morph);
    influence = pow(influence, .68);
    float fiber = .38 + .32 * (.5 + .5 * sin(aSeed * 4.7 + uTime * 1.35));
    vec3 tangent = normalize(vec3(-radial.y, radial.x, .0));
    float scatter = sin(aSeed * 7.3 + a * 5.0 + uTime * .75);
    p += radial * influence * uStrength * fiber;
    p += tangent * influence * scatter * uStrength * .095;
    p.z += influence * sin(aSeed * 3.0 + uTime * 1.4) * .075;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    float spark = pow(.5 + .5 * sin(uTime * 3.8 + aSeed * 3.7 + vertical * 8.0), 18.0) * morph;
    float introColor = clamp((introY + 1.68) / 3.36, 0.0, 1.0);
    vColor = mix(mix(introColor, aColor, loadMorph), clamp((vertical + 2.18) / 4.36, 0.0, 1.0), morph); vAlpha = (.27 + influence * 1.05 + spark * .62) * (1.0 - dissolve);
    vFlow = .5 + .42 * sin(aAngle * 9.0 - uTime * 4.2 + aSeed * 2.5) + .18 * sin(aAngle * 21.0 + uTime * 6.0 + aSeed);
    vPole = abs(aColor - .5) * 2.0;
  }
`;
const lineFragment = `
  uniform float uGlow; varying float vColor, vAlpha, vFlow, vPole;
  void main() {
    vec3 blue = vec3(.07, .24, .82), violet = vec3(.56, .12, .45), red = vec3(.95, .20, .13);
    vec3 color = mix(blue, violet, smoothstep(.08, .48, vColor)); color = mix(color, red, smoothstep(.52, .92, vColor));
    float shimmer = .45 + clamp(vFlow, 0.0, 1.0) * .72;
    float poleGlow = 1.0 + smoothstep(.62, 1.0, vPole) * .72;
    gl_FragColor = vec4(color * (.46 + uGlow * shimmer) * poleGlow, vAlpha * (.18 + shimmer * .17) * poleGlow);
  }
`;
const filamentMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader: lineVertex, fragmentShader: lineFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const filaments = new THREE.LineSegments(lineGeometry, filamentMaterial); scene.add(filaments);

const pointer = new THREE.Vector2(), mouseTarget = new THREE.Vector3(), mouseSmooth = new THREE.Vector3();
const raycaster = new THREE.Raycaster(), mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); let mouseOnScreen = false;
function setPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera); raycaster.ray.intersectPlane(mousePlane, mouseTarget); mouseOnScreen = true;
}
addEventListener('pointermove', setPointer, { passive: true }); addEventListener('pointerdown', setPointer, { passive: true });
addEventListener('pointerleave', () => { mouseOnScreen = false; }, { passive: true });
addEventListener('resize', () => {
  const rect = mountRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
});
let scrollTarget = 0, scrollSmooth = 0;
function updateScroll() {
  const range = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollTarget = THREE.MathUtils.clamp(scrollY / range, 0, 1);
}
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate); const time = clock.getElapsedTime(); uniforms.uTime.value = time;
  const loadRaw = THREE.MathUtils.clamp((time - .12) / 1.55, 0, 1);
  uniforms.uLoad.value = loadRaw * loadRaw * (3 - 2 * loadRaw);
  scrollSmooth += (scrollTarget - scrollSmooth) * .065;
  uniforms.uScroll.value = scrollSmooth;
  mouseSmooth.lerp(mouseTarget, settings.mouseSmoothing); uniforms.uMouse.value.copy(mouseSmooth);
  uniforms.uMousePower.value += ((mouseOnScreen ? 1 : 0) - uniforms.uMousePower.value) * .045;
  ring.rotation.z = Math.sin(time * .055) * .006; filaments.rotation.z = ring.rotation.z; renderer.render(scene, camera);
}
animate();
