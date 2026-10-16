import { Settings2 } from 'lucide-react';
import ModelLogo from './ModelLogo';

interface HeaderProps {
  modelName: string;
  modelProvider: string;
  needsSetup: boolean;
  onOpenSettings: () => void;
}

const Header = ({ modelName, modelProvider, needsSetup, onOpenSettings }: HeaderProps) => (
  <header>
    <nav className="site-nav" aria-label="Main navigation">
      <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="brand-link" aria-label="Tavily website">
        <img src="/tavily-by-nebius.svg" alt="Tavily by Nebius" className="brand-logo" width="362" height="109" />
      </a>
      <div className="nav-actions">
        <button
          type="button"
          className={`model-pill${needsSetup ? ' model-pill--attention' : ''}`}
          onClick={onOpenSettings}
          aria-label={`Settings — current model: ${modelName}`}
        >
          {needsSetup ? (
            <span className="model-pill-label">Add OpenRouter key</span>
          ) : (
            <>
              <ModelLogo provider={modelProvider} size={24} />
              <span className="model-pill-label">{modelName}</span>
            </>
          )}
          <Settings2 size={16} className="model-pill-icon" aria-hidden="true" />
          {needsSetup && <span className="model-pill-dot" aria-hidden="true" />}
        </button>
        <a href="https://github.com/guy-hartstein/company-research-agent" target="_blank" rel="noopener noreferrer" className="nav-link" aria-label="View on GitHub" title="View on GitHub">
          <img src="/github-icon.png" alt="" className="github-logo" width="28" height="28" />
        </a>
      </div>
    </nav>
    <div className="hero">
      <h1>Company Intelligence &amp; Research</h1>
      <p className="hero-description">Research a company's business, industry, financial context, and recent news, then explore a detailed briefing with linked sources and PDF export.</p>
    </div>
  </header>
);

export default Header;
