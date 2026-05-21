# Botathon 2025 Backend

High-performance Flask backend with Supabase integration and Blue Prism support.

## Prerequisites

- Python 3.11+
- Poetry (optional, but recommended) or pip

## Setup

1.  **Environment Variables**:
    Ensure you have a `.env` file in this directory with the following content:
    ```bash
    SUPABASE_USER=postgres
    SUPABASE_PASSWORD=[YOUR_PASSWORD]
    SUPABASE_HOST=db.[YOUR_PROJECT_ID].supabase.co
    SUPABASE_PORT=5432
    SUPABASE_DB=postgres
    SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
    SUPABASE_KEY=[YOUR_SUPABASE_ANON_KEY]
    SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY_BACKEND_ONLY]
    BLUE_PRISM_API_KEY=[GENERATE_A_RANDOM_API_KEY]
    SECRET_KEY=[GENERATE_WITH_PYTHON_SECRETS_TOKEN_HEX_32]
    COOKIE_SECURE=false
    COOKIE_SAMESITE=Strict
    ```

2.  **Install Dependencies**:

    Using Poetry:
    ```bash
    poetry install
    ```

    Using pip:
    ```bash
    pip install flask[async] sqlalchemy[asyncio] asyncpg pydantic pydantic-settings python-dotenv gunicorn uvicorn
    ```

## Running the Server

### Development Mode
```bash
python -m app.main
```
OR
```bash
uvicorn app.main:app --reload --port 8000
```

### Production Mode
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

## API Documentation

Once running, you can access the API at `http://localhost:8000/api/v1`.

### Key Endpoints

- **Volunteers**: `GET /api/v1/volunteers`, `POST /api/v1/volunteers`
- **Metrics**: `GET /api/v1/metrics/overview`
- **Segmentation**: `POST /api/v1/segmentation`
- **Bots**: `GET /api/v1/bots/pending-tasks` (Requires `X-API-Key`)
