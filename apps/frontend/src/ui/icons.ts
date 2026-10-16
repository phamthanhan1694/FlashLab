const ICONS: Record<string, string> = {
  book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1zM12 5v15"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  classroom: '<path d="m2 8 10-5 10 5-10 5zM6 10v7c3 3 9 3 12 0v-7M22 8v8"/>',
  pause: '<path d="M7 5v14M17 5v14"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',

  settings:
    '<path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 2 3-1 1-3 3-1 1-3-2-2 1-3-3-2-3 1-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13z"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  volume:
    '<path d="M11 4 5 9H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="M11 4 5 9H2v6h3l6 5zM16 9l6 6m0-6-6 6"/>',
  music:
    '<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
  play: '<path d="m8 4 13 8-13 8z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',

  house:
    '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  layers:
    '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  repeat:
    '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
  chart:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 17v-5m4 5V7m4 10v-7"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  back: '<path d="M19 12H5m7-7-7 7 7 7"/>',
  cards:
    '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h5"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  pen: '<path d="m12 19 9-9-7-7-9 9-2 9zM12 5l7 7M8 16l-1 1"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  pencil: '<path d="m15 5 4 4M4 20l4-.6L20 7a2.8 2.8 0 0 0-4-4L4.6 15.6z"/>',
  trash: '<path d="M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v6m4-6v6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  star: '<path d="m12 2 3 6.6 7.2.9-5.4 5.1 1.4 7.2L12 18.3l-6.2 3.5 1.4-7.2L1.8 9.5 9 8.6z"/>',
  fire: '<path d="M12 22a8 8 0 0 0 8-8c0-5-3.5-8.5-6.5-11.5.5 4.5-1.5 6.5-4 8C8 8.2 7.5 7 7 5c-1.5 2-3 5-3 9a8 8 0 0 0 8 8z"/>',
  close: '<path d="M5 5l14 14M19 5 5 19"/>',
  upload: '<path d="M12 17V4m-5 5 5-5 5 5M4 17v3h16v-3"/>',
  trophy:
    '<path d="M7 4h10v6c0 5-2.5 8-5 8s-5-3-5-8zM7 6H3v3c0 3 2 5 5 5m9-8h4v3c0 3-2 5-5 5m-4 4v3m-4 0h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
};
export const ico = (name: string, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.cards}</svg>`;
