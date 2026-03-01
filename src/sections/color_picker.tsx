import { Show } from "solid-js";
import { useSharedState } from "./store";
import { ColorPickerPortal } from "./palette_portal";
import { ImageSampler } from "./image_sampler";

export function ColorPicker() {
  const [state, setState] = useSharedState();
  let fileInput!: HTMLInputElement;

  const handleImageUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) =>
        setState("imageRef", event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <section class="w-full flex-1 flex flex-col items-center overflow-hidden p-2 sm:p-4 min-h-75 sm:min-h-112.5">
      <input
        type="file"
        ref={fileInput}
        class="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <div class="flex flex-col w-full max-w-5xl bg-slate-800/30 p-4 sm:p-8 rounded-4xl border border-slate-800 shadow-2xl overflow-hidden flex-1 h-full ">
        <div class="flex-none flex flex-row items-center justify-between w-full mb-4 px-2">
          <div class="flex gap-2">
            <Show
              when={!state.imageRef}
              fallback={
                <button
                  onClick={() => {
                    setState({
                      confirmPortalOpen: true,
                      confirmMessage:
                        "Remove this source image? Your sampled target color will be kept.",
                      confirmAction: () => setState("imageRef", null),
                    });
                  }}
                  class="h-12 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl flex items-center gap-2 border border-red-500/20 active:scale-95 transition-all"
                >
                  <span class="text-lg">✕</span>
                  <span class="hidden sm:inline text-xs font-bold uppercase tracking-widest">
                    Clear
                  </span>
                </button>
              }
            >
              <button
                onClick={() => fileInput.click()}
                class="h-12 px-4 bg-blue-600 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 text-white"
              >
                <span class="text-lg">📷</span>
                <span class="text-[10px] sm:text-xs font-bold uppercase">
                  Upload
                </span>
              </button>
              <button
                onClick={() => setState("targetPortalOpen", true)}
                class="h-12 px-4 bg-slate-700 rounded-xl flex items-center gap-2 border border-slate-500 active:scale-95 text-white"
              >
                <span class="text-lg">💧</span>
                <span class="text-[10px] sm:text-xs font-bold uppercase">
                  Manual
                </span>
              </button>
            </Show>
          </div>

          <div class="flex items-center gap-3 bg-slate-900/80 py-1 px-3 rounded-xl border border-slate-700">
            <p class="hidden xs:block text-[11px] text-slate-400 font-mono uppercase">
              {state.targetColor}
            </p>
            <div
              class="w-8 h-8 rounded-lg border border-white/20 shadow-inner"
              style={{ "background-color": state.targetColor }}
            />
          </div>
        </div>
        <div class="w-full flex-1 bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden relative min-h-0">
          <Show
            when={state.imageRef}
            fallback={
              <div class="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                <div class="text-4xl sm:text-6xl mb-2">🖼️</div>
                <p class="text-slate-400 font-mono text-[9px] sm:text-xs uppercase tracking-[0.3em]">
                  Drop Image
                </p>
              </div>
            }
          >
            <div class="absolute inset-0 w-full h-full">
              <ImageSampler />
            </div>
          </Show>
        </div>
      </div>

      <ColorPickerPortal
        mode="target"
        open={state.targetPortalOpen}
        onClose={() => setState("targetPortalOpen", false)}
      />
    </section>
  );
}
