import assert from 'node:assert';
import { test, describe } from 'node:test';
import { analyzeSentiment, getWeightBorderClass, getWeightShadowClass } from './weight.ts';

describe('weight aesthetics', () => {
  describe('analyzeSentiment', () => {
    test('neutral text', () => {
      const result = analyzeSentiment('This is a neutral sentence.');
      assert.strictEqual(result.sentiment, 'neutral');
      assert.strictEqual(result.intensity, 0);
    });

    test('heavy sentiment', () => {
      const result = analyzeSentiment('I feel so much grief and pain');
      assert.strictEqual(result.sentiment, 'heavy');
      assert.ok(result.intensity > 0);
      assert.ok(result.intensity <= 1);
    });

    test('light sentiment', () => {
      const result = analyzeSentiment('I am happy and full of joy');
      assert.strictEqual(result.sentiment, 'light');
      assert.ok(result.intensity > 0);
      assert.ok(result.intensity <= 1);
    });

    test('mixed sentiment - more heavy than light', () => {
      // 2 heavy words (grief, pain), 1 light word (happy)
      const result = analyzeSentiment('grief pain happy');
      assert.strictEqual(result.sentiment, 'heavy');
    });

    test('mixed sentiment - more light than heavy', () => {
      // 1 heavy word (grief), 2 light words (happy, joy)
      const result = analyzeSentiment('grief happy joy');
      assert.strictEqual(result.sentiment, 'light');
    });

    test('mixed sentiment - equal heavy and light', () => {
      // 1 heavy word (grief), 1 light word (happy)
      // The code says: if (heavyCount > 0 && heavyCount >= lightCount) return 'heavy'
      const result = analyzeSentiment('grief happy');
      assert.strictEqual(result.sentiment, 'heavy');
    });

    test('case insensitivity', () => {
      const resultLower = analyzeSentiment('happy');
      const resultUpper = analyzeSentiment('HAPPY');
      assert.strictEqual(resultLower.sentiment, 'light');
      assert.strictEqual(resultUpper.sentiment, 'light');
      assert.strictEqual(resultLower.intensity, resultUpper.intensity);
    });

    test('punctuation handling', () => {
      const result = analyzeSentiment('happy!!!');
      assert.strictEqual(result.sentiment, 'light');
      assert.ok(result.intensity > 0);
    });

    test('empty string or only spaces', () => {
      const resultEmpty = analyzeSentiment('');
      const resultSpaces = analyzeSentiment('   ');
      assert.strictEqual(resultEmpty.sentiment, 'neutral');
      assert.strictEqual(resultSpaces.sentiment, 'neutral');
    });

    test('intensity capping', () => {
      // ratio * 4, capped at 1.
      // If we have 1 word and it's heavy, ratio is 1/1 = 1. intensity = min(1*4, 1) = 1.
      const result = analyzeSentiment('grief');
      assert.strictEqual(result.intensity, 1);
    });
  });

  describe('getWeightBorderClass', () => {
    test('heavy sentiment border classes', () => {
      assert.strictEqual(getWeightBorderClass({ sentiment: 'heavy', intensity: 0.7 }), 'border-white/70');
      assert.strictEqual(getWeightBorderClass({ sentiment: 'heavy', intensity: 0.4 }), 'border-white/50');
      assert.strictEqual(getWeightBorderClass({ sentiment: 'heavy', intensity: 0.2 }), 'border-white/40');
    });

    test('light sentiment border classes', () => {
      assert.strictEqual(getWeightBorderClass({ sentiment: 'light', intensity: 0.7 }), 'border-white/20');
      assert.strictEqual(getWeightBorderClass({ sentiment: 'light', intensity: 0.2 }), 'border-white/10');
    });

    test('neutral sentiment border class', () => {
      assert.strictEqual(getWeightBorderClass({ sentiment: 'neutral', intensity: 0 }), 'border-white/5');
    });
  });

  describe('getWeightShadowClass', () => {
    test('heavy sentiment shadow classes', () => {
      assert.strictEqual(getWeightShadowClass({ sentiment: 'heavy', intensity: 0.7 }), 'shadow-[0_0_12px_rgba(255,255,255,0.15)]');
      assert.strictEqual(getWeightShadowClass({ sentiment: 'heavy', intensity: 0.4 }), 'shadow-[0_0_8px_rgba(255,255,255,0.1)]');
      assert.strictEqual(getWeightShadowClass({ sentiment: 'heavy', intensity: 0.2 }), 'shadow-[0_0_4px_rgba(255,255,255,0.05)]');
    });

    test('light sentiment shadow classes', () => {
      assert.strictEqual(getWeightShadowClass({ sentiment: 'light', intensity: 0.7 }), 'shadow-[0_0_4px_rgba(255,255,255,0.03)]');
    });

    test('neutral sentiment shadow class', () => {
      assert.strictEqual(getWeightShadowClass({ sentiment: 'neutral', intensity: 0 }), '');
    });
  });
});
