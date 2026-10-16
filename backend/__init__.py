"""Backend package for tavily-company-research."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

from .graph import Graph

# Set up logging
logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / '.env'
if env_path.exists():
    logger.info(f"Loading environment variables from {env_path}")
    load_dotenv(dotenv_path=env_path, override=True)
else:
    logger.warning(f".env file not found at {env_path}. Using system environment variables.")

# Check for critical environment variables
if not os.getenv("TAVILY_API_KEY"):
    logger.warning("TAVILY_API_KEY environment variable is not set.")

if not (os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")):
    logger.warning(
        "Neither OPENROUTER_API_KEY nor OPENAI_API_KEY is set. "
        "Research will require an OpenRouter key supplied from the UI settings."
    )

__all__ = ["Graph"]
