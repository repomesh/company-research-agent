import asyncio
from typing import TypedDict, NotRequired, Required, Dict, List, Any
from collections import defaultdict
from datetime import datetime

#Define the input state
class InputState(TypedDict, total=False):
    company: Required[str]
    company_url: NotRequired[str]
    hq_location: NotRequired[str]
    industry: NotRequired[str]
    job_id: NotRequired[str]

class ResearchState(InputState):
    site_scrape: Dict[str, Any]
    messages: List[Any]
    financial_data: Dict[str, Any]
    news_data: Dict[str, Any]
    industry_data: Dict[str, Any]
    company_data: Dict[str, Any]
    curated_financial_data: Dict[str, Any]
    curated_news_data: Dict[str, Any]
    curated_industry_data: Dict[str, Any]
    curated_company_data: Dict[str, Any]
    financial_briefing: str
    news_briefing: str
    industry_briefing: str
    company_briefing: str
    references: List[str]
    briefings: Dict[str, Any]
    report: str

class EventQueue(list):
    """Event list that wakes SSE listeners as soon as a node appends an event."""

    def __init__(self, *args):
        super().__init__(*args)
        self._signal = asyncio.Event()

    def append(self, item):
        super().append(item)
        self._signal.set()

    async def wait(self, timeout: float) -> None:
        """Wait until a new event is appended or the timeout passes."""
        try:
            await asyncio.wait_for(self._signal.wait(), timeout)
        except asyncio.TimeoutError:
            pass
        self._signal.clear()

# Global job status tracker - shared across application.py and backend nodes
job_status = defaultdict[Any, dict[str, str | list[Any] | None]](lambda: {
    "status": "pending",
    "result": None,
    "error": None,
    "debug_info": [],
    "company": None,
    "report": None,
    "last_update": datetime.now().isoformat(),
    "events": EventQueue()  # Queue for events from parallel nodes
})