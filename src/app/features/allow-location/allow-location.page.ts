import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import * as THREE from 'three';

import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { createStarfieldState, drawStarfieldFrame, StarfieldState } from '../../shared/utils/canvas-starfield';
import { DisposableResource, disposeSceneResources, SceneResourceRoot } from '../../shared/utils/three-disposal';
import { _MatCheckboxRequiredValidatorModule } from '@angular/material/checkbox';



type CameraLike = {
  aspect: number;
  position: { z: number };
  updateProjectionMatrix: () => void;
};

type GlobeGroupLike = {
  add: (object: unknown) => void;
  rotation: { x: number; y: number; z: number };
};

type RendererLike = DisposableResource & {
  render: (scene: unknown, camera: unknown) => void;
  setClearColor: (color: number, alpha?: number) => void;
  setPixelRatio: (value: number) => void;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
};

type SceneLike = SceneResourceRoot & {
  add: (object: unknown) => void;
};

type TextureLike = DisposableResource & {
  colorSpace?: unknown;
  needsUpdate?: boolean;
};

type Vector3Like = {
  x: number;
  y: number;
  z: number;
};

const HOME_NAVIGATION_DELAY_MS = 1200;
const PARTICLE_COUNT = 12;
const GLOBE_RADIUS = 1;
const GLOBE_TEXTURE_PATH = 'assets/textures/earth.jpg';
const GLOBE_EMISSIVE_COLOR = 0x273a6b;

const CITY_POINTS: ReadonlyArray<readonly [number, number]> = [
  [40.7, -74], [51.5, -0.1], [35.7, 139.7], [-33.9, 151.2], [48.9, 2.3],
  [19.1, 72.9], [-23.5, -46.6], [55.8, 37.6], [1.3, 103.8], [-1.3, 36.8],
  [30, 31.2], [41, 28.9], [25.2, 55.3], [-34.6, -58.4], [37.8, -122.4],
  [52.5, 13.4], [59.9, 30.3], [39.9, 116.4], [28.6, 77.2], [33.9, -6.9]
];

const CONTINENT_OUTLINES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[71, -141], [60, -141], [48, -124], [30, -118], [18, -110], [15, -95], [8, -82], [18, -80], [25, -80], [32, -81], [40, -74], [44, -66], [47, -53], [52, -55], [60, -64], [66, -68], [72, -80], [75, -95], [80, -110], [80, -125], [75, -135], [70, -141]],
  [[12, -72], [10, -63], [6, -60], [4, -53], [2, -53], [-5, -35], [-15, -39], [-23, -43], [-33, -53], [-42, -65], [-55, -68], [-55, -65], [-42, -73], [-30, -72], [-22, -70], [-18, -70], [-5, -81], [0, -80], [8, -77], [12, -72]],
  [[36, -5], [44, 2], [46, 8], [47, 16], [44, 24], [42, 28], [41, 30], [37, 36], [32, 34], [30, 33], [24, 38], [12, 44], [2, 42], [-12, 44], [-18, 36], [-30, 18], [-35, 18], [-40, 18], [-46, 14], [-34, -18], [-18, -12], [-4, -8], [4, 2], [6, 3], [4, 8], [4, 14], [4, 20], [10, 24], [14, 30], [18, 38], [24, 38], [20, 44], [12, 44], [5, 38], [-2, 38], [0, 10], [6, 1], [4, -8], [0, -10], [-4, -8], [-10, 0], [-18, 12], [-24, 14], [-30, 18], [-36, 14], [-36, 8], [-36, 0], [-30, -8], [-22, -12], [-14, -12], [-10, -6], [-6, -2], [0, 4], [2, 10], [0, 16], [2, 22], [8, 24], [12, 24], [12, 32], [16, 36], [24, 32], [28, 28], [28, 24], [36, 22], [36, 14], [36, 5], [36, -5]],
  [[72, 130], [60, 163], [52, 160], [44, 146], [36, 140], [36, 136], [30, 122], [24, 122], [18, 110], [10, 104], [2, 104], [-8, 114], [-8, 130], [-4, 135], [2, 138], [6, 125], [10, 125], [14, 120], [18, 122], [24, 120], [28, 116], [36, 118], [36, 124], [40, 130], [44, 132], [44, 136], [48, 140], [56, 143], [60, 150], [60, 163], [65, 170], [72, 180], [80, 160], [80, 140], [75, 130], [70, 120], [70, 110], [66, 100], [66, 90], [70, 80], [72, 80], [80, 60], [76, 50], [72, 44], [72, 40], [70, 34], [65, 30], [60, 28], [55, 28], [52, 22], [48, 18], [44, 12], [38, 16], [36, 22], [36, 30], [36, 36], [40, 40], [42, 48], [42, 54], [44, 60], [48, 68], [48, 75], [44, 80], [44, 90], [44, 100], [48, 110], [52, 120], [56, 120], [60, 120], [65, 120], [70, 120]],
  [[-18, 122], [-14, 128], [-12, 136], [-10, 136], [-12, 142], [-14, 148], [-22, 150], [-32, 152], [-38, 147], [-38, 140], [-34, 136], [-32, 128], [-26, 122], [-18, 122]]
];

@Component({
  selector: 'app-allow-location',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './allow-location.page.html',
  styleUrls: ['./allow-location.page.scss']
})
export class AllowLocationPage implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') private readonly bgCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('globeCanvas') private readonly globeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('globeWrap') private readonly globeWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('particlesLayer') private readonly particlesLayer!: ElementRef<HTMLDivElement>;
  @ViewChild('rootRef') private readonly rootRef!: ElementRef<HTMLDivElement>;
  @ViewChild('heroStage') private readonly heroStage!: ElementRef<HTMLDivElement>;
  @ViewChild('headline') private readonly headline!: ElementRef<HTMLElement>;
  @ViewChild('description') private readonly description!: ElementRef<HTMLElement>;
  @ViewChild('allowBtn', { read: ElementRef }) private readonly allowBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('skipLink') private readonly skipLink!: ElementRef<HTMLElement>;
  @ViewChild('pinDot') private readonly pinDot!: ElementRef<HTMLDivElement>;

  protected isLocationGranted = false;

  private renderer?: RendererLike;
  private scene?: SceneLike;
  private camera?: CameraLike;
  private globeGroup?: GlobeGroupLike;
  private starfield?: StarfieldState;
  private backgroundAnimationId?: number;
  private globeAnimationId?: number;
  private backgroundStartTime?: number;
  private entryTimeline?: gsap.core.Timeline;
  private globeSurfaceTexture?: TextureLike;
  private globeGridTexture?: TextureLike;
  private particleElements: HTMLElement[] = [];

  constructor(
    private readonly ngZone: NgZone,
    private readonly router: Router
  ) {}

  ngAfterViewInit(): void {
    this.setupBackground();
    this.setupGlobe();
    this.setupParticles();
    this.playEntryAnimation();
  }

  ngOnDestroy(): void {
    if (this.backgroundAnimationId !== undefined) {
      cancelAnimationFrame(this.backgroundAnimationId);
    }

    if (this.globeAnimationId !== undefined) {
      cancelAnimationFrame(this.globeAnimationId);
    }

    this.entryTimeline?.kill();
    gsap.killTweensOf(this.globeWrap.nativeElement);
    gsap.killTweensOf(this.particleElements);

    this.globeSurfaceTexture?.dispose?.();
    this.globeGridTexture?.dispose?.();
    if (this.scene) {
      disposeSceneResources(this.scene);
    }
    this.renderer?.dispose?.();
    this.particlesLayer.nativeElement.innerHTML = '';
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.resizeBackground();
    this.updateRendererSize();
  }

  protected onAllowLocation(): void {
    if (this.isLocationGranted) {
      return;
    }

    this.isLocationGranted = true;
    this.allowBtn.nativeElement.classList.add('allow-btn--granted');
    this.playGrantedButtonAnimation();

    if (!navigator.geolocation) {
      this.navigateAuthAfterDelay();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem('atmos_lat', position.coords.latitude.toString());
        localStorage.setItem('atmos_lon', position.coords.longitude.toString());
        this.navigateAuthAfterDelay();
      },
      () => this.navigateAuthAfterDelay()
    );
  }

  protected onSkip(): void {
    gsap.to(this.rootRef.nativeElement, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => void this.navigateAuth()
    });
  }

  private navigateAuthAfterDelay(): void {
    window.setTimeout(() => void this.navigateAuth(), HOME_NAVIGATION_DELAY_MS);
  }

  private navigateAuth(): Promise<boolean> {
    return this.ngZone.run(() => this.router.navigate([`/${APP_ROUTE_PATHS.auth}`]));
  }

  private playGrantedButtonAnimation(): void {
    gsap.timeline()
      .to(this.allowBtn.nativeElement, { scale: 0.96, duration: 0.08, ease: 'power1.in' })
      .to(this.allowBtn.nativeElement, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  }



  // Background: static gradients plus animated starfield.
  private setupBackground(): void {
    this.resizeBackground();

    this.ngZone.runOutsideAngular(() => {
      const tick = (timestamp: number) => {
        if (!this.backgroundStartTime) {
          this.backgroundStartTime = timestamp;
        }

        if (!this.starfield) {
          return;
        }

        const elapsedSeconds = (timestamp - this.backgroundStartTime) / 1000;
        drawStarfieldFrame(this.starfield, elapsedSeconds);
        this.backgroundAnimationId = requestAnimationFrame(tick);
      };

      this.backgroundAnimationId = requestAnimationFrame(tick);
    });
  }

  private resizeBackground(): void {
    const canvas = this.bgCanvas.nativeElement;
    this.starfield = createStarfieldState(canvas) ?? undefined;
  }

  // Globe: procedural surface + Three.js lighting + slow drift.
  private setupGlobe(): void {
    const canvas = this.globeCanvas.nativeElement;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
    camera.position.set(0, 0.08, 4.1);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = 1.08;
    globeGroup.rotation.z = -0.28;
    scene.add(globeGroup);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.globeGroup = globeGroup;

    this.addGlobeLights();
    this.addGlobeMeshes();

    this.updateRendererSize();

    this.ngZone.runOutsideAngular(() => {
      const tick = () => {
        const globeGroup = this.globeGroup;
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;

        if (!globeGroup || !renderer || !scene || !camera) {
          return;
        }

        globeGroup.rotation.y += 0.003;
        globeGroup.rotation.x = Math.sin(performance.now() * 0.00035) * 0.025;
        renderer.render(scene, camera);
        this.globeAnimationId = requestAnimationFrame(tick);
      };

      this.globeAnimationId = requestAnimationFrame(tick);
    });
  }

  private addGlobeLights(): void {
    const scene = this.scene;
    if (!scene) {
      return;
    }

    scene.add(new THREE.AmbientLight(0x0a1628, 2.8));

    const directionalLight = new THREE.DirectionalLight(0x38bdf8, 0.48);
    directionalLight.position.set(-1.4, 1.1, 1.6);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 0.22);
    pointLight.position.set(-1.2, 1.1, 2.2);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0xf8fafc, 0.22);
    rimLight.position.set(1.7, -0.4, 2.4);
    scene.add(rimLight);
  }

  private addGlobeMeshes(): void {
    const globeGroup = this.globeGroup;
    if (!globeGroup) {
      return;
    }

    const textureLoader = new THREE.TextureLoader();
    this.globeSurfaceTexture = textureLoader.load(GLOBE_TEXTURE_PATH);
    if (this.globeSurfaceTexture) {
      this.globeSurfaceTexture.colorSpace = THREE.SRGBColorSpace;
    }
    
    this.globeGridTexture = this.createGridTexture();

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({
        map: this.globeSurfaceTexture,
        color: 0xf8fafc,
        emissive: GLOBE_EMISSIVE_COLOR,
        emissiveMap: this.globeSurfaceTexture,
        emissiveIntensity: 0.82,
        roughness: 0.92,
        metalness: 0.05
      })
    );
    globeGroup.add(globe);

    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.006, 64, 64),
      new THREE.MeshBasicMaterial({
        map: this.globeGridTexture,
        transparent: true,
        opacity: 0.24,
        depthWrite: false
      })
    ));

    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.001, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.03
      })
    ));

    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.01, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.012,
        shininess: 32,
        depthWrite: false
      })
    ));

    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.065, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.12
      })
    ));

    this.addCityDots();
    this.addContinentLines();
  }

  private addCityDots(): void {
    const globeGroup = this.globeGroup;
    if (!globeGroup) {
      return;
    }

    const positions = CITY_POINTS.flatMap(([lat, lon]) => {
      const vertex = this.latLonToVector3(lat, lon, GLOBE_RADIUS + 0.01);
      return [vertex.x, vertex.y, vertex.z];
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    globeGroup.add(new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.04,
        transparent: true,
        opacity: 0.9
      })
    ));
  }

  private addContinentLines(): void {
    const globeGroup = this.globeGroup;
    if (!globeGroup) {
      return;
    }

    CONTINENT_OUTLINES.forEach((continent) => {
      const points = continent.map(([lat, lon]) => this.latLonToVector3(lat, lon, GLOBE_RADIUS + 0.012));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      globeGroup.add(new THREE.LineLoop(
        geometry,
        new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.16
        })
      ));
    });
  }

  private createGridTexture(): TextureLike | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);

    context.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    context.lineWidth = 1;

    for (let lat = 0; lat <= 10; lat += 1) {
      const y = (lat / 10) * height;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    for (let lon = 0; lon <= 18; lon += 1) {
      const x = (lon / 18) * width;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  private latLonToVector3(lat: number, lon: number, radius: number): Vector3Like {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  // Particles: tiny floating accents driven by GSAP.
  private setupParticles(): void {
    const container = this.particlesLayer.nativeElement;

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const particle = this.createParticleElement();
      container.appendChild(particle);
      this.particleElements.push(particle);
 
      gsap.to(particle, {
        y: -window.innerHeight * 1.1,
        scale: 0.2,
        opacity: 0,
        duration: 8 + Math.random() * 9,
        delay: Math.random() * 8,
        ease: 'none',
        repeat: -1,
        repeatDelay: Math.random() * 4
      });
    }
  }

  private createParticleElement(): HTMLDivElement {
    const particle = document.createElement('div');
    const size = Math.random() * 2 + 0.6;

    Object.assign(particle.style, {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(56,189,248,0.45)',
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 20}%`,
      opacity: '0',
      pointerEvents: 'none'
    } satisfies Partial<CSSStyleDeclaration>);

    return particle;
  }

  private updateRendererSize(): void {
    const renderer = this.renderer;
    const camera = this.camera;
    const container = this.globeWrap?.nativeElement;

    if (!renderer || !camera || !container) {
      return;
    }

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // Entry sequence: globe first, then pin, then copy and actions.
  private playEntryAnimation(): void {
    const contentElements = [
      this.headline.nativeElement,
      this.description.nativeElement,
      this.allowBtn.nativeElement,
      this.skipLink.nativeElement
    ];

    gsap.set(contentElements, { opacity: 0, y: 24 });
    gsap.set(this.globeWrap.nativeElement, { opacity: 0, scale: 0.85 });
    gsap.set(this.pinDot.nativeElement, { scale: 0, opacity: 0 });

    this.entryTimeline = gsap.timeline({ delay: 0.3 });
    this.entryTimeline.to(this.globeWrap.nativeElement, {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'back.out(1.4)'
    });
    this.entryTimeline.to(this.pinDot.nativeElement, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(2)'
    }, '-=0.4');
    this.entryTimeline.to(this.headline.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.2');
    this.entryTimeline.to(this.description.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4');
    this.entryTimeline.to(this.allowBtn.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.3');
    this.entryTimeline.to(this.skipLink.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2');
    this.entryTimeline.add(() => { 
      gsap.to(this.globeWrap.nativeElement, {
        y: -10,
        duration: 3.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    });
  }
}
