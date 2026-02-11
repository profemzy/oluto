from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, computed_field
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )

    PROJECT_NAME: str = "Oluto API"
    API_V1_STR: str = "/api/v1"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # DATABASE CONFIG
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "oluto_db"
    DATABASE_SSL: bool = False

    # CELERY / REDIS CONFIG
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # JWT / AUTH CONFIG
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_USE_openssl_rand_hex_32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # FUELIX / AI CONFIG (OpenAI-compatible endpoint for AI categorization)
    FUELIX_API_KEY: Optional[str] = None
    FUELIX_BASE_URL: str = "https://api.fuelix.ai/v1"
    FUELIX_MODEL: str = "claude-haiku-4-5"

    # AZURE / MISTRAL OCR CONFIG
    AZURE_API_KEY: Optional[str] = None
    AZURE_OCR_URL: str = "https://profemzy-5149-resource.services.ai.azure.com/providers/mistral/azure/ocr"
    AZURE_OCR_MODEL: str = "mistral-document-ai-2505"

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        url = str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_SERVER,
                port=self.POSTGRES_PORT,
                path=self.POSTGRES_DB,
            )
        )
        if self.DATABASE_SSL:
            url += "?ssl=require"
        return url


settings = Settings()
