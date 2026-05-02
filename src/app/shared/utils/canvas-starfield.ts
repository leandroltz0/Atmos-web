export type SpaceStar = {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
};

export type StarfieldState = {
  context: CanvasRenderingContext2D;
  height: number;
  nebulaPrimary: CanvasGradient;
  nebulaSecondary: CanvasGradient;
  stars: SpaceStar[];
  width: number;
};

const DEFAULT_STAR_COUNT = 90;
const BACKGROUND_FILL = '#04080f';

export function createStarfieldState(
  canvas: HTMLCanvasElement,
  starCount = DEFAULT_STAR_COUNT
): StarfieldState | null {
  const width = canvas.offsetWidth || window.innerWidth;
  const height = canvas.offsetHeight || window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  return {
    context,
    width,
    height,
    nebulaPrimary: createNebulaPrimary(context, width, height),
    nebulaSecondary: createNebulaSecondary(context, width, height),
    stars: createBackgroundStars(width, height, starCount)
  };
}

export function drawStarfieldFrame(state: StarfieldState, elapsedSeconds: number): void {
  const { context, height, nebulaPrimary, nebulaSecondary, stars, width } = state;

  context.fillStyle = BACKGROUND_FILL;
  context.fillRect(0, 0, width, height);

  context.fillStyle = nebulaPrimary;
  context.fillRect(0, 0, width, height);
  context.fillStyle = nebulaSecondary;
  context.fillRect(0, 0, width, height);

  stars.forEach((star) => {
    const alpha = 0.12 + 0.45 * Math.abs(Math.sin(elapsedSeconds * star.speed + star.phase));

    context.beginPath();
    context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    context.fillStyle = `rgba(220,235,255,${alpha})`;
    context.fill();
  });
}

function createBackgroundStars(width: number, height: number, starCount: number): SpaceStar[] {
  return Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1 + 0.2,
    speed: Math.random() * 0.003 + 0.001,
    phase: Math.random() * Math.PI * 2
  }));
}

function createNebulaPrimary(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasGradient {
  const gradient = context.createRadialGradient(
    width * 0.35,
    height * 0.38,
    0,
    width * 0.35,
    height * 0.38,
    width * 0.55
  );

  gradient.addColorStop(0, 'rgba(14,30,60,0.6)');
  gradient.addColorStop(0.4, 'rgba(8,18,38,0.5)');
  gradient.addColorStop(1, 'rgba(4,8,15,0)');

  return gradient;
}

function createNebulaSecondary(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): CanvasGradient {
  const gradient = context.createRadialGradient(
    width * 0.7,
    height * 0.6,
    0,
    width * 0.7,
    height * 0.6,
    width * 0.4
  );

  gradient.addColorStop(0, 'rgba(10,25,50,0.4)');
  gradient.addColorStop(1, 'rgba(4,8,15,0)');

  return gradient;
}
