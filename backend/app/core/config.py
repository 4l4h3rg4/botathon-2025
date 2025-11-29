from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, computed_field
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Botathon Backend"
    API_V1_STR: str = "/api/v1"
    
    # Database
    SUPABASE_USER: str
    SUPABASE_PASSWORD: str
    SUPABASE_HOST: str
    SUPABASE_PORT: int = 5432
    SUPABASE_DB: str = "postgres"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return str(PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.SUPABASE_USER,
            password=self.SUPABASE_PASSWORD,
            host=self.SUPABASE_HOST,
            port=self.SUPABASE_PORT,
            path=self.SUPABASE_DB,
            query="prepared_statement_cache_size=0&ssl=require"
        ))

    # Security
    SECRET_KEY: str = "changeme"
    
    # Blue Prism
    BLUE_PRISM_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
