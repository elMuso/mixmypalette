import { Portal } from "solid-js/web";
import { Show } from "solid-js";
import { useSharedState } from "./store";

export function ConfirmPortal() {
  const [state, setState] = useSharedState();

  const handleCancel = () => {
    setState({
      confirmPortalOpen: false,
      confirmMessage: "",
      confirmAction: null,
    });
  };

  const handleConfirm = () => {
    // If there is a function stored in the state, run it!
    if (state.confirmAction) {
      state.confirmAction();
    }
    handleCancel(); // Close after acting
  };

  return (
    <Show when={state.confirmPortalOpen}>
      <Portal mount={document.body}>
        <div class="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div class="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div class="flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-2xl border border-amber-500/20 mb-6">
                ⚠️
              </div>

              <h2 class="text-white font-black uppercase tracking-widest text-xs mb-2">
                Are you sure?
              </h2>
              <p class="text-slate-400 text-sm leading-relaxed mb-10">
                {state.confirmMessage || "This action cannot be undone."}
              </p>

              <div class="flex flex-col w-full space-y-3">
                <button
                  onClick={handleConfirm}
                  class="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  Confirm Action
                </button>
                <button
                  onClick={handleCancel}
                  class="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
