import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avatarCatalog, preferencesSchema } from '@flashlab/shared';
import { catalogAvatarArtwork } from '../src/features/profiles/catalog-artwork';

test('catalogue deduplicates repeated breeds and every animal has a valid editable portrait', () => {
  assert.equal(avatarCatalog.length, 149);
  assert.equal(new Set(avatarCatalog.map((avatar) => avatar.id)).size, 149);
  for (const avatar of avatarCatalog) {
    assert.equal(
      preferencesSchema.safeParse({ avatar: avatar.id }).success,
      true,
    );
    if (avatar.id !== 'initials') {
      assert.ok(catalogAvatarArtwork[avatar.id].length > 100);
      assert.equal(
        catalogAvatarArtwork[avatar.id].includes('undefined'),
        false,
      );
    }
  }
  assert.equal(
    avatarCatalog.filter((avatar) => avatar.english === 'Welsh Corgi').length,
    1,
  );
});
