import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getAtmosphereColor } from './atmosphere.ts';

describe('getAtmosphereColor', () => {
  const testCases = [
    { hour: 0, expected: '#050510' },
    { hour: 3, expected: '#050510' },
    { hour: 4, expected: '#0f0a08' },
    { hour: 6, expected: '#0f0a08' },
    { hour: 7, expected: '#0a0a0c' },
    { hour: 9, expected: '#0a0a0c' },
    { hour: 10, expected: '#0a0a0a' },
    { hour: 15, expected: '#0a0a0a' },
    { hour: 16, expected: '#0f0c08' },
    { hour: 18, expected: '#0f0c08' },
    { hour: 19, expected: '#080810' },
    { hour: 21, expected: '#080810' },
    { hour: 22, expected: '#0a080f' },
    { hour: 23, expected: '#0a080f' },
  ];

  testCases.forEach(({ hour, expected }) => {
    test(`returns ${expected} for hour ${hour}`, () => {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      assert.strictEqual(getAtmosphereColor(date), expected);
    });
  });

  test('uses current time by default', () => {
    const color = getAtmosphereColor();
    assert.match(color, /^#[0-9a-f]{6}$/i);
  });

  test('returns default color for invalid hours (if bypass getHours)', () => {
    // Manually mocking getHours to return an out-of-range value
    const mockDate = {
      getHours: () => 25,
    } as Date;
    assert.strictEqual(getAtmosphereColor(mockDate), '#0a0a0a');
  });
});
