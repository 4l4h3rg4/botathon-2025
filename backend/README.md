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
    SUPABASE_HOST=db.mffriqwwojidkkbaulie.supabase.co
    SUPABASE_PORT=5432
    SUPABASE_DB=postgres
    BLUE_PRISM_API_KEY=secret_key_for_bots
    SECRET_KEY=supersecretkey
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
