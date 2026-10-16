export const defaultSpeechRate = 0.75;
export function initializeSpeechSettings(
  rate: number,
  change: (rate: number) => void,
) {
  const slider = document.getElementById('speech-rate') as HTMLInputElement;
  const output = document.getElementById(
    'speech-rate-value',
  ) as HTMLOutputElement;
  slider.value = String(rate);
  const update = () => {
    output.value = `${Number(slider.value).toFixed(2)}×`;
  };
  slider.addEventListener('input', () => {
    update();
    change(Number(slider.value));
  });
  update();
}
