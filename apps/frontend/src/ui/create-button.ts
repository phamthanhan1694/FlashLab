import { esc } from '../core/utils';
import { ico } from './icons';

export function createButton(
  label: string,
  attributes: string,
  type: 'button' | 'submit' = 'button',
) {
  return `<button type="${type}" class="create-button" ${attributes} aria-label="${esc(label)}" title="${esc(label)}">${ico('plus', 22)}</button>`;
}
