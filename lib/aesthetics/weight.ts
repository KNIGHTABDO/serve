/**
 * The Weight — sentiment-based input border glow.
 * Client-side dictionary analysis. Ambient, lightweight.
 */

const HEAVY_WORDS = new Set([
  'grief', 'grieving', 'mourn', 'mourning', 'alone', 'lonely', 'loneliness',
  'afraid', 'fear', 'fearful', 'scared', 'terror', 'lost', 'adrift',
  'heavy', 'weight', 'burden', 'burdened', 'broken', 'shattered',
  'guilt', 'guilty', 'shame', 'ashamed', 'despair', 'desperate',
  'hopeless', 'sorrow', 'sad', 'sadness', 'pain', 'painful', 'hurt',
  'hurting', 'wounded', 'empty', 'numb', 'drowning', 'suffocating',
  'darkness', 'dark', 'void', 'abyss', 'anguish', 'agony', 'bleak',
  'weep', 'weeping', 'cry', 'crying', 'tears', 'regret', 'remorse',
  'abandon', 'abandoned', 'betrayed', 'betrayal', ' rejected',
  'failure', 'fail', 'failed', 'worthless', 'invisible', 'forgotten',
  'death', 'dying', 'die', 'dead', 'end', 'ending', 'over',
]);

const LIGHT_WORDS = new Set([
  'happy', 'happiness', 'joy', 'joyful', 'bliss', 'delight',
  'excited', 'excitement', 'thrilled', 'eager', 'enthusiasm',
  'good', 'great', 'wonderful', 'amazing', 'fantastic', 'excellent',
  'love', 'loving', 'loved', 'cherish', 'adore', 'beloved',
  'light', 'bright', 'radiant', 'glow', 'glowing', 'shine', 'shining',
  'easy', 'ease', 'peace', 'peaceful', 'calm', 'calming', 'serene',
  'grateful', 'gratitude', 'thankful', 'blessed', 'lucky', 'fortunate',
  'hope', 'hopeful', 'optimistic', 'renewed', 'rebirth', 'alive',
  'free', 'freedom', 'release', 'relief', 'relieved', 'healed',
  'whole', 'complete', 'enough', 'worthy', 'beautiful', 'wonder',
]);

export type Sentiment = 'heavy' | 'light' | 'neutral';

export interface WeightResult {
  sentiment: Sentiment;
  intensity: number; // 0-1
}

/**
 * Analyze text sentiment using simple dictionary matching.
 * Returns sentiment label and intensity (0-1).
 */
export function analyzeSentiment(text: string): WeightResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+|[.,!?;:'"\-]+/);

  let heavyCount = 0;
  let lightCount = 0;

  for (const word of words) {
    if (HEAVY_WORDS.has(word)) heavyCount++;
    if (LIGHT_WORDS.has(word)) lightCount++;
  }

  const total = words.length || 1;
  const heavyRatio = heavyCount / total;
  const lightRatio = lightCount / total;

  if (heavyCount > 0 && heavyCount >= lightCount) {
    return { sentiment: 'heavy', intensity: Math.min(heavyRatio * 4, 1) };
  }
  if (lightCount > 0 && lightCount > heavyCount) {
    return { sentiment: 'light', intensity: Math.min(lightRatio * 4, 1) };
  }
  return { sentiment: 'neutral', intensity: 0 };
}

/**
 * Get CSS border color classes based on sentiment.
 */
export function getWeightBorderClass(result: WeightResult): string {
  if (result.sentiment === 'heavy') {
    if (result.intensity > 0.6) return 'border-white/70';
    if (result.intensity > 0.3) return 'border-white/50';
    return 'border-white/40';
  }
  if (result.sentiment === 'light') {
    if (result.intensity > 0.6) return 'border-white/20';
    return 'border-white/10';
  }
  return 'border-white/5';
}

/**
 * Get CSS shadow classes for the glow effect.
 */
export function getWeightShadowClass(result: WeightResult): string {
  if (result.sentiment === 'heavy') {
    if (result.intensity > 0.6) return 'shadow-[0_0_12px_rgba(255,255,255,0.15)]';
    if (result.intensity > 0.3) return 'shadow-[0_0_8px_rgba(255,255,255,0.1)]';
    return 'shadow-[0_0_4px_rgba(255,255,255,0.05)]';
  }
  if (result.sentiment === 'light') {
    return 'shadow-[0_0_4px_rgba(255,255,255,0.03)]';
  }
  return '';
}
