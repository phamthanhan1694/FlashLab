import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studyPreferencesSchema, sessionSchema } from '@flashlab/shared';
import {
  durationSeconds,
  formatCountdown,
  studyClock,
} from '../src/features/study/timer';
import { timeLimitMarkup } from '../src/ui/study-time';

test('deadlines count hidden time, stay in warning state throughout the final third and expire at zero', () => {
  const start = 1_000_000;
  assert.equal(studyClock(start, 0, start + 10_000_000).expired, false);
  assert.equal(studyClock(start, 90, start + 59_999).warning, false);
  for (const elapsed of [60_000, 75_000, 89_999]) {
    const clock = studyClock(start, 90, start + elapsed);
    assert.equal(clock.warning, true);
    assert.equal(clock.expired, false);
  }
  assert.equal(studyClock(start, 90, start + 90_000).expired, true);
  assert.equal(studyClock(start, 90, start + 600_000).remainingSeconds, 0);
  assert.equal(formatCountdown(3661), '01:01:01');
  assert.equal(formatCountdown(-1), '00:00:00');
});

test('each mode keeps an independent validated duration and legacy preferences stay unlimited', () => {
  const timeLimits = {
    flashcards: 0,
    learn: 3661,
    write: 65,
    test: 3600,
    match: 90,
    review: 359999,
  };
  assert.deepEqual(
    studyPreferencesSchema.parse({ timeLimits }).timeLimits,
    timeLimits,
  );
  assert.equal(studyPreferencesSchema.parse({}).timeLimits, undefined);
  for (const value of [-1, 360000, 1.5, NaN]) {
    assert.equal(
      studyPreferencesSchema.safeParse({ timeLimits: { test: value } }).success,
      false,
    );
  }
  assert.equal(durationSeconds(1, 1, 1), 3661);
  assert.equal(durationSeconds(99, 59, 59), 359999);
  for (const values of [
    [100, 0, 0],
    [0, 60, 0],
    [0, 0, -1],
    [0.5, 0, 0],
  ]) {
    assert.equal(
      durationSeconds(...(values as [number, number, number])),
      undefined,
    );
  }
  assert.match(timeLimitMarkup(0, true), /id="setup-time-enabled" >/);
  assert.match(timeLimitMarkup(0, true), /class="study-time-fields" hidden/);
  assert.match(
    timeLimitMarkup(3661, false),
    /id="setup-time-hours"[^>]*value="1"/,
  );
  assert.equal(
    sessionSchema.parse({
      id: 'session',
      deckId: 'deck',
      date: 1,
      mode: 'test',
      answers: 3,
      correct: 1,
      timeLimitSeconds: 6,
      timedOut: true,
    }).timedOut,
    true,
  );
});
