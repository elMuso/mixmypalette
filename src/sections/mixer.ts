import mixbox from "mixbox";
import tinycolor from "tinycolor2";
import {
  rgbToXyz,
  xyzToLab,
  deltaE94,
  normalizeRgbString,
} from "./color_conversion";

// 1. THE MIXER (Using the Mixbox Latent Space)
export const getMixedColor = (recipe: { hex: string; parts: number }[]) => {
  const totalParts = recipe.reduce((acc, color) => acc + color.parts, 0);

  if (totalParts > 0.000001) {
    // Mixbox uses a 7-dimensional latent space for pigment simulation
    let latent_mix = [0, 0, 0, 0, 0, 0, 0];

    for (const item of recipe) {
      if (item.parts > 0.000001) {
        const latent = mixbox.rgbToLatent(item.hex);
        const ratio = item.parts / totalParts;

        for (let i = 0; i < latent.length; i++) {
          latent_mix[i] += latent[i] * ratio;
        }
      }
    }
    const mixed_rgb = mixbox.latentToRgb(latent_mix);
    // Returns the clean Hex for our store
    return tinycolor({
      r: mixed_rgb[0],
      g: mixed_rgb[1],
      b: mixed_rgb[2],
    }).toHexString();
  }
  return "#00000000"; // Transparent/Empty
};

// 2. THE MATCHER (Using DeltaE94 for human perception)
export const getMatchPercentage = (color1: string, color2: string): number => {
  if (!color1 || !color2) return 0;

  const c1Lab = xyzToLab(rgbToXyz(tinycolor(color1).toRgb()));
  const c2Lab = xyzToLab(rgbToXyz(tinycolor(color2).toRgb()));

  // deltaE94 returns the visual difference.
  // 100 - diff = similarity percentage
  const diff = deltaE94(c1Lab, c2Lab);
  return Math.max(0, Number((100 - diff).toFixed(2)));
};

export const getMixedHex = (recipe: { hex: string; parts: number }[]) => {
  const totalParts = recipe.reduce((acc, c) => acc + c.parts, 0);
  if (totalParts <= 0) return "#000000";

  let latent_mix = [0, 0, 0, 0, 0, 0, 0];
  recipe.forEach((item) => {
    const latent = mixbox.rgbToLatent(item.hex);
    const ratio = item.parts / totalParts;
    for (let i = 0; i < 7; i++) latent_mix[i] += latent[i] * ratio;
  });

  const rgb = mixbox.latentToRgb(latent_mix);
  return tinycolor({ r: rgb[0], g: rgb[1], b: rgb[2] }).toHexString();
};

export const calculateMatch = (currentHex: string, targetHex: string) => {
  const c1 = tinycolor(currentHex).toRgb();
  const c2 = tinycolor(targetHex).toRgb();
  const lab1 = xyzToLab(rgbToXyz(c1));
  const lab2 = xyzToLab(rgbToXyz(c2));

  const score = deltaE94(lab1, lab2);
  // score 0 = perfect match, score 100 = complete opposite
  return Math.max(0, 100 - score);
};
