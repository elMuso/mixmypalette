// sections/color_math.ts

export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface LAB {
  l: number;
  a: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function rgbToLab(rgb: RGB): LAB {
  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Observer = 2°, Illuminant = D65
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

  const f = (t: number) =>
    t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;

  return {
    l: 116 * f(y / 100) - 16,
    a: 500 * (f(x / 95.047) - f(y / 100)),
    b: 200 * (f(y / 100) - f(z / 108.883)),
  };
}

// Calculate visual distance (Lower is better)
export function deltaE(labA: LAB, labB: LAB): number {
  const deltaL = labA.l - labB.l;
  const deltaA = labA.a - labB.a;
  const deltaB = labA.b - labB.b;
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}
