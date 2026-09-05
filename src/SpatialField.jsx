import { useEffect, useRef } from "react";

const vertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aScale;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;
  varying float vTint;
  varying float vDepth;

  void main() {
    vec3 transformed = position;
    transformed.y += sin(uTime * 0.42 + aPhase) * 0.045;
    transformed.x += cos(uTime * 0.3 + aPhase * 1.7) * 0.026;
    transformed.z += sin(uTime * 0.25 + aPhase * 0.8) * 0.16;
    transformed.x += uPointer.x * (0.1 + aScale * 0.018);
    transformed.y += uPointer.y * 0.07 - uScroll * 0.45;

    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aScale * (32.0 / max(1.0, -viewPosition.z));

    vTint = 0.5 + 0.5 * sin(aPhase * 1.7);
    vDepth = clamp((-viewPosition.z - 3.0) / 12.0, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vTint;
  varying float vDepth;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float edge = 1.0 - smoothstep(0.16, 0.5, distanceFromCenter);
    vec3 aqua = vec3(0.33, 0.95, 0.87);
    vec3 violet = vec3(0.56, 0.61, 1.0);
    vec3 color = mix(aqua, violet, vTint);
    gl_FragColor = vec4(color, edge * (0.14 + vDepth * 0.18));
  }
`;

function pseudoRandom(index) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * A deliberately sparse WebGL field. It stays behind the interface and only
 * reacts with small, eased offsets, so it creates depth without becoming data.
 */
export default function SpatialField() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 720px)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const shouldUseFallback = reducedMotion.matches || connection?.saveData;

    if (shouldUseFallback) {
      mount.dataset.mode = "css";
      return undefined;
    }

    let active = true;
    let renderer;
    let scene;
    let camera;
    let field;
    let particleMaterial;
    let lineMaterial;
    let frameId;
    let lastFrame = 0;
    let isVisible = !document.hidden;
    const pointer = { x: 0, y: 0 };
    const easedPointer = { x: 0, y: 0 };
    let targetScroll = 0;
    let easedScroll = 0;

    const render = () => {
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = 0.5 - event.clientY / window.innerHeight;
    };

    const onScroll = () => {
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      targetScroll = Math.min(1, Math.max(0, window.scrollY / scrollableHeight));
      document.documentElement.style.setProperty("--scroll-depth", targetScroll.toFixed(3));
      document.documentElement.style.setProperty("--scroll-lift", `${targetScroll * -96}px`);
      document.documentElement.style.setProperty("--scroll-drift", `${targetScroll * 72}px`);
      document.documentElement.style.setProperty("--scroll-grid-drift", `${targetScroll * -80}px`);
    };

    const onResize = () => {
      if (!renderer || !camera) return;
      const { innerWidth: width, innerHeight: height } = window;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compactViewport.matches ? 1 : 1.5));
      renderer.setSize(width, height, false);
      if (field) field.position.x = compactViewport.matches ? 0.45 : 1.15;
      render();
    };

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !frameId) frameId = requestAnimationFrame(animate);
    };

    const onContextLost = (event) => {
      event.preventDefault();
      if (frameId) cancelAnimationFrame(frameId);
      frameId = undefined;
    };

    const animate = (time) => {
      if (!active || !isVisible) {
        frameId = undefined;
        return;
      }

      frameId = requestAnimationFrame(animate);
      // A calm capped cadence keeps the ambient scene inexpensive on long pages.
      if (time - lastFrame < 24) return;
      lastFrame = time;

      easedPointer.x += (pointer.x - easedPointer.x) * 0.035;
      easedPointer.y += (pointer.y - easedPointer.y) * 0.035;
      easedScroll += (targetScroll - easedScroll) * 0.04;

      if (field) {
        field.rotation.y = easedPointer.x * 0.13;
        field.rotation.x = easedPointer.y * 0.05;
        field.position.y = easedScroll * -0.5;
      }
      if (particleMaterial) {
        particleMaterial.uniforms.uTime.value = time * 0.001;
        particleMaterial.uniforms.uScroll.value = easedScroll;
        particleMaterial.uniforms.uPointer.value.set(easedPointer.x, easedPointer.y);
      }
      render();
    };

    const boot = async () => {
      let THREE;
      try {
        THREE = await import("three");
      } catch {
        mount.dataset.mode = "css";
        return;
      }
      if (!active) return;

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: !compactViewport.matches,
          powerPreference: "high-performance",
        });
      } catch {
        mount.dataset.mode = "css";
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compactViewport.matches ? 1 : 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setClearAlpha(0);
      renderer.domElement.className = "spatial-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);
      mount.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 30);
      camera.position.set(0, 0, 7);

      field = new THREE.Group();
      field.position.x = compactViewport.matches ? 0.45 : 1.15;
      scene.add(field);

      const pointCount = compactViewport.matches ? 84 : 176;
      const positions = new Float32Array(pointCount * 3);
      const phases = new Float32Array(pointCount);
      const scales = new Float32Array(pointCount);

      for (let index = 0; index < pointCount; index += 1) {
        const offset = index * 3;
        const depthBand = index % 3;
        positions[offset] = -0.4 + pseudoRandom(index * 3 + 1) * 7.5;
        positions[offset + 1] = pseudoRandom(index * 3 + 2) * 6.7 - 3.35;
        positions[offset + 2] = -depthBand * 1.6 - pseudoRandom(index * 3 + 3) * 2.9;
        phases[index] = pseudoRandom(index + 40) * Math.PI * 2;
        scales[index] = 0.9 + pseudoRandom(index + 80) * 1.85;
      }

      const pointGeometry = new THREE.BufferGeometry();
      pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      pointGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      pointGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

      particleMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        },
        vertexShader,
        fragmentShader,
      });
      field.add(new THREE.Points(pointGeometry, particleMaterial));

      const strandCount = compactViewport.matches ? 20 : 42;
      const strands = new Float32Array(strandCount * 6);
      for (let index = 0; index < strandCount; index += 1) {
        const offset = index * 6;
        const x = 0.1 + pseudoRandom(index + 120) * 6.7;
        const y = pseudoRandom(index + 160) * 6.2 - 3.1;
        const z = -1.2 - pseudoRandom(index + 200) * 4.3;
        strands[offset] = x;
        strands[offset + 1] = y;
        strands[offset + 2] = z;
        strands[offset + 3] = x;
        strands[offset + 4] = y - (0.16 + pseudoRandom(index + 240) * 0.54);
        strands[offset + 5] = z;
      }

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(strands, 3));
      lineMaterial = new THREE.LineBasicMaterial({
        color: 0x70e8de,
        transparent: true,
        opacity: compactViewport.matches ? 0.055 : 0.09,
        depthWrite: false,
      });
      field.add(new THREE.LineSegments(lineGeometry, lineMaterial));

      onScroll();
      onResize();
      const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (supportsFinePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      document.addEventListener("visibilitychange", onVisibilityChange);
      frameId = requestAnimationFrame(animate);

      // Keep the cleanup closure aware of this conditional listener.
      mount.dataset.pointerTracking = String(supportsFinePointer);
    };

    boot();

    return () => {
      active = false;
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.documentElement.style.removeProperty("--scroll-depth");
      document.documentElement.style.removeProperty("--scroll-lift");
      document.documentElement.style.removeProperty("--scroll-drift");
      document.documentElement.style.removeProperty("--scroll-grid-drift");

      if (scene) {
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose?.());
        });
      }
      if (renderer) {
        renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, []);

  return <div ref={mountRef} className="spatial-field" aria-hidden="true" />;
}
