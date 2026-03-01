import mixbox from "mixbox";
import { rgbToXyz, xyzToLab, deltaE94 } from "./color_conversion";
import { RecipeItem } from "./types";

// High-speed hex parsing
const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

// Precise hex formatting
const toHex = (x: number) => {
  const hex = Math.round(x).toString(16).padStart(2, "0");
  return hex;
};

export const getMixedHex = (recipe: { hex: string; parts: number }[]) => {
  const totalParts = recipe.reduce((acc, c) => acc + c.parts, 0);
  if (totalParts <= 0) return "#000000";

  let latent_mix = [0, 0, 0, 0, 0, 0, 0];

  for (const item of recipe) {
    if (item.parts > 0) {
      // Pass hex directly to mixbox to use its internal parser
      const latent = mixbox.rgbToLatent(item.hex);
      const ratio = item.parts / totalParts;
      for (let i = 0; i < 7; i++) {
        latent_mix[i] += latent[i] * ratio;
      }
    }
  }

  const [r, g, b] = mixbox.latentToRgb(latent_mix);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const calculateMatch = (currentHex: string, targetHex: string) => {
  const lab1 = xyzToLab(rgbToXyz(hexToRgb(currentHex)));
  const lab2 = xyzToLab(rgbToXyz(hexToRgb(targetHex)));
  return Math.max(0, 100 - deltaE94(lab1, lab2));
};

// Helper: Calculate Relative Luminance (Standard WCAG)
const getLuminance = (r: number, g: number, b: number) => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

export const getNormalizedRecipe = (recipe: RecipeItem[]) => {
  const activeItems = recipe.filter((item) => item.parts > 0);
  if (activeItems.length === 0) return [];

  const getGCD = (numbers: number[]): number => {
    const _gcd = (a: number, b: number): number =>
      b === 0 ? a : _gcd(b, a % b);
    return numbers.reduce((a, b) => _gcd(a, b));
  };

  const commonFactor = getGCD(activeItems.map((item) => item.parts));

  return activeItems.map((item) => {
    return getData(item, commonFactor);
  });
};
const rgbToHslString = (r: number, g: number, b: number): string => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

export const getData = (item: RecipeItem, factor: number) => {
  const r = parseInt(item.hex.slice(1, 3), 16);
  const g = parseInt(item.hex.slice(3, 5), 16);
  const b = parseInt(item.hex.slice(5, 7), 16);
  const lab = xyzToLab(rgbToXyz({ r, g, b }));
  const luminance = getLuminance(r, g, b);

  return {
    ...item,
    displayParts: item.parts / factor,
    rgb: `${r}, ${g}, ${b}`,
    lab: `L:${lab.l.toFixed(1)} a:${lab.a.toFixed(1)} b:${lab.b.toFixed(1)}`,
    hsl: rgbToHslString(r, g, b),
    isDark: luminance < 0.5,
  };
};
