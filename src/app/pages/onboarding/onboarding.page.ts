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
import * as THREE from 'three';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss']
})
export class OnboardingPage implements AfterViewInit, OnDestroy {
  @ViewChild('moonCanvas', { static: true })
  private readonly moonCanvasRef?: ElementRef<HTMLCanvasElement>;

  @ViewChild('moonScene', { static: true })
  private readonly moonSceneRef?: ElementRef<HTMLDivElement>;

  protected readonly stars = this.createStars(30);

  private renderer?: any;
  private scene?: any;
  private camera?: any;
  private moon?: any;
  private moonTexture?: any;
  private animationFrameId?: number;
  private resizeObserver!: ResizeObserver;
  private resizeHandler = () => this.updateRendererSize();

  constructor(private readonly ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initThreeScene();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);

    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.moon?.geometry.dispose();
    this.moon?.material.dispose();
    this.moonTexture?.dispose();
    this.resizeObserver?.disconnect();
    this.renderer?.dispose();
  }

  // Sets up the moon scene once the canvas exists in the view.
  private initThreeScene(): void {
    const canvas = this.moonCanvasRef?.nativeElement;

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
    const moonTexture = textureLoader.load('assets/textures/moon-texture.jpg', () => {
      this.updateRendererSize();
    });
    moonTexture.colorSpace = THREE.SRGBColorSpace;

    const moonGeometry = new THREE.SphereGeometry(1, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 1,
      metalness: 0
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    scene.add(moon);

    const sunlight = new THREE.DirectionalLight(0xddeeff, 2.2);
    sunlight.position.set(4, 1.5, 3);
    scene.add(sunlight);

    const ambientLight = new THREE.AmbientLight(0x223355, 0.35);
    scene.add(ambientLight);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.moon = moon;
    this.moonTexture = moonTexture;

    this.updateRendererSize();
    window.addEventListener('resize', this.resizeHandler);
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.moonCanvasRef?.nativeElement.parentElement!);

    this.ngZone.runOutsideAngular(() => this.animateMoon());
  }

  private onResize(): void {
    const canvas = this.moonCanvasRef?.nativeElement;
    const camera = this.camera;
    const renderer = this.renderer;

    if (!canvas || !camera || !renderer) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) {
      return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  // Keeps the renderer in sync with the responsive container dimensions.
  private updateRendererSize(): void {
    const renderer = this.renderer;
    const camera = this.camera;
    const container = this.moonSceneRef?.nativeElement;

    if (!renderer || !camera || !container) {
      return;
    }

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // Runs the slow moon rotation loop requested by the design brief.
  private animateMoon(): void {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const moon = this.moon;

    if (!renderer || !scene || !camera || !moon) {
      return;
    }

    moon.rotation.y += 0.0018;
    moon.rotation.x += 0.0002;

    renderer.render(scene, camera);
    this.animationFrameId = requestAnimationFrame(() => this.animateMoon());
  }

  private createStars(count: number): Array<{
    top: string;
    left: string;
    size: string;
    opacity: number;
    duration: string;
    delay: string;
  }> {
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
