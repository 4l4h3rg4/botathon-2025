from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.log import LogSource, LogLevel

class LogCreate(BaseModel):
    source: LogSource
    level: LogLevel
    message: str
    details: Optional[Dict[str, Any]] = None

class LogResponse(LogCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
