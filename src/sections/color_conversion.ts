type Rgb = { r: number; g: number; b: number; a?: number };
type Xyz = { x: number; y: number; z: number };
type Lab = { l: number; a: number; b: number };

/**
 * Converts an sRGB value to a linear RGB value.
 *
 * @param {number} value sRGB value between 0 and 1
 * @return {number} linear RGB value between 0 and 1
 */
export const sRGBToLinear = (value: number): number => {
  if (value <= 0) return 0; // Clamp values below 0
  if (value >= 1) return 1; // Clamp values above 1

  if (value <= 0.04045) {
    return value / 12.92;
  } else {
    return Math.pow((value + 0.055) / 1.055, 2.4);
  }
};

/**
 * Converts an RGB color to an XYZ color.
 *
 * @param {Rgb} value rgb value between 0 and 1
 * @return {Xyz} xyz object with values between 0 and 100
 */
export const rgbToXyz = (rgb: Rgb): Xyz => {
  // Convert sRGB to linear RGB
  let rLinear = sRGBToLinear(rgb.r / 255.0);
  let gLinear = sRGBToLinear(rgb.g / 255.0);
  let bLinear = sRGBToLinear(rgb.b / 255.0);

  // Apply the transformation matrix for D65 illuminant
  let x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
  let y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175;
  let z = rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041;

  // The XYZ values are sometimes expressed within the range [0, 1]. In this case the range is scaled to [0, 100].
  return { x: x * 100, y: y * 100, z: z * 100 };
};

/**
 * Converts an XYZ color to a LAB color.
 *
 * @param {Xyz} xyz values between 0 and 1
 * @return {Lab} lab values between 0 and 1
 */
export const xyzToLab = (xyz: Xyz): Lab => {
  // Reference-X, Y and Z refer to specific illuminants and observers. D65 is the standard, and the only one we'll use.
  let refX = 95.047;
  let refY = 100.0;
  let refZ = 108.883;

  let x = xyz.x / refX;
  let y = xyz.y / refY;
  let z = xyz.z / refZ;

  if (x > 0.008856) {
    x = Math.pow(x, 1 / 3);
  } else {
    x = 7.787 * x + 16 / 116;
  }

  if (y > 0.008856) {
    y = Math.pow(y, 1 / 3);
  } else {
    y = 7.787 * y + 16 / 116;
  }

  if (z > 0.008856) {
    z = Math.pow(z, 1 / 3);
  } else {
    z = 7.787 * z + 16 / 116;
  }

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return { l, a, b };
};

/**
 * Compares two Lab colors using the CIE94 algorithm.
 * The difference score is between 0 and 100. Below 1 is generally imperceptible.
 * @param {Lab} lab1 values between 0 and 1
 * @param {Lab} lab2 values between 0 and 1
 * @return {number} difference score between 0 and 100
 */
export const deltaE94 = (lab1: Lab, lab2: Lab): number => {
  const kL = 1;
  const kC = 1;
  const kH = 1;
  const K1 = 0.045;
  const K2 = 0.015;
  const SL = 1;
  const SC = 1 + K1 * Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const SH = 1 + K2 * Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);

  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;
  const deltaC =
    Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b) -
    Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const deltaH2 = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  const deltaH = deltaH2 < 0 ? 0 : Math.sqrt(deltaH2);

  const l = deltaL / (kL * SL);
  const c = deltaC / (kC * SC);
  const h = deltaH / (kH * SH);

  return Math.sqrt(l * l + c * c + h * h);
};
