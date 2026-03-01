import { Show, createSignal, onCleanup } from "solid-js";
import { useSharedState } from "./store";
import { calculateMatch } from "./mixer";

export function CalculateButton() {
  const [state, setState] = useSharedState();

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = createSignal(false);

  const matchPercentage = () => {
    if (!state.recipe || state.recipe.length === 0) return 0;
    return calculateMatch(state.resultingColor, state.targetColor).toFixed(2);
  };

  const startSearch = (precision: boolean) => {
    setState({
      calculating: true,
      precisionMode: precision,
      progress: 0,
    });
  };

  const stopSearch = () => {
    setState({ calculating: false, precisionMode: false });
  };

  const handlePointerDown = (e: PointerEvent) => {
    // If already running, we don't start a timer, we just wait for the Up event to Stop
    if (state.calculating) return;

    setStartPos({ x: e.clientX, y: e.clientY });
    setIsLongPress(false);

    pressTimer = setTimeout(() => {
      setIsLongPress(true);
      startSearch(true); // Start Deep Search
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }

    if (state.calculating) {
      // If we are currently calculating, we only trigger "Stop" if
      // this release wasn't the exact moment the long-press finished.
      if (!isLongPress()) {
        stopSearch();
      }
    } else {
      // If we aren't calculating and it wasn't a long press, it's a standard tap
      if (!isLongPress()) {
        startSearch(false);
      }
    }

    // CRITICAL: Reset the long press flag so the NEXT tap
    // is treated as a fresh interaction (allowing you to Stop).
    setIsLongPress(false);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!pressTimer || state.calculating) return;

    const dist = Math.sqrt(
      Math.pow(e.clientX - startPos().x, 2) +
        Math.pow(e.clientY - startPos().y, 2),
    );

    if (dist > 15) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  onCleanup(() => {
    if (pressTimer) clearTimeout(pressTimer);
  });

  return (
    <div class="flex flex-row-reverse landscape:flex-col h-24 self-center items-center gap-3 shrink-0 select-none landscape:min-w-46">
      {/* Accuracy Badge */}
      <Show when={state.calculating || Number(matchPercentage()) > 0}>
        <div
          class="px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all animate-in fade-in slide-in-from-bottom-2"
          classList={{
            "bg-blue-900/30 text-blue-400 border-blue-800/50":
              !state.precisionMode,
            "bg-purple-900/40 text-purple-300 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]":
              state.precisionMode,
            "animate-pulse": state.calculating,
          }}
        >
          {state.precisionMode ? "🔬 Precision: " : "Accuracy: "}
          {matchPercentage()}%
        </div>
      </Show>

      <div class="relative group">
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onContextMenu={(e) => e.preventDefault()}
          class="h-16 w-36 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-300 flex flex-col items-center justify-center px-3 overflow-hidden relative border shadow-2xl active:scale-95 touch-none select-none"
          classList={{
            "bg-blue-600 border-blue-400/30 text-white shadow-blue-600/20":
              !state.calculating,
            "bg-slate-900 border-red-900/50 text-red-400":
              state.calculating && !state.precisionMode,
            "bg-slate-900 border-purple-900/50 text-purple-400":
              state.calculating && state.precisionMode,
          }}
        >
          <Show
            when={!state.calculating}
            fallback={
              <div class="flex flex-col items-center pointer-events-none">
                <span class="text-[8px] mb-1 opacity-60 tracking-[0.2em] animate-pulse">
                  {state.precisionMode ? "DEEP SEARCHING" : "COMPUTING"}
                </span>
                <span class="text-sm font-black">Stop Search</span>
              </div>
            }
          >
            <div class="flex flex-col items-center pointer-events-none">
              <svg
                class="w-5 h-5 mb-1 opacity-80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Find Mix</span>
              <span class="text-[7px] opacity-40 mt-1 lowercase font-medium">
                hold for precision
              </span>
            </div>
          </Show>

          {/* Progress Bar */}
          <Show when={state.calculating}>
            <div
              class="absolute bottom-0 left-0 h-1 transition-all duration-75"
              classList={{
                "bg-blue-500 shadow-[0_-2px_10px_rgba(59,130,246,0.8)]":
                  !state.precisionMode,
                "bg-purple-500 shadow-[0_-2px_10px_rgba(168,85,247,0.8)]":
                  state.precisionMode,
              }}
              style={{ width: `${state.progress}%` }}
            />
          </Show>
        </button>
      </div>
    </div>
  );
}
