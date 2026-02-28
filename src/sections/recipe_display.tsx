import { For, createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useSharedState } from "./store";
import tinycolor from "tinycolor2";
import { rgbToXyz, xyzToLab } from "./color_conversion"; // Adjust path as needed

// Helper to simplify the recipe for the human eye
export const getGCD = (numbers: number[]): number => {
  if (numbers.length === 0) return 1;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  return numbers.reduce((acc, next) => gcd(Math.round(acc), Math.round(next)));
};

export function RecipeDisplay() {
  const [state] = useSharedState();
  const [selectedColor, setSelectedColor] = createSignal<any>(null);

  // Derive the human-friendly recipe
  const normalizedRecipe = () => {
    const activeItems = state.recipe.filter((item) => item.parts > 0);
    if (activeItems.length === 0) return [];

    const partsArray = activeItems.map((item) => item.parts);
    const commonFactor = getGCD(partsArray);

    return activeItems.map((item) => {
      const color = tinycolor(item.hex);
      const rgb = color.toRgb();
      const lab = xyzToLab(rgbToXyz(rgb));

      return {
        ...item,
        displayParts: item.parts / commonFactor,
        // Expanded Info for Portal
        rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        hsl: color.toHslString(),
        lab: `L:${lab.l.toFixed(1)} a:${lab.a.toFixed(1)} b:${lab.b.toFixed(1)}`,
        isDark: color.isDark(),
      };
    });
  };

  return (
    <div class="w-full">
      <div class="flex items-end space-x-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        {/* RESULT SECTION */}
        <div class="shrink-0 flex flex-col items-center gap-2">
          <span class="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md mb-1">
            Result
          </span>
          <div
            class="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/20 relative overflow-hidden group cursor-help"
            style={{ "background-color": state.resultingColor }}
          >
            <div class="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent opacity-30" />
          </div>
          <span class="text-[10px] font-mono font-bold text-white uppercase opacity-80">
            {state.resultingColor}
          </span>
        </div>

        <div class="shrink-0 flex items-center h-16 px-1">
          <div class="w-px h-8 bg-slate-800" />
        </div>

        {/* MIX SECTION */}
        <div class="flex items-center gap-3">
          <For each={normalizedRecipe()}>
            {(item, index) => (
              <div
                onClick={() => setSelectedColor(item)}
                class="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <Show
                  when={index() === 0}
                  fallback={<span class="text-[9px] invisible mb-1">Mix</span>}
                >
                  <span class="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md mb-1">
                    Mix
                  </span>
                </Show>

                <div
                  class="w-16 h-16 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden flex items-center justify-center group"
                  style={{ "background-color": item.hex }}
                >
                  <div class="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                  <div class="z-10 bg-black/40 backdrop-blur-md w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span class="text-[11px] font-black text-white">
                      {item.displayParts}
                    </span>
                  </div>
                </div>
                <span class="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter">
                  {item.hex}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* DETAILED COLOR PORTAL */}
      <Show when={selectedColor()}>
        <Portal mount={document.body}>
          <div
            class="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setSelectedColor(null)}
          >
            <div
              class="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                class="w-full h-40 rounded-3xl mb-6 shadow-inner border border-white/10 relative flex items-center justify-center"
                style={{ "background-color": selectedColor().hex }}
              >
                <div class="bg-black/60 backdrop-blur-lg px-4 py-2 rounded-2xl border border-white/20 flex flex-col items-center">
                  <span class="text-white font-black text-3xl leading-none">
                    {selectedColor().displayParts}
                  </span>
                  <span class="text-[9px] text-white/50 uppercase font-bold tracking-widest">
                    Parts in Mix
                  </span>
                </div>
              </div>

              <div class="space-y-4 mb-8">
                <div>
                  <h2 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                    Identity
                  </h2>
                  <p class="text-xl font-black text-white uppercase">
                    {selectedColor().hex}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <p class="text-[8px] font-bold text-blue-500 uppercase mb-1">
                      RGB Values
                    </p>
                    <p class="text-[11px] font-mono text-white">
                      {selectedColor().rgb}
                    </p>
                  </div>
                  <div class="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    <p class="text-[8px] font-bold text-purple-500 uppercase mb-1">
                      CIE LAB
                    </p>
                    <p class="text-[11px] font-mono text-white">
                      {selectedColor().lab}
                    </p>
                  </div>
                </div>

                <div class="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                  <p class="text-[8px] font-bold text-emerald-500 uppercase mb-1">
                    HSL Representation
                  </p>
                  <p class="text-[11px] font-mono text-white">
                    {selectedColor().hsl}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedColor(null)}
                class="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-lg"
              >
                Return to Palette
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
}
