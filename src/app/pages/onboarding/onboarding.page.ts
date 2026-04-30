import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import * as THREE from 'three';

type StarConfig = {
  top: string;
  left: string;
  size: string;
  opacity: number;
  duration: string;
  delay: string;
};

const STAR_COUNT = 30;
const GLOBE_TEXTURE_PATH = 'assets/textures/earth-texture.jpg';
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
  @ViewChild('globeCanvas', { static: true })
  private readonly globeCanvasRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('globeScene', { static: true })
  private readonly globeSceneRef?: ElementRef<HTMLDivElement>;

  protected readonly stars = this.createStars(STAR_COUNT);

  private renderer?: any;
  private scene?: any;
  private camera?: any;
  private globeMesh?: any;
  private globeTexture?: any;
  private animationFrameId?: number;
  private readonly resizeHandler = () => this.updateRendererSize();

  constructor(
    private readonly ngZone: NgZone,
    private readonly router: Router
  ) {}

  ngAfterViewInit(): void {
    this.setupGlobeScene();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);

    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.globeMesh?.geometry?.dispose?.();
    this.globeMesh?.material?.dispose?.();
    this.globeTexture?.dispose?.();
    this.renderer?.dispose?.();
  }

  protected onGetStarted(): void {
    void this.router.navigate(['/allow-location']);
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
    window.addEventListener('resize', this.resizeHandler);

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

  private createStars(count: number): StarConfig[] {
    return Array.from({ length: count }, (_, index) => ({
      top: `${(index * 17) % 100}%`,
      left: `${(index * 29 + 11) % 100}%`,
      size: `${index % 4 === 0 ? 3 : 2}px`,
      opacity: index % 3 === 0 ? 0.85 : 0.45,
      duration: `${5 + (index % 4) * 1.2}s`,
      delay: `${(index % 5) * 0.6}s`
    }));
  }
}
