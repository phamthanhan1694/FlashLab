import type { DotLottie } from '@lottiefiles/dotlottie-web';

/** One decorative burst; navigation or playback completion releases all resources. */
export function celebratePerfectSession(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return () => undefined;
  const overlay = document.createElement('div');
  overlay.className = 'completion-confetti';
  overlay.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  overlay.append(canvas);
  document.body.append(overlay);
  let disposed = false;
  let player: DotLottie | undefined;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    clearTimeout(timeout);
    player?.destroy();
    overlay.remove();
  };
  const timeout = setTimeout(cleanup, 12_000);
  void Promise.all([
    import('@lottiefiles/dotlottie-web'),
    import('@lottiefiles/dotlottie-web/dotlottie-player.wasm?url'),
  ])
    .then(([{ DotLottie }, { default: wasmUrl }]) => {
      if (disposed) return;
      DotLottie.setWasmUrl(wasmUrl);
      player = new DotLottie({
        canvas,
        src: '/assets/animations/confetti_on_transparent_background.lottie',
        autoplay: true,
        loop: false,
        layout: { fit: 'cover', align: [0.5, 0.5] },
      });
      player.addEventListener('complete', cleanup);
      player.addEventListener('loadError', cleanup);
    })
    .catch(cleanup);
  return cleanup;
}
