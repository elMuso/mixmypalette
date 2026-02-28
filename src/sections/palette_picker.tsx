import { For } from "solid-js";
import { useSharedState } from "./store";
import { Paint } from "./types";
import { ColorPickerPortal } from "./palette_portal";

export function PalettePicker() {
  const [state, setState] = useSharedState();

  const handleRemoveRequest = (color: Paint) => {
    setState({
      confirmPortalOpen: true,
      confirmMessage: `Remove "${color.hex}" from your base palette?`,
      confirmAction: () => {
        setState("palette", (p) => p.filter((item) => item.id !== color.id));
        setState("recipe", (r) => r.filter((item) => item.id !== color.id));
      },
    });
  };

  return (
    <header class="relative z-20 px-6 py-4 w-full bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
      <div class="mx-auto flex w-full items-center gap-6">
        {/* Label */}
        <div class="hidden md:block shrink-0 border-r border-white/10 pr-6">
          <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Your Palette
          </h2>
          <p class="text-[9px] text-slate-600 font-mono">
            {state.palette.length} Colors
          </p>
        </div>

        <div class="flex flex-1 items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
          {/* Add Button */}
          <button
            onClick={() => setState("palettePortalOpen", true)}
            class="shrink-0 w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center group active:scale-95"
          >
            <span class="text-xl text-slate-500 group-hover:text-blue-400 transition-colors">
              +
            </span>
          </button>

          <div class="flex items-center gap-3">
            <For each={state.palette}>
              {(color) => (
                <div
                  class="shrink-0 group relative flex flex-col items-center gap-2"
                  onClick={() => handleRemoveRequest(color)}
                >
                  {/* The Paint Swatch */}
                  <div
                    class="w-12 h-12 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 group-hover:rounded-xl group-hover:scale-110 group-active:scale-95 shadow-lg border-2 border-white/20 hover:border-white/40"
                    style={{
                      "background-color": color.hex,
                      "box-shadow": `inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)`,
                    }}
                  >
                    {/* Glossy Overlay */}
                    <div class="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent pointer-events-none" />

                    {/* Delete Icon Overlay */}
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-red-600/80 backdrop-blur-[2px] flex items-center justify-center transition-all">
                      <span class="text-white text-sm font-bold">✕</span>
                    </div>
                  </div>

                  {/* Hex Label below swatch (Optional: keep or remove depending on preference) */}
                  <span class="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                    {color.hex.replace("#", "")}
                  </span>

                  {/* Floating Hex Tooltip */}
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-mono px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10 translate-y-2 group-hover:translate-y-0 z-30">
                    {color.hex.toUpperCase()}
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      <ColorPickerPortal
        mode="palette"
        open={state.palettePortalOpen}
        onClose={() => setState("palettePortalOpen", false)}
      />
    </header>
  );
}
