export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  context_length: number | null;
  prompt_price: number | null;
  completion_price: number | null;
  created: number;
}

// Curated picks shown first in the selector (only those OpenRouter currently lists are shown)
export const FEATURED_MODEL_IDS = [
  'google/gemini-3.8-flash',
  'anthropic/claude-sonnet-5.5',
  'openai/gpt-6.1-sol',
  'anthropic/claude-opus-5.5',
  'google/gemini-4-argon',
  'x-ai/grok-4.7',
  'deepseek/deepseek-v4.1-flash',
  'moonshotai/kimi-k3',
  'qwen/qwen3.8-max-0902',
  'anthropic/claude-haiku-5.5',
  'openai/gpt-6-luna',
  'mistralai/mistral-large-4-0',
];

const LOGO_PROVIDERS = new Set([
  'ai21', 'amazon', 'anthropic', 'bytedance', 'cohere', 'deepseek', 'google', 'ibm', 'liquid',
  'meta', 'microsoft', 'minimax', 'mistralai', 'moonshotai', 'nousresearch', 'nvidia', 'openai',
  'openrouter', 'perplexity', 'qwen', 'stepfun', 'tencent', 'upstage', 'x-ai', 'z-ai',
]);

const LOGO_ALIASES: Record<string, string> = {
  'meta-llama': 'meta',
  'bytedance-seed': 'bytedance',
  'ibm-granite': 'ibm',
};

const PROVIDER_NAMES: Record<string, string> = {
  'ai21': 'AI21',
  'amazon': 'Amazon',
  'anthropic': 'Anthropic',
  'bytedance': 'ByteDance',
  'bytedance-seed': 'ByteDance',
  'cohere': 'Cohere',
  'deepseek': 'DeepSeek',
  'google': 'Google',
  'ibm-granite': 'IBM',
  'meta': 'Meta',
  'meta-llama': 'Meta',
  'microsoft': 'Microsoft',
  'minimax': 'MiniMax',
  'mistralai': 'Mistral',
  'moonshotai': 'Moonshot AI',
  'nousresearch': 'Nous Research',
  'nvidia': 'NVIDIA',
  'openai': 'OpenAI',
  'openrouter': 'OpenRouter',
  'perplexity': 'Perplexity',
  'qwen': 'Qwen',
  'stepfun': 'StepFun',
  'tencent': 'Tencent',
  'x-ai': 'xAI',
  'xiaomi': 'Xiaomi',
  'z-ai': 'Z.ai',
};

export const providerOf = (modelId: string) => modelId.replace(/^~/, '').split('/')[0];

export const providerName = (provider: string) =>
  PROVIDER_NAMES[provider] ?? provider.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const providerLogo = (provider: string): string | null => {
  const key = LOGO_ALIASES[provider] ?? provider;
  return LOGO_PROVIDERS.has(key) ? `/model-logos/${key}.svg` : null;
};

// Readable name for a model id that isn't in the fetched list
export const fallbackModelName = (modelId: string) =>
  (modelId.split('/')[1] ?? modelId)
    .split(/[-_]/)
    .map((part) => (/^\d/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');

export const formatContext = (tokens: number | null) => {
  if (!tokens) return null;
  if (tokens >= 1_000_000) return `${+(tokens / 1_000_000).toFixed(1)}M`;
  return `${Math.round(tokens / 1000)}K`;
};

export const formatPrice = (price: number | null) => {
  if (price === null) return '—';
  if (price === 0) return 'Free';
  return `$${price < 1 ? +price.toFixed(3) : +price.toFixed(2)}`;
};
