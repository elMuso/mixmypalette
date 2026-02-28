declare module "mixbox" {
  /**
   * Converts an RGB color to a 7-dimensional latent space representation.
   * @param r Red value (0-255) or a hex string.
   * @param g Green value (0-255).
   * @param b Blue value (0-255).
   */
  function rgbToLatent(r: number | string, g?: number, b?: number): number[];

  /**
   * Converts a 7-dimensional latent space representation back to an RGB color.
   * @param latent The 7-dimensional array.
   */
  function latentToRgb(latent: number[]): number[];

  const mixbox: {
    rgbToLatent: typeof rgbToLatent;
    latentToRgb: typeof latentToRgb;
  };

  export default mixbox;
}
