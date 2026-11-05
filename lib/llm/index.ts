import type { Provider } from './provider.ts';
import { FixtureProvider } from './fixture.ts';
import { ReplitProvider } from './replit.ts';

let cached: Provider | null = null;

/**
 * Fixture by default so the prototype runs on a clean checkout with no keys and
 * never stalls mid-demo. Set LLM_PROVIDER=replit with the managed endpoint
 * configuration to narrate the same payloads with Replit AI.
 */
export function getProvider(): Provider {
  if (cached) return cached;

  if (process.env.LLM_PROVIDER === 'replit') {
    const key = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    if (!key || !baseURL) {
      throw new Error('Replit AI requires its managed API key and base URL configuration.');
    }
    cached = new ReplitProvider(baseURL, key, process.env.REPLIT_AI_MODEL);
  } else {
    cached = new FixtureProvider();
  }
  return cached;
}

export * from './provider.ts';
export type { NarrationPayload } from './fixture.ts';
