import { JSX } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      "hex-color-picker": any;
      "hex-input": any;
    }
  }
}
