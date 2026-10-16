"""LLM provider selection.

When an OpenRouter key is available (per request or via OPENROUTER_API_KEY), every
node uses the selected OpenRouter model. Otherwise the original direct providers are
used: OpenAI for queries and editing, Gemini for briefings (falling back to OpenAI
when GEMINI_API_KEY is not set).
"""

import os
from dataclasses import dataclass
from typing import Literal

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_openai import ChatOpenAI

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_OPENROUTER_MODEL = "google/gemini-3.8-flash"

Role = Literal["research", "briefing", "editor"]

# Direct-provider models used when OpenRouter is not configured
_OPENAI_MODELS: dict[Role, str] = {
    "research": "gpt-5.1",
    "briefing": "gpt-5.1",
    "editor": "gpt-4o",
}
_GEMINI_BRIEFING_MODEL = "gemini-2.5-flash"


@dataclass(frozen=True)
class LLMConfig:
    openrouter_api_key: str | None = None
    model: str | None = None

    @classmethod
    def resolve(cls, openrouter_api_key: str | None = None, model: str | None = None) -> "LLMConfig":
        """Merge request-supplied settings with environment fallbacks."""
        key = (openrouter_api_key or "").strip() or os.getenv("OPENROUTER_API_KEY")
        model = (model or "").strip() or os.getenv("OPENROUTER_MODEL") or DEFAULT_OPENROUTER_MODEL
        return cls(openrouter_api_key=key or None, model=model)

    @property
    def uses_openrouter(self) -> bool:
        return bool(self.openrouter_api_key)


def create_llm(role: Role, config: LLMConfig | None = None, *, streaming: bool = False) -> BaseChatModel:
    config = config or LLMConfig.resolve()

    if config.uses_openrouter:
        return ChatOpenAI(
            model=config.model or DEFAULT_OPENROUTER_MODEL,
            temperature=0,
            streaming=streaming,
            api_key=config.openrouter_api_key,
            base_url=OPENROUTER_BASE_URL,
            default_headers={
                "HTTP-Referer": "https://github.com/guy-hartstein/company-research-agent",
                "X-Title": "Company Research Agent",
            },
        )

    gemini_key = os.getenv("GEMINI_API_KEY")
    if role == "briefing" and gemini_key:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=_GEMINI_BRIEFING_MODEL,
            temperature=0,
            google_api_key=gemini_key,
            max_retries=0,
        )

    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise ValueError(
            "No LLM provider configured. Add an OpenRouter API key in Settings, "
            "or set OPENROUTER_API_KEY (or OPENAI_API_KEY) in the backend .env file."
        )
    return ChatOpenAI(
        model=_OPENAI_MODELS[role],
        temperature=0,
        streaming=streaming,
        api_key=openai_key,
    )
