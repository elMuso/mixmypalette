import { createSignal, Show, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { useSharedState } from "./store";

export function ImageSampler() {
  const [state, setState] = useSharedState();
  const [samplePos, setSamplePos] = createSignal({ x: 0, y: 0 });
  const [glassPos, setGlassPos] = createSignal({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [zoomColor, setZoomColor] = createSignal("#000000");

  let imgRef!: HTMLImageElement;
  let canvasRef!: HTMLCanvasElement;
  let lastMousePos = { x: 0, y: 0 };

  // This helper calculates the exact rectangle of the pixels inside the img tag
  const getDisplayedImageRect = () => {
    const rect = imgRef.getBoundingClientRect();
    const ratio = imgRef.naturalWidth / imgRef.naturalHeight;
    const containerRatio = rect.width / rect.height;

    let width = rect.width;
    let height = rect.height;
    let left = rect.left;
    let top = rect.top;

    if (containerRatio > ratio) {
      width = height * ratio;
      left += (rect.width - width) / 2;
    } else {
      height = width / ratio;
      top += (rect.height - height) / 2;
    }

    return { left, top, width, height };
  };

  const updateColor = (relX: number, relY: number, currentRect: any) => {
    if (!imgRef) return;
    const ctx = canvasRef.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvasRef.width = imgRef.naturalWidth;
    canvasRef.height = imgRef.naturalHeight;
    ctx.drawImage(imgRef, 0, 0);

    // Map relative coordinates to natural image pixels
    const scaleX = imgRef.naturalWidth / currentRect.width;
    const scaleY = imgRef.naturalHeight / currentRect.height;

    const [r, g, b] = ctx.getImageData(
      Math.max(0, Math.min(relX * scaleX, imgRef.naturalWidth - 1)),
      Math.max(0, Math.min(relY * scaleY, imgRef.naturalHeight - 1)),
      1,
      1,
    ).data;

    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    setZoomColor(hex);
    setState("targetColor", hex);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging()) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const currentRect = getDisplayedImageRect();

    // DELTA logic for "drifting" feel
    const deltaX = clientX - lastMousePos.x;
    const deltaY = clientY - lastMousePos.y;
    lastMousePos = { x: clientX, y: clientY };

    // Reduced sensitivity for precision movement after the initial click
    const sensitivity = 0.3;
    const newX = samplePos().x + deltaX * sensitivity;
    const newY = samplePos().y + deltaY * sensitivity;

    setSamplePos({ x: newX, y: newY });
    setGlassPos({ x: clientX, y: clientY });
    updateColor(newX, newY, currentRect);
  };

  const handleStart = (e: MouseEvent | TouchEvent) => {
    const displayedRect = getDisplayedImageRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    // Correct Initial Position: Localize to the actual pixel box
    const startX = clientX - displayedRect.left;
    const startY = clientY - displayedRect.top;

    setIsDragging(true);
    lastMousePos = { x: clientX, y: clientY };
    setSamplePos({ x: startX, y: startY });
    setGlassPos({ x: clientX, y: clientY });
    updateColor(startX, startY, displayedRect);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  };

  const handleEnd = () => {
    setIsDragging(false);
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("touchmove", handleMove);
    window.removeEventListener("touchend", handleEnd);
  };

  onCleanup(handleEnd);

  return (
    <div
      class="relative w-full h-[stretch] flex items-center justify-center select-none touch-none bg-slate-950/50 rounded-xl"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      oncontextmenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} class="hidden" />
      <img
        ref={imgRef}
        src={state.imageRef!}
        class="w-full h-full object-contain pointer-events-none"
        on:dragstart={(e: DragEvent) => e.preventDefault()}
      />

      <Show when={isDragging()}>
        <Portal mount={document.body}>
          <div
            class="fixed pointer-events-none z-9999"
            style={{
              left: `${glassPos().x}px`,
              top: `${glassPos().y}px`,
              transform: "translate(-50%, -130%)",
            }}
          >
            <div class="w-32 h-32 rounded-full border-4 border-white bg-slate-900 shadow-2xl overflow-hidden relative">
              <div
                class="absolute inset-0"
                style={{
                  "background-image": `url(${state.imageRef})`,
                  // background-size and position must also respect the scaled rect
                  "background-size": `${getDisplayedImageRect().width * 12}px auto`,
                  "background-position": `${-samplePos().x * 12 + 64}px ${-samplePos().y * 12 + 64}px`,
                  "image-rendering": "pixelated",
                }}
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-4 h-4 border-2 border-white mix-blend-difference" />
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
}
