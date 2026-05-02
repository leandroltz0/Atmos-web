export type DisposableResource = {
  dispose?: () => void;
};

export type SceneResourceNode = {
  geometry?: DisposableResource;
  material?: DisposableResource | DisposableResource[];
};

export type SceneResourceRoot = {
  traverse: (callback: (object: SceneResourceNode) => void) => void;
};

export function disposeMaterial(material?: DisposableResource | DisposableResource[]): void {
  if (!material) {
    return;
  }

  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose?.());
    return;
  }

  material.dispose?.();
}

export function disposeSceneResources(root: SceneResourceRoot): void {
  root.traverse((object) => {
    object.geometry?.dispose?.();
    disposeMaterial(object.material);
  });
}
