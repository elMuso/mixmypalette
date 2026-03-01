import { For, createSignal, Show, createMemo } from "solid-js";
import { Portal } from "solid-js/web";
import { useSharedState } from "./store";
import { getNormalizedRecipe, getMixedHex } from "./mixer";
import { DetailedRecipeItem } from "./types";

export function RecipeDisplay() {
  const [state] = useSharedState();
  const [selectedColor, setSelectedColor] =
    createSignal<DetailedRecipeItem | null>(null);

  // Sort by volume (Base first)
  const sortedRecipe = createMemo<DetailedRecipeItem[]>(() => {
    const normalized = getNormalizedRecipe(state.recipe);
    return [...normalized].sort((a, b) => b.parts - a.parts);
  });

  // Helper for step-wise mixing
  const getMixOfRange = (endIndex: number): string => {
    const range = sortedRecipe().slice(0, endIndex + 1);
    if (range.length === 0) return "#000000";
    if (range.length === 1) return range[0].hex;
    return getMixedHex(range);
  };

  return (
    <div class="w-full h-36">
      <div class="flex items-end h-full w-full space-x-3 overflow-x-auto pb-4 scrollbar-hide px-2">
        {/* FINAL GOAL PREVIEW */}
        <div class="shrink-0 flex flex-col items-center gap-2">
          <span class="text-[9px] font-black uppercase tracking-[0.15em] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md mb-1">
            Target
          </span>
          <div
            onClick={() =>
              setSelectedColor({
                ...sortedRecipe()[0],
                hex: state.resultingColor,
                stepIndex: -1,
              })
            }
            class="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/20 relative overflow-hidden cursor-help"
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

        {/* STEP-BY-STEP MIX */}
        <div class="flex items-center gap-3">
          <For each={sortedRecipe()}>
            {(item, index) => (
              <div
                onClick={() =>
                  setSelectedColor({ ...item, stepIndex: index() })
                }
                class="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-transform cursor-pointer"
              >
                <span class="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md mb-1">
                  {index() === 0 ? "Base" : `Step ${index() + 1}`}
                </span>
                <div
                  class="w-16 h-16 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden flex items-center justify-center"
                  style={{ "background-color": item.hex }}
                >
                  <div class="z-10 bg-black/40 backdrop-blur-md w-10 h-10 rounded-full text-center border border-white/20 flex items-center justify-center shadow-lg">
                    <span class="text-[11px] font-black text-white m-2 leading-3">
                      {item.displayParts}
                      <br />
                      <span class="text-[8px]  font-light text-gray-100">
                        {item.percent}
                      </span>
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

      {/* EXPLICIT MIX PORTAL */}
      <Show when={selectedColor()}>
        <Portal mount={document.body}>
          <div
            class="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setSelectedColor(null)}
          >
            <div
              class="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-y-auto max-h-[95vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* STAGE COMPARISON (The Explicit Row) */}
              <div class="grid grid-cols-3 gap-2 h-24 mb-6">
                <div class="flex flex-col gap-1">
                  <div
                    class="flex-1 rounded-xl border border-white/5"
                    style={{
                      "background-color":
                        selectedColor()!.stepIndex! > 0
                          ? getMixOfRange(selectedColor()!.stepIndex! - 1)
                          : "transparent",
                    }}
                  />
                  <span class="text-[8px] text-center text-slate-500 uppercase font-bold">
                    Previous
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <div
                    class="flex-1 rounded-xl border-2 border-white/20 shadow-lg"
                    style={{ "background-color": selectedColor()!.hex }}
                  />
                  <span class="text-[8px] text-center text-white uppercase font-bold">
                    Pigment
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <div
                    class="flex-1 rounded-xl border border-white/5"
                    style={{
                      "background-color": getMixOfRange(
                        selectedColor()!.stepIndex!,
                      ),
                    }}
                  />
                  <span class="text-[8px] text-center text-emerald-500 uppercase font-bold">
                    New Mix
                  </span>
                </div>
              </div>

              {/* INSTRUCTION CARD */}
              <div class="bg-slate-950/50 p-4 rounded-2xl border border-white/5 mb-6">
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Step Strategy
                </h3>
                <div class="text-sm text-slate-200">
                  <Show
                    when={selectedColor()!.stepIndex === 0}
                    fallback={
                      <span>
                        Add <strong>{selectedColor()!.parts} units</strong> of{" "}
                        {selectedColor()!.hex} to the previous mix to reach the
                        "New Mix" result.
                      </span>
                    }
                  >
                    <span>
                      Start with <strong>{selectedColor()!.parts} units</strong>{" "}
                      of {selectedColor()!.hex} as your base mother-color.
                    </span>
                  </Show>
                </div>
              </div>

              {/* COMPACT TECHNICAL STACK (Single Column) */}
              <div class="space-y-2 mb-8 p-2 bg-slate-950/30 px-3">
                <div class="flex items-center justify-between px-3 rounded-xl">
                  <span class="text-[9px] font-bold text-slate-500 uppercase">
                    Hex
                  </span>
                  <span class="text-xs font-mono text-white uppercase">
                    {selectedColor()!.hex}
                  </span>
                </div>
                <div class="flex items-center justify-between bg-slate-950/30 px-3 ">
                  <span class="text-[9px] font-bold text-blue-500 uppercase">
                    RGB
                  </span>
                  <span class="text-xs font-mono text-white">
                    {selectedColor()!.rgb}
                  </span>
                </div>
                <div class="flex items-center justify-between bg-slate-950/30 px-3 ">
                  <span class="text-[9px] font-bold text-purple-500 uppercase">
                    Lab
                  </span>
                  <span class="text-xs font-mono text-white">
                    {selectedColor()!.lab}
                  </span>
                </div>
                <div class="flex items-center justify-between bg-slate-950/30 px-3 ">
                  <span class="text-[9px] font-bold text-emerald-500 uppercase">
                    Hsl
                  </span>
                  <span class="text-xs font-mono text-white">
                    {selectedColor()!.hsl}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedColor(null)}
                class="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
              >
                Continue Mix
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
}
