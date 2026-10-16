import { avatarCatalog, type AvatarId } from '@flashlab/shared';
type Face = {
  fur?: string;
  ear?: 'point' | 'round' | 'flop' | 'long' | 'fold' | 'horn';
  mark?: string;
  muzzle?: string;
  eye?: string;
  tuft?: boolean;
};
const palette = ['#e7edf6', '#e8efdf', '#f5e7de', '#eee5f4', '#e0eff2'];
const marks: Record<string, string> = {
  tabby:
    '<path d="m24 18 4 8 4-7 4 7 4-8M13 33l9 3m29-3-9 3" fill="none" stroke="#695951" stroke-width="2.5"/>',
  patch:
    '<path d="M13 24Q12 9 30 17l-3 17-14 2m32-18q10 4 7 17l-11-3Z" fill="#8c6349"/>',
  calico:
    '<path d="M13 24Q12 9 30 17l-3 17-14 2" fill="#d88b49"/><path d="m45 18 7 14-11 2-4-10Z" fill="#555767"/>',
  mask: '<path d="M13 24q9-5 19 4 10-9 19-4l-1 12q-9 4-18-1-9 5-18 1Z" fill="#596273"/>',
  tuxedo:
    '<path d="M13 19q9-6 19 0 10-6 19 0v19L38 35l-6-12-6 12-13 3Z" fill="#3f4856"/><path d="m25 49 7-9 7 9-7 6Z" fill="#fff9ee"/>',
  spots:
    '<g fill="#685546"><circle cx="19" cy="21" r="2.5"/><circle cx="39" cy="19" r="2"/><circle cx="48" cy="27" r="2.5"/><circle cx="16" cy="41" r="2"/><circle cx="45" cy="42" r="2"/></g>',
  rosette:
    '<g stroke="#7a654f" stroke-width="2" fill="none"><circle cx="19" cy="22" r="3"/><circle cx="43" cy="22" r="3"/><circle cx="15" cy="39" r="3"/><circle cx="49" cy="39" r="3"/></g>',
  blaze: '<path d="M26 16h12l-3 19 8 9-11 9-11-9 8-9Z" fill="#fff7e8"/>',
  stripe:
    '<path d="M28 16h8v21h-8Z" fill="#f5f2e8"/><path d="m14 22 10 10-10 6m36-16L40 32l10 6" fill="#454a54"/>',
  wrinkles:
    '<path d="M20 25q5-5 10 0m4 0q5-5 10 0M24 18q8 5 16 0" stroke="#96745c" stroke-width="2" fill="none"/>',
  brows:
    '<path d="M19 26h7m12 0h7" stroke="#cd986a" stroke-width="4" stroke-linecap="round"/>',
};
function mammal(id: string, face: Face, background: string) {
  const fur = face.fur ?? '#cba883';
  const ear = face.ear ?? 'round';
  const ears =
    ear === 'point'
      ? `<path d="m12 29 1-22 17 13m4 0L51 7l1 22" fill="${fur}"/>`
      : ear === 'flop'
        ? `<path d="M17 17Q4 10 5 38q1 11 13 6m29-27q13-7 12 21-1 11-13 6" fill="${fur}"/>`
        : ear === 'long'
          ? `<ellipse cx="20" cy="16" rx="7" ry="15" fill="${fur}"/><ellipse cx="44" cy="16" rx="7" ry="15" fill="${fur}"/>`
          : ear === 'horn'
            ? '<path d="M19 24Q0 17 8 6m37 18Q64 17 56 6" fill="none" stroke="#a79e8d" stroke-width="6" stroke-linecap="round"/>'
            : ear === 'fold'
              ? `<path d="M13 26 8 16q14-8 18 7m12 0q4-15 18-7l-5 10" fill="${fur}"/>`
              : `<circle cx="15" cy="19" r="8" fill="${fur}"/><circle cx="49" cy="19" r="8" fill="${fur}"/>`;
  const muzzle = face.muzzle ?? 'short';
  const snout =
    muzzle === 'long'
      ? '<path d="M25 32h14l7 17q-14 13-28 0Z" fill="#e9d3b6"/>'
      : muzzle === 'wide'
        ? '<ellipse cx="32" cy="43" rx="20" ry="12" fill="#d4bdab"/>'
        : muzzle === 'bill'
          ? '<ellipse cx="32" cy="42" rx="22" ry="8" fill="#b9956e"/>'
          : '<ellipse cx="32" cy="42" rx="13" ry="10" fill="#f5e5d2"/>';
  const extra: Record<string, string> = {
    horse: '<path d="M27 13q-3-9 9-9l4 19-10-5" fill="#79573d"/>',
    zebra:
      '<path d="m24 17 8 8 8-8m-26 8 10 6-10 5m36-11-10 6 10 5" stroke="#454a54" stroke-width="3" fill="none"/>',
    rhinoceros: '<path d="m29 40 6-19 4 20" fill="#f2e8d1"/>',
    hippopotamus:
      '<circle cx="22" cy="42" r="2.5" fill="#7a7485"/><circle cx="42" cy="42" r="2.5" fill="#7a7485"/>',
    camel:
      '<path d="M20 51q12 7 24 0M19 25h8m10 0h8" stroke="#9c7657" stroke-width="2" fill="none"/>',
    goat: '<path d="m25 50 7 12 7-12" fill="#91745c"/>',
    bison:
      '<path d="M12 21Q9 1 32 7q23-6 20 14l-8 5-6-6-6 6-6-6-6 6Z" fill="#76543e"/>',
    'wild-boar': '<path d="M16 43q-6 12 6 9m26-9q6 12-6 9" fill="#fff3d9"/>',
    walrus: '<path d="m21 43 3 19 5-19m6 0 5 19 3-19" fill="#fff7df"/>',
    beaver:
      '<path d="M27 44h10v12H27Z" fill="#fffdf4"/><path d="M32 44v12" stroke="#c8b79b"/>',
    sloth:
      '<path d="m16 27 10 6m22-6-10 6" stroke="#7b675b" stroke-width="8" stroke-linecap="round"/>',
    anteater:
      '<path d="M27 34h10l10 21q-15 10-30 0Z" fill="#a18a73"/><ellipse cx="32" cy="55" rx="6" ry="3" fill="#514942"/>',
    pangolin:
      '<path d="m18 20 6 6 8-8 8 8 6-6m-32 13 9 7 9-8 9 8 9-7" fill="none" stroke="#9c8668" stroke-width="3"/>',
    'red-panda': '<path d="M14 29 25 36l-9 7m34-14L39 36l9 7" fill="#fff4df"/>',
    lynx: '<path d="M14 12 10 2m40 10 4-10" stroke="#514b48" stroke-width="3" stroke-linecap="round"/>',
    cheetah:
      '<path d="m24 32 3 10m13-10-3 10" stroke="#675340" stroke-width="2.5"/>',
  };
  const whiskers =
    /cat|siamese|shorthair|longhair|rex|fold|straight|persian|maine|ragdoll|birman|abyssinian|munchkin|angora|seal|walrus|otter|ferret|beaver/.test(
      id,
    )
      ? '<path d="M8 39l13 2M8 46l13-2m22-3 13-2m-13 5 13 2" stroke="#746657" stroke-width="1.5" stroke-linecap="round"/>'
      : '';
  return `<circle cx="32" cy="32" r="30" fill="${background}"/>${ears}<rect x="12" y="16" width="40" height="39" rx="${face.tuft ? 13 : 18}" fill="${fur}"/>${face.tuft ? `<path d="m12 24-6 8 7 3-7 10 10 2m36-23 6 8-7 3 7 10-10 2" fill="${fur}"/>` : ''}${marks[face.mark ?? ''] ?? ''}${snout}<circle cx="23" cy="31" r="2.4" fill="${face.eye ?? '#293344'}"/><circle cx="41" cy="31" r="2.4" fill="${face.eye ?? '#293344'}"/><path d="m28 39 4 4 4-4Z" fill="#51433c"/><path d="M28 47q4 4 8 0" stroke="#796253" stroke-width="2" fill="none" stroke-linecap="round"/>${whiskers}${extra[id] ?? ''}`;
}
const faces: Record<string, Face> = {
  horse: { fur: '#b8895b', ear: 'long', muzzle: 'long' },
  zebra: { fur: '#f3f2e8', ear: 'long', muzzle: 'long' },
  hippopotamus: { fur: '#a99bb3', muzzle: 'wide' },
  rhinoceros: { fur: '#a8b0b4', ear: 'point', muzzle: 'wide' },
  kangaroo: { fur: '#c9a27a', ear: 'long', muzzle: 'long' },
  camel: { fur: '#cfab76', ear: 'long', muzzle: 'long' },
  llama: { fur: '#eee2cd', ear: 'long', muzzle: 'long' },
  alpaca: { fur: '#e5d0b0', ear: 'point', tuft: true },
  goat: { fur: '#c0af94', ear: 'horn' },
  buffalo: { fur: '#85817e', ear: 'horn', muzzle: 'wide' },
  bison: { fur: '#a07a55', ear: 'horn', tuft: true },
  'wild-boar': { fur: '#9f8267', muzzle: 'long', tuft: true },
  seal: { fur: '#b7c4cb', muzzle: 'wide' },
  walrus: { fur: '#b59479', muzzle: 'wide' },
  otter: { fur: '#b68d68' },
  beaver: { fur: '#b59068' },
  'guinea-pig': { fur: '#ede0ca', mark: 'patch' },
  chipmunk: { fur: '#cda279', mark: 'stripe' },
  ferret: { fur: '#d2c0a3', mark: 'mask' },
  skunk: { fur: '#595b68', mark: 'blaze' },
  badger: { fur: '#b3b4b5', mark: 'stripe', muzzle: 'long' },
  sloth: { fur: '#cab69b' },
  anteater: { fur: '#c3b199', muzzle: 'long' },
  pangolin: { fur: '#c4b18a' },
  platypus: { fur: '#b79b7c', muzzle: 'bill' },
  'polar-bear': { fur: '#f9f8ed' },
  'red-panda': { fur: '#bd784e', ear: 'point' },
  leopard: { fur: '#e4be7d', mark: 'rosette' },
  cheetah: { fur: '#e5c990', mark: 'spots' },
  'snow-leopard': { fur: '#dce1df', mark: 'rosette' },
  lynx: { fur: '#beaa88', ear: 'point', tuft: true },
  'arctic-fox': { fur: '#f2f2e9', ear: 'point' },
  'fennec-fox': { fur: '#e5c891', ear: 'long' },
  'siberian-husky': {
    fur: '#9da8b7',
    ear: 'point',
    mark: 'blaze',
    eye: '#4d91b5',
  },
  'welsh-corgi': { fur: '#dcac70', ear: 'long', mark: 'blaze' },
  'shiba-inu': { fur: '#dba46b', ear: 'point' },
  'phu-quoc-ridgeback': { fur: '#c19a65', ear: 'point', muzzle: 'long' },
  'bac-ha-dog': { fur: '#bc9269', ear: 'point', tuft: true },
  'hmong-bobtail-dog': { fur: '#a78668', ear: 'point', muzzle: 'wide' },
  'indochinese-dingo': { fur: '#d0ab73', ear: 'point', muzzle: 'long' },
  'akita-inu': { fur: '#c7a17b', ear: 'point', mark: 'blaze' },
  samoyed: { fur: '#fff9eb', ear: 'point', tuft: true },
  'golden-retriever': { fur: '#deb67a', ear: 'flop', tuft: true },
  'labrador-retriever': { fur: '#ceb083', ear: 'flop', muzzle: 'wide' },
  poodle: { fur: '#bba593', ear: 'flop', tuft: true },
  pomeranian: { fur: '#dcb484', ear: 'point', tuft: true },
  chihuahua: { fur: '#d4b28d', ear: 'long' },
  pug: { fur: '#d3b28b', mark: 'wrinkles', muzzle: 'wide' },
  'french-bulldog': { fur: '#b1a497', ear: 'long', muzzle: 'wide' },
  'english-bulldog': {
    fur: '#d4b69b',
    ear: 'fold',
    mark: 'wrinkles',
    muzzle: 'wide',
  },
  beagle: { fur: '#d1aa82', ear: 'flop', mark: 'blaze' },
  'border-collie': { fur: '#727985', ear: 'point', mark: 'blaze', tuft: true },
  dalmatian: { fur: '#fff9eb', ear: 'flop', mark: 'spots' },
  'doberman-pinscher': {
    fur: '#62616b',
    ear: 'point',
    mark: 'brows',
    muzzle: 'long',
  },
  rottweiler: { fur: '#5d5b62', ear: 'fold', mark: 'brows', muzzle: 'wide' },
  'cocker-spaniel': { fur: '#c9a17d', ear: 'flop', tuft: true },
  'bichon-frise': { fur: '#fff8ec', tuft: true },
  dachshund: { fur: '#aa7e5d', ear: 'flop', muzzle: 'long' },
  'domestic-tabby-cat': { fur: '#b8afa2', ear: 'point', mark: 'tabby' },
  'orange-domestic-cat': { fur: '#e7b36e', ear: 'point', mark: 'tabby' },
  'calico-cat': { fur: '#fff4df', ear: 'point', mark: 'calico' },
  'tuxedo-cat': { fur: '#f4f1e4', ear: 'point', mark: 'tuxedo' },
  'siamese-cat': { fur: '#cdbb9f', ear: 'point', mark: 'mask', eye: '#4c8bb0' },
  'british-shorthair': { fur: '#a9b2bc', ear: 'round', muzzle: 'wide' },
  'british-longhair': { fur: '#c6c0bb', ear: 'round', tuft: true },
  'scottish-fold': { fur: '#d2c1a7', ear: 'fold' },
  'scottish-straight': { fur: '#d9c8ad', ear: 'point' },
  'persian-cat': { fur: '#ece2d2', ear: 'round', tuft: true, muzzle: 'wide' },
  'maine-coon': { fur: '#b5a18b', ear: 'long', tuft: true, muzzle: 'wide' },
  ragdoll: {
    fur: '#e2d4bf',
    ear: 'point',
    mark: 'mask',
    eye: '#5f92bd',
    tuft: true,
  },
  'bengal-cat': { fur: '#d2af7c', ear: 'point', mark: 'rosette' },
  'sphynx-cat': { fur: '#d8b7b1', ear: 'long', mark: 'wrinkles' },
  'munchkin-cat': { fur: '#d1b294', ear: 'point' },
  'russian-blue': { fur: '#9baebc', ear: 'point', eye: '#558768' },
  'norwegian-forest-cat': { fur: '#b7b2a5', ear: 'long', tuft: true },
  'siberian-cat': { fur: '#c4b29c', ear: 'round', tuft: true },
  'turkish-angora': { fur: '#fff6e7', ear: 'point', tuft: true },
  'american-shorthair': { fur: '#b8bdc1', ear: 'point', mark: 'tabby' },
  'abyssinian-cat': { fur: '#c59570', ear: 'long' },
  'devon-rex': { fur: '#c4b2a3', ear: 'long', mark: 'wrinkles' },
  'cornish-rex': { fur: '#d7c1a5', ear: 'long', muzzle: 'long' },
  'birman-cat': { fur: '#e8dcc5', ear: 'point', mark: 'mask', eye: '#6291ba' },
  'oriental-shorthair': { fur: '#b59d83', ear: 'long', muzzle: 'long' },
};
const birdColors: Record<string, string> = {
  parrot: '#7ab88d',
  toucan: '#535c6e',
  flamingo: '#e8a4b5',
  peacock: '#6ea9b7',
  eagle: '#e7e2d6',
  falcon: '#a2afbb',
  swan: '#fff7e9',
  goose: '#eae9dc',
  rooster: '#dcb174',
  turkey: '#ae8e73',
  hummingbird: '#7db5a0',
  sparrow: '#baa085',
  crow: '#535c6c',
  pigeon: '#a4a8c3',
  ostrich: '#c6b4a0',
};
function bird(id: string, color: string, bg: string) {
  const long = ['flamingo', 'swan', 'goose', 'ostrich'].includes(id);
  const beak =
    id === 'toucan'
      ? '<path d="M32 29Q60 16 62 33L38 44Z" fill="#e8bb64"/><path d="m52 27 10 6-8 6" fill="#dc8c68"/>'
      : id === 'hummingbird'
        ? '<path d="m32 33 30 7-30 2" fill="#775b4a"/>'
        : '<path d="m25 37 7-5 13 7-13 5Z" fill="#dba354"/>';
  const crest = ['rooster', 'turkey'].includes(id)
    ? '<path d="M24 18q-7-9 1-12 4-8 8 0 10-6 8 7l-8 7Z" fill="#c9696c"/>'
    : id === 'peacock'
      ? '<path d="M32 17V5m-3 12-9-9m15 9 9-9" stroke="#579490" stroke-width="2"/><g fill="#b5ca6a"><circle cx="32" cy="5" r="3"/><circle cx="20" cy="8" r="3"/><circle cx="44" cy="8" r="3"/></g>'
      : '';
  return `<circle cx="32" cy="32" r="30" fill="${bg}"/>${long ? `<path d="M32 58V33" stroke="${color}" stroke-width="18" stroke-linecap="round"/>` : ''}${crest}<ellipse cx="32" cy="${long ? 28 : 35}" rx="${long ? 17 : 22}" ry="${long ? 17 : 22}" fill="${color}"/><path d="M15 41q17 14 34 0-3 15-17 15T15 41" fill="#f3eadc"/><circle cx="23" cy="30" r="2.5" fill="#293344"/><circle cx="41" cy="30" r="2.5" fill="#293344"/>${beak}${id === 'eagle' || id === 'falcon' ? '<path d="m18 25 10 3m8 0 10-3" stroke="#655d52" stroke-width="2.5"/>' : ''}`;
}
const sea = [
  'shark',
  'clownfish',
  'pufferfish',
  'seahorse',
  'stingray',
  'jellyfish',
  'starfish',
  'crab',
  'lobster',
];
function seaAnimal(id: string, bg: string) {
  const eyes =
    '<circle cx="24" cy="30" r="2.5" fill="#344556"/><circle cx="40" cy="30" r="2.5" fill="#344556"/>';
  const smile =
    '<path d="M27 39q5 5 10 0" stroke="#6b6475" stroke-width="2" fill="none"/>';
  const shapes: Record<string, string> = {
    shark:
      '<path d="m8 35 20-15 7-15 8 19 13 10-8 18H18Z" fill="#9eafc3"/><path d="m20 40 24-1-4 10H24Z" fill="#fff5e3"/><path d="m24 40 3 5 4-5 4 5 5-5" fill="none" stroke="#7f8ea1" stroke-width="2"/>',
    clownfish:
      '<path d="m49 31 13-10v25l-13-8" fill="#e9a46b"/><ellipse cx="29" cy="32" rx="23" ry="18" fill="#e4a06a"/><path d="M16 18v27m15-30v34m12-27v20" stroke="#fff7e6" stroke-width="6"/>',
    pufferfish:
      '<path d="m32 5 5 7 8-4 2 9 10 1-4 9 7 6-7 6 4 10-10 1-4 10-8-5-8 5-4-10-10-1 4-10-7-6 7-6-4-9 10-1 2-9 8 4Z" fill="#c2b483"/><circle cx="32" cy="33" r="22" fill="#e0d1a3"/>',
    seahorse:
      '<path d="M36 10q-24-5-20 15l-10 8 20 2q-9 14 0 21 18 12 23-4 2-12-8-12-10 0-8 8 5-5 7 0-4 8-10 0-6-8 5-18 13-3 7-15Z" fill="#d9b486"/>',
    stingray: '<path d="m32 9 28 27-20 9-8 15-8-15-20-9Z" fill="#9ca8bf"/>',
    jellyfish:
      '<path d="M18 39q-10 19 0 19m9-18q-6 19 3 20m7-21q-3 19 6 19m3-18q7 19 11 12" stroke="#bda6d3" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M7 39q0-29 25-29t25 29q-7 8-12 0-7 8-13 0-7 8-13 0-7 8-12 0" fill="#d7c3e5"/>',
    starfish:
      '<path d="m32 4 9 17 19 5-13 15 1 20-16-10-17 10 2-20L4 26l19-5Z" fill="#e6b18e"/>',
    crab: '<path d="M18 30 8 20m38 10 10-10M16 40 5 43m12 3L8 53m40-13 11 3m-12 3 9 7" stroke="#cd987e" stroke-width="5" stroke-linecap="round"/><path d="M11 21Q-1 17 5 7l6 6 5-6q8 12-5 14m42 0q13-4 7-14l-7 6-5-6q-8 12 5 14" fill="#d5a086"/><ellipse cx="32" cy="38" rx="21" ry="16" fill="#e2b09a"/>',
    lobster:
      '<path d="M23 23 9 15m32 8 14-8M22 40l-12 5m32-5 12 5M24 47l-12 9m28-9 12 9" stroke="#bc857b" stroke-width="4" stroke-linecap="round"/><ellipse cx="10" cy="13" rx="8" ry="10" fill="#d3a198"/><ellipse cx="54" cy="13" rx="8" ry="10" fill="#d3a198"/><rect x="19" y="18" width="26" height="41" rx="12" fill="#dba99d"/><path d="M20 41h24m-23 7h22" stroke="#bd8b80" stroke-width="2"/>',
  };
  return `<circle cx="32" cy="32" r="30" fill="${bg}"/>${shapes[id]}${eyes}${smile}`;
}
function smallCreature(id: string, bg: string) {
  const shapes: Record<string, string> = {
    butterfly:
      '<path d="M29 30Q0-7 4 27q-9 24 24 17m8-14Q64-7 60 27q9 24-24 17" fill="#bca3d6"/><g fill="#e7bad0"><circle cx="15" cy="22" r="7"/><circle cx="49" cy="22" r="7"/><circle cx="16" cy="40" r="5"/><circle cx="48" cy="40" r="5"/></g><path d="M31 20v29m-2-30-6-8m11 8 6-8" stroke="#706483" stroke-width="4" stroke-linecap="round"/>',
    bee: '<ellipse cx="20" cy="21" rx="12" ry="9" fill="#f4f1e6"/><ellipse cx="44" cy="21" rx="12" ry="9" fill="#f4f1e6"/><ellipse cx="32" cy="38" rx="17" ry="20" fill="#e2c776"/><path d="M17 36h30M19 46h26" stroke="#74654c" stroke-width="6"/><circle cx="32" cy="23" r="12" fill="#e4d18d"/>',
    ladybug:
      '<path d="M20 22 14 12m30 10 6-10" stroke="#54576a" stroke-width="3"/><ellipse cx="32" cy="38" rx="23" ry="21" fill="#ce8d8c"/><path d="M32 20v38" stroke="#63576b" stroke-width="3"/><g fill="#63576b"><circle cx="20" cy="31" r="4"/><circle cx="44" cy="31" r="4"/><circle cx="19" cy="46" r="4"/><circle cx="45" cy="46" r="4"/></g><ellipse cx="32" cy="20" rx="14" ry="10" fill="#6b6576"/>',
    dragonfly:
      '<path d="M29 30Q1 6 3 24q1 10 26 11M35 30Q63 6 61 24q-1 10-26 11M29 37Q0 30 6 46q8 7 23-4m6-5q29-7 23 9-8 7-23-4" fill="#c5dae0"/><path d="M32 21v38" stroke="#7daaa9" stroke-width="6" stroke-linecap="round"/><circle cx="26" cy="20" r="7" fill="#9ac1b8"/><circle cx="38" cy="20" r="7" fill="#9ac1b8"/>',
    snail:
      '<ellipse cx="32" cy="49" rx="27" ry="9" fill="#afc4a3"/><circle cx="29" cy="32" r="21" fill="#cfb18c"/><path d="M29 19q-18 1-13 18 7 13 21 4 9-10-2-14-9-4-10 4" stroke="#a2866e" stroke-width="3" fill="none"/><path d="M48 45V21m8 24 4-21" stroke="#afc4a3" stroke-width="5" stroke-linecap="round"/>',
    chameleon:
      '<path d="M24 17q-17 10-13 28 4 18 27 12 18-6 10-19-9-8-15 3-3 10 8 8" fill="none" stroke="#8db596" stroke-width="8" stroke-linecap="round"/><path d="m17 33 10-24 14 12 14 11-12 8-23-1Z" fill="#afd1a0"/><circle cx="36" cy="24" r="8" fill="#d1dfb1"/>',
    crocodile:
      '<path d="m7 28 10-9 9 4 9-10 10 9 13 3-2 25H8Z" fill="#89ab82"/><path d="M8 40h48v10H8" fill="#c4d5a3"/><path d="m13 40 4 7 4-7m12 0 4 7 4-7" fill="#fff8df"/>',
    'tyrannosaurus-rex':
      '<path d="M10 46V23q0-15 19-14 24 0 26 19v17L43 58H21Z" fill="#98b293"/><path d="M15 37h39v12H15Z" fill="#dcdfbb"/><path d="m19 37 4 8 4-8m7 0 4 8 4-8" fill="#fff8e6"/>',
    triceratops:
      '<path d="m32 5 8 5 10-1 4 11 8 9-9 11-1 11-20 9-20-9-1-11-9-11 8-9 4-11 10 1Z" fill="#ab97b3"/><ellipse cx="32" cy="36" rx="20" ry="20" fill="#c4afc9"/><path d="m17 27 1-19 9 20m10 0 9-20 1 19M28 43l4-10 4 10" fill="#f1e8d6"/>',
  };
  return `<circle cx="32" cy="32" r="30" fill="${bg}"/>${shapes[id]}<circle cx="25" cy="28" r="2" fill="#39444d"/><circle cx="39" cy="28" r="2" fill="#39444d"/>`;
}
export const catalogAvatarArtwork = Object.fromEntries(
  avatarCatalog
    .filter((a) => a.id !== 'initials')
    .map((avatar, index) => {
      const bg = palette[index % palette.length],
        id = avatar.id;
      return [
        id,
        birdColors[id]
          ? bird(id, birdColors[id], bg)
          : sea.includes(id)
            ? seaAnimal(id, bg)
            : [
                  'butterfly',
                  'bee',
                  'ladybug',
                  'dragonfly',
                  'snail',
                  'chameleon',
                  'crocodile',
                  'tyrannosaurus-rex',
                  'triceratops',
                ].includes(id)
              ? smallCreature(id, bg)
              : mammal(id, faces[id] ?? {}, bg),
      ];
    }),
) as Record<Exclude<AvatarId, 'initials'>, string>;
