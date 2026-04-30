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
  @ViewChild('allowBtn') private readonly allowBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('skipLink') private readonly skipLink!: ElementRef<HTMLElement>;
  @ViewChild('pinDot') private readonly pinDot!: ElementRef<HTMLDivElement>;

  protected isLocationGranted = false;

  private renderer?: any;
  private scene?: any;
  private camera?: any;
  private globeGroup?: any;
  private bgCtx?: CanvasRenderingContext2D;
  private bgAnimId?: number;
  private animationId?: number;
  private bgStart?: number;
  private entryTL?: gsap.core.Timeline;
  private globeSurfaceTexture?: any;
  private globeGridTexture?: any;
  private stars: Array<{ x: number; y: number; r: number; speed: number; phase: number }> = [];
  private nebula1?: CanvasGradient;
  private nebula2?: CanvasGradient;
  private particleElements: HTMLElement[] = [];

  private readonly CITIES: ReadonlyArray<readonly [number, number]> = [
    [40.7, -74], [51.5, -0.1], [35.7, 139.7], [-33.9, 151.2], [48.9, 2.3],
    [19.1, 72.9], [-23.5, -46.6], [55.8, 37.6], [1.3, 103.8], [-1.3, 36.8],
    [30, 31.2], [41, 28.9], [25.2, 55.3], [-34.6, -58.4], [37.8, -122.4],
    [52.5, 13.4], [59.9, 30.3], [39.9, 116.4], [28.6, 77.2], [33.9, -6.9]
  ];

  private readonly CONTINENTS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
    [[71, -141], [60, -141], [48, -124], [30, -118], [18, -110], [15, -95], [8, -82], [18, -80], [25, -80], [32, -81], [40, -74], [44, -66], [47, -53], [52, -55], [60, -64], [66, -68], [72, -80], [75, -95], [80, -110], [80, -125], [75, -135], [70, -141]],
    [[12, -72], [10, -63], [6, -60], [4, -53], [2, -53], [-5, -35], [-15, -39], [-23, -43], [-33, -53], [-42, -65], [-55, -68], [-55, -65], [-42, -73], [-30, -72], [-22, -70], [-18, -70], [-5, -81], [0, -80], [8, -77], [12, -72]],
    [[36, -5], [44, 2], [46, 8], [47, 16], [44, 24], [42, 28], [41, 30], [37, 36], [32, 34], [30, 33], [24, 38], [12, 44], [2, 42], [-12, 44], [-18, 36], [-30, 18], [-35, 18], [-40, 18], [-46, 14], [-34, -18], [-18, -12], [-4, -8], [4, 2], [6, 3], [4, 8], [4, 14], [4, 20], [10, 24], [14, 30], [18, 38], [24, 38], [20, 44], [12, 44], [5, 38], [-2, 38], [0, 10], [6, 1], [4, -8], [0, -10], [-4, -8], [-10, 0], [-18, 12], [-24, 14], [-30, 18], [-36, 14], [-36, 8], [-36, 0], [-30, -8], [-22, -12], [-14, -12], [-10, -6], [-6, -2], [0, 4], [2, 10], [0, 16], [2, 22], [8, 24], [12, 24], [12, 32], [16, 36], [24, 32], [28, 28], [28, 24], [36, 22], [36, 14], [36, 5], [36, -5]],
    [[72, 130], [60, 163], [52, 160], [44, 146], [36, 140], [36, 136], [30, 122], [24, 122], [18, 110], [10, 104], [2, 104], [-8, 114], [-8, 130], [-4, 135], [2, 138], [6, 125], [10, 125], [14, 120], [18, 122], [24, 120], [28, 116], [36, 118], [36, 124], [40, 130], [44, 132], [44, 136], [48, 140], [56, 143], [60, 150], [60, 163], [65, 170], [72, 180], [80, 160], [80, 140], [75, 130], [70, 120], [70, 110], [66, 100], [66, 90], [70, 80], [72, 80], [80, 60], [76, 50], [72, 44], [72, 40], [70, 34], [65, 30], [60, 28], [55, 28], [52, 22], [48, 18], [44, 12], [38, 16], [36, 22], [36, 30], [36, 36], [40, 40], [42, 48], [42, 54], [44, 60], [48, 68], [48, 75], [44, 80], [44, 90], [44, 100], [48, 110], [52, 120], [56, 120], [60, 120], [65, 120], [70, 120]],
    [[-18, 122], [-14, 128], [-12, 136], [-10, 136], [-12, 142], [-14, 148], [-22, 150], [-32, 152], [-38, 147], [-38, 140], [-34, 136], [-32, 128], [-26, 122], [-18, 122]]
  ];

  constructor(
    private readonly ngZone: NgZone,
    private readonly router: Router
  ) {}

  ngAfterViewInit(): void {
    this.setupBackground();
    this.setupGlobe();
    this.setupParticles();
    this.positionGlobe();
    this.playEntryAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.bgAnimId) {
      cancelAnimationFrame(this.bgAnimId);
    }

    this.entryTL?.kill();
    gsap.killTweensOf(this.globeWrap?.nativeElement);
    gsap.killTweensOf(this.particleElements);
    this.globeSurfaceTexture?.dispose?.();
    this.globeGridTexture?.dispose?.();

    this.scene?.traverse((obj: any) => {
      const mesh = obj as any;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }

      const material = mesh.material as any;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material?.dispose();
      }
    });

    this.renderer?.dispose();
    this.particlesLayer.nativeElement.innerHTML = '';
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.resizeBackground();
    this.positionGlobe();
  }

  protected onAllowLocation(): void {
    if (this.isLocationGranted) {
      return;
    }

    this.isLocationGranted = true;
    const button = this.allowBtn.nativeElement;
    button.classList.add('allow-btn--granted');

    gsap.timeline()
      .to(button, { scale: 0.96, duration: 0.08, ease: 'power1.in' })
      .to(button, { scale: 1, duration: 0.2, ease: 'back.out(2)' });

    if (!navigator.geolocation) {
      window.setTimeout(() => this.router.navigate(['/home']), 1200);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => window.setTimeout(() => this.router.navigate(['/home']), 1200),
      () => window.setTimeout(() => this.router.navigate(['/home']), 1200)
    );
  }

  protected onSkip(): void {
    gsap.to(this.rootRef.nativeElement, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => void this.router.navigate(['/home'])
    });
  }

  private getBreakpointConfig(): { globeSize: number; layout: 'mobile' | 'tablet' | 'desktop' } {
    const width = window.innerWidth;

    if (width >= 1024) {
      return { globeSize: 520, layout: 'desktop' };
    }

    if (width >= 768) {
      return { globeSize: 380, layout: 'tablet' };
    }

    return { globeSize: 300, layout: 'mobile' };
  }

  private setupBackground(): void {
    this.resizeBackground();

    this.ngZone.runOutsideAngular(() => {
      const tick = (timestamp: number) => {
        if (!this.bgStart) {
          this.bgStart = timestamp;
        }

        if (!this.bgCtx) {
          return;
        }

        const canvas = this.bgCanvas.nativeElement;
        const width = canvas.width;
        const height = canvas.height;
        const time = (timestamp - this.bgStart) / 1000;

        this.bgCtx.fillStyle = '#04080f';
        this.bgCtx.fillRect(0, 0, width, height);

        if (this.nebula1 && this.nebula2) {
          this.bgCtx.fillStyle = this.nebula1;
          this.bgCtx.fillRect(0, 0, width, height);
          this.bgCtx.fillStyle = this.nebula2;
          this.bgCtx.fillRect(0, 0, width, height);
        }

        this.stars.forEach((star) => {
          const alpha = 0.12 + 0.45 * Math.abs(Math.sin(time * star.speed + star.phase));
          this.bgCtx?.beginPath();
          this.bgCtx?.arc(star.x, star.y, star.r, 0, Math.PI * 2);
          this.bgCtx!.fillStyle = `rgba(220,235,255,${alpha})`;
          this.bgCtx?.fill();
        });

        this.bgAnimId = requestAnimationFrame(tick);
      };

      this.bgAnimId = requestAnimationFrame(tick);
    });
  }

  private resizeBackground(): void {
    const canvas = this.bgCanvas.nativeElement;
    const width = canvas.offsetWidth || window.innerWidth;
    const height = canvas.offsetHeight || window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    this.bgCtx = canvas.getContext('2d') ?? undefined;
    if (!this.bgCtx) {
      return;
    }

    this.nebula1 = this.bgCtx.createRadialGradient(width * 0.35, height * 0.38, 0, width * 0.35, height * 0.38, width * 0.55);
    this.nebula1.addColorStop(0, 'rgba(14,30,60,0.6)');
    this.nebula1.addColorStop(0.4, 'rgba(8,18,38,0.5)');
    this.nebula1.addColorStop(1, 'rgba(4,8,15,0)');

    this.nebula2 = this.bgCtx.createRadialGradient(width * 0.7, height * 0.6, 0, width * 0.7, height * 0.6, width * 0.4);
    this.nebula2.addColorStop(0, 'rgba(10,25,50,0.4)');
    this.nebula2.addColorStop(1, 'rgba(4,8,15,0)');

    this.stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1 + 0.2,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2
    }));
  }

  private setupGlobe(): void {
    const { globeSize } = this.getBreakpointConfig();
    const canvas = this.globeCanvas.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.z = 2.25;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(globeSize, globeSize);
    this.renderer.setClearColor(0x000000, 0);

    this.globeGroup = new THREE.Group();
    this.globeGroup.rotation.y = 1.08;
    this.globeGroup.rotation.z = -0.28;
    this.scene.add(this.globeGroup);

    this.scene.add(new THREE.AmbientLight(0x0a1628, 2.8));

    const directionalLight = new THREE.DirectionalLight(0x38bdf8, 0.48);
    directionalLight.position.set(-1.4, 1.1, 1.6);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 0.22);
    pointLight.position.set(-1.2, 1.1, 2.2);
    this.scene.add(pointLight);

    const rimLight = new THREE.PointLight(0xf8fafc, 0.22);
    rimLight.position.set(1.7, -0.4, 2.4);
    this.scene.add(rimLight);

    const radius = 1;
    this.globeSurfaceTexture = this.createSurfaceTexture();
    this.globeGridTexture = this.createGridTexture();

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshStandardMaterial({
        map: this.globeSurfaceTexture,
        color: 0xf8fafc,
        emissive: 0x071220,
        emissiveMap: this.globeSurfaceTexture,
        roughness: 0.92,
        metalness: 0.05
      })
    );
    this.globeGroup.add(globe);

    const gridShell = new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.006, 64, 64),
      new THREE.MeshBasicMaterial({
        map: this.globeGridTexture,
        transparent: true,
        opacity: 0.24,
        depthWrite: false
      })
    );
    this.globeGroup.add(gridShell);

    const wireframe = new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.001, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.03
      })
    );
    this.globeGroup.add(wireframe);

    const specularShell = new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.01, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.035,
        shininess: 100,
        depthWrite: false
      })
    );
    this.globeGroup.add(specularShell);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.065, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.18
      })
    );
    this.globeGroup.add(atmosphere);

    this.addCityDots(radius);
    this.addContinentLines(radius);

    this.ngZone.runOutsideAngular(() => {
      const tick = () => {
        this.globeGroup!.rotation.y += 0.003;
        this.globeGroup!.rotation.x = Math.sin(performance.now() * 0.00035) * 0.025;
        this.renderer?.render(this.scene!, this.camera!);
        this.animationId = requestAnimationFrame(tick);
      };

      this.animationId = requestAnimationFrame(tick);
    });
  }

  private addCityDots(radius: number): void {
    if (!this.globeGroup) {
      return;
    }

    const positions: number[] = [];

    this.CITIES.forEach(([lat, lon]) => {
      const vertex = this.latLonToVec3(lat, lon, radius + 0.01);
      positions.push(vertex.x, vertex.y, vertex.z);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.04,
        transparent: true,
        opacity: 0.9
      })
    );

    this.globeGroup.add(points);
  }

  private addContinentLines(radius: number): void {
    if (!this.globeGroup) {
      return;
    }

    this.CONTINENTS.forEach((continent) => {
      const points = continent.map(([lat, lon]) => this.latLonToVec3(lat, lon, radius + 0.012));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.LineLoop(
        geometry,
        new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.16
        })
      );

      this.globeGroup?.add(line);
    });
  }

  private createSurfaceTexture(): any {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0b1524');
    gradient.addColorStop(0.45, '#07111f');
    gradient.addColorStop(1, '#030810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const bloom = ctx.createRadialGradient(width * 0.34, height * 0.38, 0, width * 0.34, height * 0.38, width * 0.2);
    bloom.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    bloom.addColorStop(0.55, 'rgba(56, 189, 248, 0.06)');
    bloom.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;

    for (let lat = 1; lat < 9; lat += 1) {
      const y = (lat / 9) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let lon = 1; lon < 18; lon += 1) {
      const x = (lon / 18) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    this.CONTINENTS.forEach((continent) => {
      ctx.beginPath();

      continent.forEach(([lat, lon], index) => {
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();

      const fill = ctx.createLinearGradient(0, 0, 0, height);
      fill.addColorStop(0, 'rgba(18, 38, 68, 0.95)');
      fill.addColorStop(1, 'rgba(7, 18, 34, 0.98)');
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.35;
      ctx.stroke();
    });

    this.CITIES.forEach(([lat, lon]) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      glow.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  private createGridTexture(): any {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1;

    for (let lat = 0; lat <= 10; lat += 1) {
      const y = (lat / 10) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let lon = 0; lon <= 18; lon += 1) {
      const x = (lon / 18) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }

  private latLonToVec3(lat: number, lon: number, radius: number): any {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  private setupParticles(): void {
    const container = this.particlesLayer.nativeElement;

    for (let index = 0; index < 12; index += 1) {
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

  private positionGlobe(): void {
    const { globeSize, layout } = this.getBreakpointConfig();
    const wrap = this.globeWrap.nativeElement;
    const stageWidth = this.heroStage.nativeElement.clientWidth || this.rootRef.nativeElement.clientWidth || window.innerWidth;
    const stageHeight = this.heroStage.nativeElement.clientHeight || this.rootRef.nativeElement.clientHeight || window.innerHeight;

    wrap.style.width = `${globeSize}px`;
    wrap.style.height = `${globeSize}px`;

    if (layout === 'desktop') {
      const stageCenter = stageWidth / 2;
      wrap.style.top = '50%';
      wrap.style.left = `${stageCenter - 288}px`;
      wrap.style.transform = 'translate(-50%, -50%)';
    } else {
      const preferredTop = layout === 'tablet' ? stageHeight * 0.18 : stageHeight * 0.2;
      const maxTop = layout === 'tablet' ? 132 : 168;
      const minTop = layout === 'tablet' ? 56 : 72;
      const topOffset = Math.max(minTop, Math.min(preferredTop, maxTop));
      wrap.style.left = '50%';
      wrap.style.top = `${topOffset}px`;
      wrap.style.transform = 'translateX(-50%)';
    }

    if (this.renderer && this.camera) {
      this.renderer.setSize(globeSize, globeSize);
      this.camera.updateProjectionMatrix();
    }
  }

  private playEntryAnimation(): void {
    gsap.set(
      [
        this.headline.nativeElement,
        this.description.nativeElement,
        this.allowBtn.nativeElement,
        this.skipLink.nativeElement
      ],
      { opacity: 0, y: 24 }
    );
    gsap.set(this.globeWrap.nativeElement, { opacity: 0, scale: 0.85 });
    gsap.set(this.pinDot.nativeElement, { scale: 0, opacity: 0 });

    this.entryTL = gsap.timeline({ delay: 0.3 });
    this.entryTL.to(this.globeWrap.nativeElement, {
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'back.out(1.4)'
    });
    this.entryTL.to(this.pinDot.nativeElement, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(2)'
    }, '-=0.4');
    this.entryTL.to(this.headline.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.2');
    this.entryTL.to(this.description.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4');
    this.entryTL.to(this.allowBtn.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.3');
    this.entryTL.to(this.skipLink.nativeElement, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2');
    this.entryTL.add(() => {
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
