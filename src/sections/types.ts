export interface Paint {
  id: string | number;
  hex: string;
}

export interface RecipeItem extends Paint {
  parts: number;
}

export interface DetailedRecipeItem extends RecipeItem {
  rgb: string;
  lab: string;
  hsl: string;
  isDark: boolean;
  displayParts: number;
  percent: string;
  stepIndex?: number;
}

export interface AppState {
  palette: Paint[];
  targetColor: string;
  resultingColor: string;
  imageRef: string | null; // Base64 or ObjectURL
  recipe: RecipeItem[];
  calculating: boolean;
  precisionMode: boolean;
  progress: number;
  palettePortalOpen: boolean;
  targetImagePortal: boolean;
  targetPortalOpen: boolean;
  confirmPortalOpen: boolean;
  confirmMessage: string;
  confirmAction: (() => void) | null;
}
