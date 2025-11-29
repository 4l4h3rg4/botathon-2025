from pydantic import BaseModel, ConfigDict
from typing import Dict, Any
from datetime import datetime

class SegmentCreate(BaseModel):
    filters: Dict[str, Any]

class SegmentResponse(SegmentCreate):
    id: str
    count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
