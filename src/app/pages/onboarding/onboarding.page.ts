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
import * as THREE from 'three';

type SpaceStar = {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
};

const STAR_COUNT = 90;
const GLOBE_TEXTURE_PATH = 'assets/textures/earth.jpg';

const GLOBE_ROTATION_SPEED_Y = 0.0018;
const GLOBE_ROTATION_SPEED_X = 0.0002;

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss']
})
export class OnboardingPage implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true })
  private readonly bgCanvasRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('globeCanvas', { static: true })
  private readonly globeCanvasRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('globeScene', { static: true })
  private readonly globeSceneRef?: ElementRef<HTMLDivElement>;

  private renderer?: any;
  private scene?: any;
  private camera?: any;
  private globeMesh?: any;
  private globeTexture?: any;
  private backgroundContext?: CanvasRenderingContext2D;
  private backgroundAnimationFrameId?: number;
  private backgroundStartTime?: number;
  private nebulaPrimary?: CanvasGradient;
  private nebulaSecondary?: CanvasGradient;
  private stars: SpaceStar[] = [];
  private animationFrameId?: number;

  constructor(
    private readonly ngZone: NgZone,
    private readonly router: Router
  ) {}

  ngAfterViewInit(): void {
    this.setupBackground();
    this.setupGlobeScene();
  }

  ngOnDestroy(): void {
    if (this.backgroundAnimationFrameId !== undefined) {
      cancelAnimationFrame(this.backgroundAnimationFrameId);
    }

    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.globeMesh?.geometry?.dispose?.();
    this.globeMesh?.material?.dispose?.();
    this.globeTexture?.dispose?.();
    this.renderer?.dispose?.();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.resizeBackground();
    this.updateRendererSize();
  }

  protected onGetStarted(): void {
    void this.router.navigate(['/allow-location']);
  }

  // Reuses the premium canvas starfield from allow-location.
  private setupBackground(): void {
    this.resizeBackground();

    this.ngZone.runOutsideAngular(() => {
      const tick = (timestamp: number) => {
        if (!this.backgroundStartTime) {
          this.backgroundStartTime = timestamp;
        }

        if (!this.backgroundContext) {
          return;
        }

        const canvas = this.bgCanvasRef?.nativeElement;
        if (!canvas) {
          return;
        }

        const elapsedSeconds = (timestamp - this.backgroundStartTime) / 1000;
        this.drawBackgroundFrame(canvas.width, canvas.height, elapsedSeconds);
        this.backgroundAnimationFrameId = requestAnimationFrame(tick);
      };

      this.backgroundAnimationFrameId = requestAnimationFrame(tick);
    });
  }

  private resizeBackground(): void {
    const canvas = this.bgCanvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const width = canvas.offsetWidth || window.innerWidth;
    const height = canvas.offsetHeight || window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    this.backgroundContext = canvas.getContext('2d') ?? undefined;
    if (!this.backgroundContext) {
      return;
    }

    this.nebulaPrimary = this.backgroundContext.createRadialGradient(
      width * 0.35,
      height * 0.38,
      0,
      width * 0.35,
      height * 0.38,
      width * 0.55
    );
    this.nebulaPrimary.addColorStop(0, 'rgba(14,30,60,0.6)');
    this.nebulaPrimary.addColorStop(0.4, 'rgba(8,18,38,0.5)');
    this.nebulaPrimary.addColorStop(1, 'rgba(4,8,15,0)');

    this.nebulaSecondary = this.backgroundContext.createRadialGradient(
      width * 0.7,
      height * 0.6,
      0,
      width * 0.7,
      height * 0.6,
      width * 0.4
    );
    this.nebulaSecondary.addColorStop(0, 'rgba(10,25,50,0.4)');
    this.nebulaSecondary.addColorStop(1, 'rgba(4,8,15,0)');

    this.stars = this.createBackgroundStars(width, height);
  }

  private drawBackgroundFrame(width: number, height: number, elapsedSeconds: number): void {
    if (!this.backgroundContext) {
      return;
    }

    this.backgroundContext.fillStyle = '#04080f';
    this.backgroundContext.fillRect(0, 0, width, height);

    if (this.nebulaPrimary && this.nebulaSecondary) {
      this.backgroundContext.fillStyle = this.nebulaPrimary;
      this.backgroundContext.fillRect(0, 0, width, height);
      this.backgroundContext.fillStyle = this.nebulaSecondary;
      this.backgroundContext.fillRect(0, 0, width, height);
    }

    this.stars.forEach((star) => {
      const alpha = 0.12 + 0.45 * Math.abs(Math.sin(elapsedSeconds * star.speed + star.phase));
      this.backgroundContext?.beginPath();
      this.backgroundContext?.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      this.backgroundContext!.fillStyle = `rgba(220,235,255,${alpha})`;
      this.backgroundContext?.fill();
    });
  }

  private createBackgroundStars(width: number, height: number): SpaceStar[] {
    return Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1 + 0.2,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2
    }));
  }

  // Creates the standalone Three.js scene used by the hero globe.
  private setupGlobeScene(): void {
    const canvas = this.globeCanvasRef?.nativeElement;

    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.08, 4.1);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const textureLoader = new THREE.TextureLoader();
    const globeTexture = textureLoader.load(GLOBE_TEXTURE_PATH, () => {
      this.updateRendererSize();
    });
    globeTexture.colorSpace = THREE.SRGBColorSpace;

    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({
        map: globeTexture,
        roughness: 1,
        metalness: 0
      })
    );
    scene.add(globeMesh);

    const keyLight = new THREE.DirectionalLight(0xddeeff, 2.2);
    keyLight.position.set(4, 1.5, 3);
    scene.add(keyLight);

    const ambientLight = new THREE.AmbientLight(0x223355, 0.35);
    scene.add(ambientLight);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.globeMesh = globeMesh;
    this.globeTexture = globeTexture;

    this.updateRendererSize();

    this.ngZone.runOutsideAngular(() => this.startRenderLoop());
  }

  // Keeps the canvas renderer synced with the responsive scene container.
  private updateRendererSize(): void {
    const renderer = this.renderer;
    const camera = this.camera;
    const container = this.globeSceneRef?.nativeElement;

    if (!renderer || !camera || !container) {
      return;
    }

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // Runs the subtle hero rotation continuously outside Angular change detection.
  private startRenderLoop(): void {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const globeMesh = this.globeMesh;

    if (!renderer || !scene || !camera || !globeMesh) {
      return;
    }

    globeMesh.rotation.y += GLOBE_ROTATION_SPEED_Y;
    globeMesh.rotation.x += GLOBE_ROTATION_SPEED_X;

    renderer.render(scene, camera);
    this.animationFrameId = requestAnimationFrame(() => this.startRenderLoop());
  }
}
