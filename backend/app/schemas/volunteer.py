from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

class SkillBase(BaseModel):
    name: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class CampaignBase(BaseModel):
    name: str
    year: int

class CampaignCreate(CampaignBase):
    pass

class CampaignResponse(CampaignBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class VolunteerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    region: str
    city: Optional[str] = None
    availability: Optional[str] = None
    volunteer_type: Optional[str] = None
    status: Optional[str] = "Activo"
    notes: Optional[str] = None

class VolunteerCreate(VolunteerBase):
    skills: List[str] = [] # List of skill names
    campaigns: List[dict] = [] # List of campaigns (name, year)

class VolunteerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    availability: Optional[str] = None
    volunteer_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    skills: Optional[List[str]] = None
    campaigns: Optional[List[str]] = None

class VolunteerResponse(VolunteerBase):
    id: str
    skills: List[SkillResponse]
    campaigns: List[CampaignResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
