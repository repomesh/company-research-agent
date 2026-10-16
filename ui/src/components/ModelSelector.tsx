import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import ModelLogo from './ModelLogo';
import {
  FEATURED_MODEL_IDS,
  formatContext,
  formatPrice,
  providerName,
  type ModelInfo,
} from '../models';

interface ModelSelectorProps {
  models: ModelInfo[];
  isLoading: boolean;
  loadError: string | null;
  value: string;
  onChange: (modelId: string) => void;
}

const MAX_PROVIDER_CHIPS = 10;

const ModelSelector = ({ models, isLoading, loadError, value, onChange }: ModelSelectorProps) => {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Providers ordered by how many models they offer
  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    models.forEach((model) => counts.set(model.provider, (counts.get(model.provider) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_PROVIDER_CHIPS).map(([id]) => id);
  }, [models]);

  const featured = useMemo(() => {
    const byId = new Map(models.map((model) => [model.id, model]));
    return FEATURED_MODEL_IDS.map((id) => byId.get(id)).filter((model): model is ModelInfo => !!model);
  }, [models]);

  const isBrowsing = !query.trim() && !provider;

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return models.filter((model) => {
      if (provider && model.provider !== provider) return false;
      const haystack = `${model.name} ${model.id} ${providerName(model.provider)}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [models, query, provider]);

  const sections = isBrowsing
    ? [
        { title: 'Featured', items: featured },
        { title: 'All models', items: models.filter((model) => !FEATURED_MODEL_IDS.includes(model.id)) },
      ]
    : [{ title: `${filtered.length} ${filtered.length === 1 ? 'model' : 'models'}`, items: filtered }];
  const flatItems = sections.flatMap((section) => section.items);

  useEffect(() => setActiveIndex(0), [query, provider]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, flatItems.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && flatItems[activeIndex]) {
      event.preventDefault();
      onChange(flatItems[activeIndex].id);
    }
  };

  let itemIndex = -1;

  return (
    <div className="model-selector">
      <div className="model-search">
        <Search size={16} aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="model-listbox"
          aria-activedescendant={flatItems[activeIndex] ? `model-option-${activeIndex}` : undefined}
          placeholder="Search models, e.g. claude, gpt, gemini…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" className="model-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {providers.length > 0 && (
        <div className="provider-chips" role="group" aria-label="Filter by provider">
          <button
            type="button"
            className={`provider-chip${provider === null ? ' provider-chip--active' : ''}`}
            onClick={() => setProvider(null)}
          >
            All
          </button>
          {providers.map((id) => (
            <button
              type="button"
              key={id}
              className={`provider-chip${provider === id ? ' provider-chip--active' : ''}`}
              onClick={() => setProvider(provider === id ? null : id)}
              aria-pressed={provider === id}
            >
              <ModelLogo provider={id} size={18} />
              {providerName(id)}
            </button>
          ))}
        </div>
      )}

      <div className="model-list" id="model-listbox" role="listbox" aria-label="Models" ref={listRef}>
        {isLoading && (
          <div className="model-list-state">
            <Loader2 size={18} className="animate-spin" /> Loading models from OpenRouter…
          </div>
        )}
        {!isLoading && loadError && <div className="model-list-state">{loadError}</div>}
        {!isLoading && !loadError && flatItems.length === 0 && (
          <div className="model-list-state">No models match “{query}”.</div>
        )}
        {!isLoading &&
          sections.map((section) =>
            section.items.length === 0 ? null : (
              <div key={section.title} role="group" aria-label={section.title}>
                <p className="model-section-title">{section.title}</p>
                {section.items.map((model) => {
                  itemIndex += 1;
                  const index = itemIndex;
                  const isSelected = model.id === value;
                  const context = formatContext(model.context_length);
                  return (
                    <div
                      key={`${section.title}-${model.id}`}
                      id={`model-option-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      className={`model-option${isSelected ? ' model-option--selected' : ''}${index === activeIndex ? ' model-option--active' : ''}`}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => onChange(model.id)}
                    >
                      <ModelLogo provider={model.provider} size={34} />
                      <div className="model-option-body">
                        <div className="model-option-name">
                          {model.name}
                          {context && <span className="model-badge">{context}</span>}
                        </div>
                        <div className="model-option-meta">
                          <span className="model-option-id">{model.id}</span>
                          <span className="model-option-price">
                            {formatPrice(model.prompt_price)} in · {formatPrice(model.completion_price)} out
                          </span>
                        </div>
                      </div>
                      <span className="model-option-check" aria-hidden="true">
                        {isSelected && <Check size={16} strokeWidth={2.5} />}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}
      </div>
      <p className="model-list-footnote">Prices are per 1M tokens, as listed by OpenRouter.</p>
    </div>
  );
};

export default ModelSelector;
