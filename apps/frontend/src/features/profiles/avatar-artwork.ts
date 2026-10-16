// Small, editable vector portraits with the same palette and geometry as the original presets.
const eyes =
  '<circle cx="23" cy="31" r="2.3" fill="#293344"/><circle cx="41" cy="31" r="2.3" fill="#293344"/>';
const mouth =
  '<path d="M28 45q4 4 8 0" stroke="#66514a" stroke-width="2" fill="none" stroke-linecap="round"/>';
const nose = '<path d="m28 38 4 4 4-4Z" fill="#5c4740"/>';
const roundEars = (fill: string) =>
  `<circle cx="15" cy="17" r="9" fill="${fill}"/><circle cx="49" cy="17" r="9" fill="${fill}"/>`;
const pointedEars = (fill: string) =>
  `<path d="m12 29 1-22 18 14m2 0L51 7l1 22" fill="${fill}"/>`;
const portrait = (
  bg: string,
  face: string,
  ears = '',
  muzzle = '',
  extra = '',
) =>
  `<circle cx="32" cy="32" r="30" fill="${bg}"/>${ears}<rect x="12" y="16" width="40" height="39" rx="18" fill="${face}"/>${muzzle}${eyes}${nose}${mouth}${extra}`;
const paleMuzzle = '<ellipse cx="32" cy="42" rx="13" ry="10" fill="#fff3dd"/>';
export const additionalAvatarArtwork = {
  fox: portrait(
    '#f9e5d8',
    '#e89850',
    pointedEars('#d97c3d'),
    '<path d="M13 32q13 0 19 12 6-12 19-12-1 22-19 22T13 32" fill="#fff3dd"/>',
  ),
  rabbit: portrait(
    '#f5e4ef',
    '#e6d5c4',
    '<rect x="16" y="3" width="12" height="28" rx="6" fill="#e6d5c4"/><rect x="36" y="3" width="12" height="28" rx="6" fill="#e6d5c4"/><path d="M22 9v12m20-12v12" stroke="#e5a6b8" stroke-width="5" stroke-linecap="round"/>',
    paleMuzzle,
    '<path d="M30 44v6h4v-6" fill="#fff"/>',
  ),
  panda: portrait(
    '#e4efdf',
    '#fffdf5',
    roundEars('#354052'),
    '<ellipse cx="23" cy="31" rx="8" ry="10" fill="#354052"/><ellipse cx="41" cy="31" rx="8" ry="10" fill="#354052"/>',
    '<circle cx="24" cy="29" r="2" fill="white"/><circle cx="42" cy="29" r="2" fill="white"/>',
  ),
  bear: portrait('#f3e5cf', '#a87d59', roundEars('#976a48'), paleMuzzle),
  koala: portrait(
    '#e2edf2',
    '#a8b6c1',
    '<circle cx="13" cy="22" r="12" fill="#92a5b6"/><circle cx="51" cy="22" r="12" fill="#92a5b6"/><circle cx="13" cy="22" r="7" fill="#dce2e6"/><circle cx="51" cy="22" r="7" fill="#dce2e6"/>',
    '',
    '<ellipse cx="32" cy="37" rx="6" ry="8" fill="#425364"/>',
  ),
  penguin:
    '<circle cx="32" cy="32" r="30" fill="#e0eff8"/><ellipse cx="32" cy="34" rx="22" ry="26" fill="#364758"/><path d="M15 33q0-20 17-10 17-10 17 10v10q-1 13-17 13T15 43" fill="#fffdf4"/>' +
    eyes +
    '<path d="m26 38 6-4 6 4-6 6Z" fill="#efb14e"/><path d="M22 55h8m4 0h8" stroke="#e5a148" stroke-width="4" stroke-linecap="round"/>',
  lion:
    '<circle cx="32" cy="32" r="30" fill="#f8edd5"/><path d="m32 3 7 6 10-1 3 10 8 6-4 10 2 10-10 4-6 10-10-3-10 3-6-10-10-4 2-10-4-10 8-6 3-10 10 1Z" fill="#bd7949"/><circle cx="32" cy="33" r="20" fill="#edbf6c"/>' +
    paleMuzzle +
    eyes +
    nose +
    mouth,
  tiger: portrait(
    '#f7e8d4',
    '#eaaa54',
    roundEars('#bd793d'),
    paleMuzzle,
    '<path d="m26 17 6 10 6-10m-24 9 9 4-10 3m38-7-9 4 10 3m-36 8 8 2m24-2-8 2" stroke="#674b36" stroke-width="3" fill="none" stroke-linecap="round"/>',
  ),
  wolf: portrait(
    '#e4eaf4',
    '#94a4ba',
    pointedEars('#7f8fa4'),
    '<path d="M13 35q10 0 19 9 9-9 19-9-2 19-19 19T13 35" fill="#e4ebef"/>',
  ),
  raccoon: portrait(
    '#e9e4f3',
    '#a8a8b6',
    pointedEars('#818493'),
    '<path d="M13 26q19-9 38 0v12q-10 3-19-3-9 6-19 3Z" fill="#4b4c60"/><ellipse cx="32" cy="44" rx="10" ry="8" fill="#eee8dd"/>',
    '<circle cx="23" cy="31" r="1.5" fill="#fff"/><circle cx="41" cy="31" r="1.5" fill="#fff"/>',
  ),
  squirrel: portrait(
    '#eee7db',
    '#b68962',
    '<path d="M12 27Q3 9 14 7l10 16m16 0L50 7q11 2 2 20" fill="#966d4d"/>',
    paleMuzzle,
    '<path d="M30 45v6h4v-6" fill="#fff"/><path d="M14 43q-9-3-7-13" stroke="#d6b18b" stroke-width="5" fill="none" stroke-linecap="round"/>',
  ),
  hamster: portrait(
    '#f9e9db',
    '#dcb58b',
    roundEars('#c49370'),
    '<ellipse cx="18" cy="42" rx="10" ry="10" fill="#fff3df"/><ellipse cx="46" cy="42" rx="10" ry="10" fill="#fff3df"/>',
    '<path d="M30 44v6h4v-6" fill="#fff"/>',
  ),
  hedgehog:
    '<circle cx="32" cy="32" r="30" fill="#eaeada"/><path d="m32 5 5 7 8-4 1 9 9-1-3 9 8 4-6 7 5 8-10 2-3 10-14-3-14 3-3-10-10-2 5-8-6-7 8-4-3-9 9 1 1-9 8 4Z" fill="#9a795f"/><ellipse cx="32" cy="36" rx="19" ry="19" fill="#e8c7a5"/>' +
    eyes +
    nose +
    mouth,
  deer: portrait(
    '#e8eddf',
    '#c7a17b',
    '<path d="M19 21 14 6m2 8L7 10m38 11 5-15m-2 8 9-4" stroke="#977759" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="12" cy="24" rx="9" ry="5" fill="#b9916c"/><ellipse cx="52" cy="24" rx="9" ry="5" fill="#b9916c"/>',
    paleMuzzle,
    '<circle cx="18" cy="37" r="2" fill="#fff4df"/><circle cx="46" cy="37" r="2" fill="#fff4df"/>',
  ),
  elephant:
    '<circle cx="32" cy="32" r="30" fill="#e4eaf8"/><ellipse cx="13" cy="32" rx="12" ry="19" fill="#9caec7"/><ellipse cx="51" cy="32" rx="12" ry="19" fill="#9caec7"/><rect x="15" y="13" width="34" height="38" rx="16" fill="#b8c6db"/>' +
    eyes +
    '<path d="M32 35v15q0 12 12 5" stroke="#9caec7" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M22 41v7m20-7v7" stroke="#fff7e8" stroke-width="4" stroke-linecap="round"/>',
  giraffe: portrait(
    '#f8edcf',
    '#e9c879',
    '<path d="M23 20V8m18 12V8" stroke="#ad8056" stroke-width="5" stroke-linecap="round"/><ellipse cx="12" cy="23" rx="9" ry="5" fill="#d1a369"/><ellipse cx="52" cy="23" rx="9" ry="5" fill="#d1a369"/>',
    '<ellipse cx="32" cy="44" rx="14" ry="10" fill="#f4dfaa"/>',
    '<path d="M30 18h6v7h-6m-16 9 6 1v7h-5m30-8 6 1v7h-5" fill="#b38354"/>',
  ),
  monkey: portrait(
    '#f2e6dc',
    '#a67b58',
    '<circle cx="11" cy="32" r="10" fill="#a67b58"/><circle cx="53" cy="32" r="10" fill="#a67b58"/><circle cx="11" cy="32" r="5" fill="#e6bb94"/><circle cx="53" cy="32" r="5" fill="#e6bb94"/>',
    '<path d="M15 31q0-15 17-7 17-8 17 7v11q-1 12-17 12T15 42Z" fill="#edc7a2"/>',
  ),
  frog: '<circle cx="32" cy="32" r="30" fill="#e4f1dd"/><circle cx="19" cy="20" r="12" fill="#87b66e"/><circle cx="45" cy="20" r="12" fill="#87b66e"/><ellipse cx="32" cy="38" rx="25" ry="19" fill="#9cc981"/><circle cx="19" cy="20" r="7" fill="#fff7df"/><circle cx="45" cy="20" r="7" fill="#fff7df"/><circle cx="19" cy="20" r="3" fill="#354c39"/><circle cx="45" cy="20" r="3" fill="#354c39"/><path d="M18 40q14 15 28 0" stroke="#587b47" stroke-width="3" fill="none" stroke-linecap="round"/>',
  turtle:
    '<circle cx="32" cy="32" r="30" fill="#e0efe3"/><ellipse cx="32" cy="40" rx="23" ry="18" fill="#789561"/><path d="m32 25 9 6v12l-9 7-9-7V31Zm-22 14 13-8m18 0 13 8m-31 4-7 10m25-10 7 10" stroke="#526f45" stroke-width="2" fill="none"/><ellipse cx="32" cy="22" rx="14" ry="16" fill="#b2cf8a"/><circle cx="26" cy="19" r="2" fill="#344d36"/><circle cx="38" cy="19" r="2" fill="#344d36"/><path d="M27 28q5 4 10 0" stroke="#628149" stroke-width="2" fill="none"/>',
  dolphin:
    '<circle cx="32" cy="32" r="30" fill="#e0eff7"/><path d="M8 38q6-19 23-17l5-13 7 15q9 4 11 13l7 3-11 5q-12 10-26 4l-9 8 1-14Z" fill="#7aadc6"/><path d="M16 41q15 9 32 0-7 12-22 7Z" fill="#d9eaf0"/><circle cx="45" cy="32" r="2.3" fill="#2e4b5f"/><path d="m30 35 8 8-11-2" fill="#568ba6"/>',
  octopus:
    '<circle cx="32" cy="32" r="30" fill="#f0e3f3"/><path d="M12 38q-8 17 2 17 7 0 8-11m0 0q-2 18 6 14l4-13m0 0q2 17 9 12l2-13m0 0q8 17 14 8l-5-13" stroke="#b58bc2" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="12" y="9" width="40" height="38" rx="19" fill="#cba4d4"/>' +
    eyes +
    '<path d="M28 37q4 5 8 0" stroke="#80568e" stroke-width="2" fill="none"/><circle cx="16" cy="35" r="3" fill="#e9b6cf"/><circle cx="48" cy="35" r="3" fill="#e9b6cf"/>',
  duck:
    '<circle cx="32" cy="32" r="30" fill="#e2f1e2"/><ellipse cx="32" cy="44" rx="22" ry="14" fill="#e6dcb1"/><circle cx="32" cy="26" r="19" fill="#7fa47a"/>' +
    eyes +
    '<ellipse cx="32" cy="39" rx="13" ry="6" fill="#e5af51"/><path d="M16 45q15 10 32 0" stroke="#c1b88c" stroke-width="3" fill="none"/>',
  chick:
    '<circle cx="32" cy="32" r="30" fill="#fcf0d5"/><path d="M27 15q-3-13 6-9l3 9" fill="#efc366"/><ellipse cx="32" cy="35" rx="23" ry="22" fill="#f3d67d"/>' +
    eyes +
    '<path d="m27 39 5-4 5 4-5 6Z" fill="#dc9444"/><path d="M9 36q-6 8 5 12m41-12q6 8-5 12" fill="#e7bd60"/>',
  pig: portrait(
    '#f8e4e8',
    '#e8adb3',
    pointedEars('#d6909c'),
    '<ellipse cx="32" cy="41" rx="13" ry="9" fill="#d98b9c"/>',
    '<circle cx="27" cy="41" r="2" fill="#9c5e74"/><circle cx="37" cy="41" r="2" fill="#9c5e74"/>',
  ),
  cow: portrait(
    '#e5efea',
    '#fff8eb',
    '<path d="M21 21 15 7l-4 11m32 3 6-14 4 11" fill="#d3b88c"/><ellipse cx="10" cy="26" rx="8" ry="5" fill="#7b7f84"/><ellipse cx="54" cy="26" rx="8" ry="5" fill="#7b7f84"/>',
    '<path d="M15 21q15-9 13 9l-5 7-10-4Z" fill="#70767e"/><ellipse cx="32" cy="45" rx="16" ry="10" fill="#e7b2b3"/>',
    '<circle cx="26" cy="44" r="2" fill="#9d7477"/><circle cx="38" cy="44" r="2" fill="#9d7477"/>',
  ),
  sheep:
    '<circle cx="32" cy="32" r="30" fill="#e9eaf2"/><path d="M13 27Q1 19 10 13q1-10 12-7 10-9 19-1 11-3 13 8 10 8-2 16l-5 17H18Z" fill="#fff9ed"/><ellipse cx="32" cy="38" rx="17" ry="18" fill="#b7aa9e"/><path d="m16 30-9 6m41-6 9 6" stroke="#b7aa9e" stroke-width="7" stroke-linecap="round"/>' +
    eyes +
    nose +
    mouth,
};
