import type { Provider } from './provider.ts';
import { FixtureProvider } from './fixture.ts';
import { AnthropicProvider } from './anthropic.ts';

let cached: Provider | null = null;

/**
 * Fixture by default so the prototype runs on a clean checkout with no keys and
 * never stalls mid-demo. Set LLM_PROVIDER=anthropic with ANTHROPIC_API_KEY to
 * narrate the same payloads with a live model.
 */
export function getProvider(): Provider {
  if (cached) return cached;

  if (process.env.LLM_PROVIDER === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('LLM_PROVIDER=anthropic requires ANTHROPIC_API_KEY to be set.');
    }
    cached = new AnthropicProvider(key);
  } else {
    cached = new FixtureProvider();
  }
  return cached;
}

export * from './provider.ts';
export type { NarrationPayload } from './fixture.ts';
