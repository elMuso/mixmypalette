import { Portal } from "solid-js/web";
import { Show, createSignal, onMount } from "solid-js";
import { useSharedState } from "./store";

// Ensure these are imported so the custom elements register
import "vanilla-colorful/hex-color-picker.js";
import "vanilla-colorful/hex-input.js";

interface PortalProps {
  mode: "palette" | "target";
  open: boolean;
  onClose: () => void;
}

export function ColorPickerPortal(props: PortalProps) {
  const [state, setState] = useSharedState();
  const [currentColor, setCurrentColor] = createSignal("#3b82f6");

  // We use a specific function for the picker change to avoid re-render loops
  const onColorChange = (e: any) => {
    setCurrentColor(e.detail.value);
  };

  const handleConfirm = () => {
    if (props.mode === "palette") {
      setState("palette", (p) => [
        ...p,
        { id: Date.now(), hex: currentColor(), name: `Paint ${p.length + 1}` },
      ]);
    } else {
      setState("targetColor", currentColor());
    }
    props.onClose();
  };

  return (
    <Show when={props.open}>
      <Portal mount={document.body}>
        <div
          class="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          // Only close if we click the actual backdrop, not the modal content
          onClick={(e) => {
            if (e.target === e.currentTarget) props.onClose();
          }}
        >
          <div
            class="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in duration-200"
            // Prevent clicks inside the modal from closing it
            onClick={(e) => e.stopPropagation()}
          >
            <h2 class="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8">
              {props.mode === "palette"
                ? "Add Base Pigment"
                : "Set Target Color"}
            </h2>

            {/* THE PICKER: 
                - Added 'touch-action: none' to prevent scroll interference.
                - Ensure the class 'custom-picker' is used to size it if the tailwind w-64 isn't enough.
            */}
            <hex-color-picker
              color={currentColor()}
              class="w-64 h-64 mb-8"
              style={{ "touch-action": "none" }}
              on:color-changed={onColorChange}
            />

            <div class="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-10 flex items-center space-x-3">
              <div
                class="w-12 h-12 rounded-lg shadow-lg shrink-0"
                style={{ "background-color": currentColor() }}
              />
              {/* Note: hex-input also needs the event listener if you want to type manually */}
              <hex-input
                color={currentColor()}
                prefixed
                on:color-changed={onColorChange}
                class="bg-transparent text-white font-mono text-lg outline-none w-full"
              />
            </div>

            <div class="flex space-x-4 w-full">
              <button
                onClick={props.onClose}
                class="flex-1 py-4 text-slate-500 hover:text-slate-300 font-bold uppercase text-[10px] tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                class="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
