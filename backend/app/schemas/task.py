from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.task import TaskStatus

class TaskBase(BaseModel):
    payload: Dict[str, Any]

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    bot_id: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    status: TaskStatus
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    bot_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
