import { useEffect, useRef } from 'react';

/**
 * The homepage sea. Started from three.js r187 `webgpu_ocean` (WaterMesh + SkyMesh + bloom),
 * stripped of the demo cube/controls/inspector and driven by <html data-time>.
 *
 * - WebGPU when available, WebGL2 backend otherwise (WebGPURenderer falls back on its own; ?gl=1 forces it).
 * - Not started at all under prefers-reduced-motion or ?static=1: the CSS/photo poster underneath stays.
 * - Paused when scrolled out of view or the tab is hidden.
 * - Exposes <html data-ocean="live|static"> and data-renderer="webgpu|webgl2".
 */

type Phase = 'dawn' | 'noon' | 'dusk' | 'night';

interface Preset {
  elevation: number;
  azimuth: number;
  exposure: number;
  turbidity: number;
  rayleigh: number;
  mieCoefficient: number;
  mieDirectionalG: number;
  waterColor: number;
  sunColor: number;
  clouds: number;
  cloudDensity: number;
  distortion: number;
  bloom: number;
}

// Azimuth 180 puts the sun straight ahead (camera looks down -Z).
export const PRESETS: Record<Phase, Preset> = {
  dawn: { elevation: 3.2, azimuth: 197, exposure: 0.26, turbidity: 5, rayleigh: 2.4, mieCoefficient: 0.006, mieDirectionalG: 0.82, waterColor: 0x0c2433, sunColor: 0xffe2cc, clouds: 0.42, cloudDensity: 0.45, distortion: 2.4, bloom: 0.14 },
  noon: { elevation: 42, azimuth: 186, exposure: 0.26, turbidity: 1.4, rayleigh: 1.6, mieCoefficient: 0.003, mieDirectionalG: 0.75, waterColor: 0x00283f, sunColor: 0xffffff, clouds: 0.28, cloudDensity: 0.32, distortion: 3.4, bloom: 0.03 },
  dusk: { elevation: 0.9, azimuth: 164, exposure: 0.13, turbidity: 10, rayleigh: 3.4, mieCoefficient: 0.006, mieDirectionalG: 0.86, waterColor: 0x150d1c, sunColor: 0xffae70, clouds: 0.5, cloudDensity: 0.55, distortion: 3.7, bloom: 0.1 },
  night: { elevation: 11, azimuth: 205, exposure: 0.018, turbidity: 1.2, rayleigh: 0.5, mieCoefficient: 0.002, mieDirectionalG: 0.9, waterColor: 0x01060d, sunColor: 0x9fbfff, clouds: 0.25, cloudDensity: 0.35, distortion: 2.2, bloom: 0.2 },
};

const currentPhase = (): Phase => (document.documentElement.dataset.time as Phase) || 'dusk';

export default function Ocean() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const params = new URLSearchParams(location.search);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static')) {
      root.dataset.ocean = 'static';
      return;
    }

    let disposed = false;
    let cleanup = () => {};

    const start = async (forceWebGLArg: boolean): Promise<void> => {
      const THREE = await import('three/webgpu');
      const { pass } = await import('three/tsl');
      const { bloom } = await import('three/addons/tsl/display/BloomNode.js');
      const { WaterMesh } = await import('three/addons/objects/WaterMesh.js');
      const { SkyMesh } = await import('three/addons/objects/SkyMesh.js');
      if (disposed || !host.current) return;

      const el = host.current;
      const forceWebGL = forceWebGLArg;
      const renderer = new THREE.WebGPURenderer({ antialias: false, forceWebGL });
      const mobile = innerWidth < 720;
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
      renderer.setSize(innerWidth, innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      try {
        await renderer.init();
      } catch (err) {
        console.warn('[ocean] renderer failed, keeping static cover', err);
        root.dataset.ocean = 'static';
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }
      const backend = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'webgpu' : 'webgl2';
      // If the GPU device goes away (driver reset, sleep, flaky software adapters), retry once on WebGL2,
      // otherwise fall back to the static cover.
      renderer.onDeviceLost = (info: unknown) => {
        console.warn('[ocean] device lost', info);
        root.dataset.ocean = 'static';
        cleanup();
        if (backend === 'webgpu' && !disposed) start(true).catch(() => (root.dataset.ocean = 'static'));
      };
      root.dataset.renderer = backend;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(mobile ? 62 : 52, innerWidth / innerHeight, 1, 20000);
      camera.position.set(0, mobile ? 9 : 7, 80);
      camera.rotation.order = 'YXZ';
      const basePitch = mobile ? 0.08 : 0.095;
      camera.rotation.x = basePitch;

      const pipeline = new THREE.RenderPipeline(renderer);
      const scenePass = pass(scene, camera);
      const color = scenePass.getTextureNode('output');
      const bloomPass = bloom(color);
      bloomPass.threshold.value = 0;
      bloomPass.radius.value = 0;
      pipeline.outputNode = color.add(bloomPass);

      const normals = new THREE.TextureLoader().load('/textures/waternormals.jpg');
      normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
      const water = new WaterMesh(new THREE.PlaneGeometry(10000, 10000), {
        waterNormals: normals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
      });
      water.rotation.x = -Math.PI / 2;
      scene.add(water);

      const sky = new SkyMesh();
      sky.scale.setScalar(10000);
      sky.cloudElevation.value = 0.5;
      scene.add(sky);

      // Live values we tween toward the active preset.
      const live = { ...PRESETS[currentPhase()] };
      const target = { ...live };
      const cWater = new THREE.Color(live.waterColor);
      const cSun = new THREE.Color(live.sunColor);
      const tWater = new THREE.Color();
      const tSun = new THREE.Color();
      const sun = new THREE.Vector3();

      const apply = () => {
        const phi = THREE.MathUtils.degToRad(90 - live.elevation);
        const theta = THREE.MathUtils.degToRad(live.azimuth);
        sun.setFromSphericalCoords(1, phi, theta);
        sky.sunPosition.value.copy(sun);
        water.sunDirection.value.copy(sun).normalize();
        sky.turbidity.value = live.turbidity;
        sky.rayleigh.value = live.rayleigh;
        sky.mieCoefficient.value = live.mieCoefficient;
        sky.mieDirectionalG.value = live.mieDirectionalG;
        sky.cloudCoverage.value = live.clouds;
        sky.cloudDensity.value = live.cloudDensity;
        water.distortionScale.value = live.distortion;
        water.waterColor.value.copy(cWater);
        water.sunColor.value.copy(cSun);
        renderer.toneMappingExposure = live.exposure;
        bloomPass.strength.value = live.bloom;
      };
      apply();

      const setPhase = (p: Phase) => {
        Object.assign(target, PRESETS[p]);
        tWater.set(target.waterColor);
        tSun.set(target.sunColor);
      };
      setPhase(currentPhase());
      const mo = new MutationObserver(() => setPhase(currentPhase()));
      mo.observe(root, { attributes: true, attributeFilter: ['data-time'] });

      // Gentle parallax from the pointer, plus a slow swell of the camera.
      let px = 0, py = 0;
      const onMove = (e: PointerEvent) => {
        px = e.clientX / innerWidth - 0.5;
        py = e.clientY / innerHeight - 0.5;
      };
      addEventListener('pointermove', onMove, { passive: true });

      let first = true;
      let last = performance.now();
      const keys = Object.keys(live) as (keyof Preset)[];
      const loop = () => {
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const k = 1 - Math.exp(-dt * 2.2);
        let moving = false;
        for (const key of keys) {
          if (key === 'waterColor' || key === 'sunColor') continue;
          const d = target[key] - live[key];
          if (Math.abs(d) > 1e-4) {
            live[key] += d * k;
            moving = true;
          }
        }
        cWater.lerp(tWater, k);
        cSun.lerp(tSun, k);
        if (moving || first) apply();
        else {
          water.waterColor.value.copy(cWater);
          water.sunColor.value.copy(cSun);
        }

        const t = now / 1000;
        camera.position.y = (mobile ? 9 : 7) + Math.sin(t * 0.6) * 0.35;
        camera.rotation.y += (-px * 0.05 - camera.rotation.y) * 0.04;
        camera.rotation.x += (basePitch - py * 0.02 + Math.sin(t * 0.45) * 0.004 - camera.rotation.x) * 0.04;
        camera.rotation.z = Math.sin(t * 0.5) * 0.004;

        pipeline.render();
        if (first) {
          first = false;
          requestAnimationFrame(() => {
            root.dataset.ocean = 'live';
            (window as unknown as { __ocean: unknown }).__ocean = { backend, ready: true };
          });
        }
      };

      let running = false;
      let inView = true;
      const sync = () => {
        const want = inView && !document.hidden;
        if (want !== running) {
          running = want;
          last = performance.now();
          renderer.setAnimationLoop(want ? loop : null);
        }
      };
      const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        sync();
      });
      io.observe(el);
      document.addEventListener('visibilitychange', sync);
      sync();

      const onResize = () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
      };
      addEventListener('resize', onResize);

      cleanup = () => {
        renderer.setAnimationLoop(null);
        io.disconnect();
        mo.disconnect();
        removeEventListener('resize', onResize);
        removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', sync);
        try {
          renderer.dispose();
        } catch {
          /* already lost */
        }
        renderer.domElement.remove();
      };
    };

    start(params.has('gl') || !('gpu' in navigator)).catch((err) => {
      console.warn('[ocean] failed', err);
      root.dataset.ocean = 'static';
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} className="ocean-canvas" aria-hidden="true" />;
}
