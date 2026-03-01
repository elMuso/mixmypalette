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
  let r = rgb.r / 255,
    g = rgb.g / 255,
    b = rgb.b / 255;

  // High-precision sRGB to Linear
  r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // High-precision D65 Matrix
  const x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100;
  const y = (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100;
  const z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100;

  const f = (t: number) =>
    t > 0.008856451 ? Math.pow(t, 1 / 3) : 7.787037 * t + 16 / 116;

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
