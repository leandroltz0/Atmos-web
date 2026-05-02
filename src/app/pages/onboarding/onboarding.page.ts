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

import { APP_ROUTE_PATHS } from '../../shared/constants/app-routes';
import { createStarfieldState, drawStarfieldFrame, StarfieldState } from '../../shared/utils/canvas-starfield';
import { DisposableResource, disposeMaterial } from '../../shared/utils/three-disposal';

type CameraLike = {
  aspect: number;
  position: { set: (x: number, y: number, z: number) => void };
  updateProjectionMatrix: () => void;
};

type GlobeMeshLike = {
  geometry: DisposableResource;
  material: DisposableResource | DisposableResource[];
  rotation: { x: number; y: number };
};

type RendererLike = DisposableResource & {
  render: (scene: unknown, camera: unknown) => void;
  setClearColor: (color: number, alpha?: number) => void;
  setPixelRatio: (value: number) => void;
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
};

type SceneLike = {
  add: (object: unknown) => void;
};

type TextureLike = DisposableResource & {
  colorSpace?: unknown;
};

const GLOBE_TEXTURE_PATH = 'assets/textures/earth.jpg';
const GLOBE_EMISSIVE_COLOR = 0x273a6b;

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

  private renderer?: RendererLike;
  private scene?: SceneLike;
  private camera?: CameraLike;
  private globeMesh?: GlobeMeshLike;
  private globeTexture?: TextureLike;
  private starfield?: StarfieldState;
  private backgroundAnimationFrameId?: number;
  private backgroundStartTime?: number;
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

    this.globeMesh?.geometry.dispose?.();
    disposeMaterial(this.globeMesh?.material);
    this.globeTexture?.dispose?.();
    this.renderer?.dispose?.();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.resizeBackground();
    this.updateRendererSize();
  }

  protected onGetStarted(): void {
    void this.router.navigate([`/${APP_ROUTE_PATHS.allowLocation}`]);
  }

  // Reuses the premium canvas starfield from allow-location.
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

    this.starfield = createStarfieldState(canvas) ?? undefined;
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
        color: 0xf4f8ff,
        emissive: GLOBE_EMISSIVE_COLOR,
        emissiveMap: globeTexture,
        emissiveIntensity: 0.82,
        roughness: 0.94,
        metalness: 0.02
      })
    );
    scene.add(globeMesh);

    const keyLight = new THREE.DirectionalLight(0xddeeff, 2.2);
    keyLight.position.set(4, 1.5, 3);
    scene.add(keyLight);

    const ambientLight = new THREE.AmbientLight(0x223355, 0.72);
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
