import { createEffect, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { PalettePicker } from "./sections/palette_picker";
import { ColorPicker } from "./sections/color_picker";
import { RecipeDisplay } from "./sections/recipe_display";
import { CalculateButton } from "./sections/calculate_button";
import { AppState } from "./sections/types";
import { SharedStateContext } from "./sections/store";
import { ConfirmPortal } from "./sections/confirm_portal";
import { calculateMatch, getMixedHex } from "./sections/mixer";

const STORAGE_KEY = "color_finder_data";

export default function App() {
  const [state, setState] = createStore<AppState>({
    palette: [], // Start empty, let the effect load or provide defaults
    targetColor: "#3b82f6",
    resultingColor: "#3b82f6",
    imageRef: null,
    recipe: [],
    calculating: false,
    progress: 0,
    palettePortalOpen: false,
    targetImagePortal: false,
    targetPortalOpen: false,
    confirmPortalOpen: false,
    precisionMode: false,
    confirmMessage: "",
    confirmAction: null,
  });
  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({
          ...parsed,
          calculating: false,
          progress: 0,
          // Optional: ensure portals are closed on reload
          palettePortalOpen: false,
          targetImagePortal: false,
          targetPortalOpen: false,
          confirmPortalOpen: false,
          precisionMode: false,
        });
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    } else {
      setState("palette", [
        { id: 1, hex: "#ff0000" },
        { id: 2, hex: "#0000ff" },
        { id: 3, hex: "#ffff00" },
      ]);
    }
  });

  // 2. PERSISTENCE EFFECT: Sync state to LocalStorage whenever key parts change
  createEffect(() => {
    const dataToSave = {
      palette: state.palette,
      imageRef: state.imageRef,
      targetColor: state.targetColor,
      recipe: state.recipe,
      resultingColor: state.resultingColor,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  });
  createEffect(() => {
    // 1. RESET & SAFETY
    if (!state.calculating) {
      setState("precisionMode", false);
      return;
    }

    // 2. INITIALIZATION
    let branches = Array.from({ length: 4 }, () => {
      const recipe = state.palette.map((p) => ({
        ...p,
        parts: Math.floor(Math.random() * 3) + 1,
      }));
      const hex = getMixedHex(recipe);
      return {
        recipe,
        hex,
        match: calculateMatch(hex, state.targetColor),
        totalParts: recipe.reduce((acc, curr) => acc + curr.parts, 0),
      };
    });

    const initialBest = branches.reduce((prev, curr) =>
      curr.match > prev.match ? curr : prev,
    );
    setState({
      recipe: initialBest.recipe,
      resultingColor: initialBest.hex,
      progress: initialBest.match,
    });

    // 3. THE MULTI-BRANCH SOLVER
    const interval = setInterval(() => {
      if (state.palette.length === 0) return;

      let globalImproved = false;

      for (let i = 0; i < 500; i++) {
        const branchIdx = Math.floor(Math.random() * branches.length);
        const parent = branches[branchIdx];
        let testRecipe;

        // EXPLORATION VS EXPLOITATION
        if (Math.random() > (state.precisionMode ? 0.2 : 0.95)) {
          testRecipe = state.palette.map((p) => ({
            ...p,
            parts: Math.floor(Math.random() * (state.precisionMode ? 51 : 6)),
          }));
        } else {
          testRecipe = parent.recipe.map((r) => ({ ...r }));
          const targetIdx = Math.floor(Math.random() * testRecipe.length);
          const nudge = Math.random() > 0.5 ? 1 : -1;
          testRecipe[targetIdx].parts = Math.max(
            0,
            testRecipe[targetIdx].parts + nudge,
          );
        }

        const testTotalParts = testRecipe.reduce(
          (acc, curr) => acc + curr.parts,
          0,
        );
        const cap = state.precisionMode ? 1000 : 10;
        if (testTotalParts === 0 || testTotalParts > cap) continue;

        const testHex = getMixedHex(testRecipe);
        const testMatch = calculateMatch(testHex, state.targetColor);

        // --- BRANCH UPDATE LOGIC ---
        let shouldAdopt = false;

        if (testMatch > parent.match) {
          // 1. Found a better color? Take it.
          shouldAdopt = true;
        } else if (testMatch === parent.match) {
          // 2. Same color? Only take it if it simplifies the recipe.
          if (testTotalParts < parent.totalParts) {
            shouldAdopt = true;
          }
        } else if (testMatch > 95) {
          const matchDrop = parent.match - testMatch;
          const partsSaved = parent.totalParts - testTotalParts;

          if (matchDrop < 40 && partsSaved > parent.totalParts * 0.3) {
            if (Math.random() > 0.95) shouldAdopt = true;
          }
        }

        if (shouldAdopt) {
          branches[branchIdx] = {
            recipe: testRecipe,
            hex: testHex,
            match: testMatch,
            totalParts: testTotalParts,
          };

          // 4. GLOBAL SYNC: Only update the UI if we actually improved the best known match
          // or if we found the same match with fewer parts.
          const currentGlobalParts = state.recipe.reduce(
            (a, b) => a + b.parts,
            0,
          );

          if (
            testMatch > state.progress ||
            (testMatch === state.progress &&
              testTotalParts < currentGlobalParts)
          ) {
            globalImproved = true;
          }
        }
      }

      // 4. SYNC TO SOLID STORE
      if (globalImproved) {
        const champion = branches.reduce((prev, curr) => {
          if (curr.match > prev.match) return curr;
          if (
            state.precisionMode &&
            curr.match === prev.match &&
            curr.totalParts < prev.totalParts
          )
            return curr;
          return prev;
        });

        setState({
          recipe: champion.recipe,
          resultingColor: champion.hex,
          progress: champion.match,
        });

        // Halt only in Normal Mode
        if (!state.precisionMode && champion.match == 100) {
          setState("calculating", false);
        }
      }
    }, 16);

    onCleanup(() => clearInterval(interval));
  });
  return (
    <SharedStateContext.Provider value={[state, setState]}>
      <div class="flex flex-col h-screen bg-slate-800 text-slate-100 font-sans overflow-auto">
        <PalettePicker />
        <ColorPicker />
        <div class="flex flex-col landscape:flex-row-reverse w-full lg:max-w-3/4 lg:self-center">
          <CalculateButton />
          <RecipeDisplay />
        </div>
      </div>
      <ConfirmPortal />
    </SharedStateContext.Provider>
  );
}
