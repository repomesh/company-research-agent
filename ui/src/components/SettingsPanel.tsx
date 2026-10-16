import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, KeyRound, Server, X } from 'lucide-react';
import ModelLogo from './ModelLogo';
import ModelSelector from './ModelSelector';
import { fallbackModelName, providerName, providerOf, type ModelInfo } from '../models';
import type { LLMSettings, ServerConfig } from '../settings';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: LLMSettings;
  onChange: (patch: Partial<LLMSettings>) => void;
  serverConfig: ServerConfig | null;
  models: ModelInfo[];
  modelsLoading: boolean;
  modelsError: string | null;
  selectedModel: string;
}

const CLOSE_ANIMATION_MS = 200;

const SettingsPanel = ({
  open,
  onClose,
  settings,
  onChange,
  serverConfig,
  models,
  modelsLoading,
  modelsError,
  selectedModel,
}: SettingsPanelProps) => {
  const [isMounted, setIsMounted] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setIsClosing(false);
      return;
    }
    if (!isMounted) return;
    setIsClosing(true);
    const timer = setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open, isMounted]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => {
      if (!settings.openrouterApiKey && !serverConfig?.openrouter_configured) keyInputRef.current?.focus();
      else panelRef.current?.focus();
    }, 50);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // Only re-run when the panel opens or closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!isMounted) return null;

  const hasBrowserKey = !!settings.openrouterApiKey.trim();
  const usesOpenRouter = hasBrowserKey || !!serverConfig?.openrouter_configured;
  const selected = models.find((model) => model.id === selectedModel);
  const selectedProvider = selected?.provider ?? providerOf(selectedModel);

  return (
    <div className={`settings-root${isClosing ? ' settings-root--closing' : ''}`}>
      <div className="settings-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
      >
        <div className="settings-header">
          <div>
            <h2 id="settings-title">Settings</h2>
            <p>Choose the model that powers your research.</p>
          </div>
          <button type="button" className="settings-close" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          <section className="settings-section">
            <div className="settings-section-heading">
              <label htmlFor="openrouterApiKey">OpenRouter API key</label>
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="settings-link">
                Get a key <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="relative">
              <KeyRound className="settings-input-icon" size={17} strokeWidth={1.5} aria-hidden="true" />
              <input
                ref={keyInputRef}
                id="openrouterApiKey"
                type={isKeyVisible ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                value={settings.openrouterApiKey}
                onChange={(event) => onChange({ openrouterApiKey: event.target.value })}
                className="research-input settings-key-input"
                placeholder={serverConfig?.openrouter_configured ? 'Using key from server .env' : 'sk-or-v1-…'}
              />
              <button
                type="button"
                className="tavily-key-visibility"
                onClick={() => setIsKeyVisible((visible) => !visible)}
                aria-label={isKeyVisible ? 'Hide OpenRouter API key' : 'Show OpenRouter API key'}
              >
                {isKeyVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="settings-key-status">
              {hasBrowserKey ? (
                <span className="status-pill status-pill--ok">Saved in this browser</span>
              ) : serverConfig?.openrouter_configured ? (
                <span className="status-pill status-pill--ok"><Server size={12} /> Using server key</span>
              ) : (
                <span className="status-pill status-pill--warn">Not set</span>
              )}
              {hasBrowserKey && (
                <button type="button" className="settings-text-button" onClick={() => onChange({ openrouterApiKey: '' })}>
                  Remove
                </button>
              )}
            </div>
            {!hasBrowserKey && (
              <p className="settings-help">
                One OpenRouter key gives access to hundreds of models — no separate OpenAI or Gemini keys needed.
                {' '}A key pasted here is stored only in this browser and sent with your research requests.
              </p>
            )}
          </section>

          <section className="settings-section settings-section--grow">
            <div className="settings-section-heading">
              <span>Model</span>
            </div>
            <div className="selected-model-card">
              <ModelLogo provider={selectedProvider} size={42} />
              <div>
                <p className="selected-model-name">{selected?.name ?? fallbackModelName(selectedModel)}</p>
                <p className="selected-model-meta">{providerName(selectedProvider)} · {selectedModel}</p>
              </div>
            </div>
            {!usesOpenRouter && serverConfig?.openai_configured && (
              <p className="settings-notice">
                No OpenRouter key yet, so research uses the server's OpenAI/Gemini keys. Add a key to use the model you pick.
              </p>
            )}
            <ModelSelector
              models={models}
              isLoading={modelsLoading}
              loadError={modelsError}
              value={selectedModel}
              onChange={(model) => onChange({ model })}
            />
          </section>
        </div>

        <div className="settings-footer">
          <button type="button" className="research-submit settings-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
