# Backend: FastAPI served by uvicorn. Python 3.10 matches the project's original venv.
FROM python:3.10-slim

WORKDIR /app

# Install Python deps first so this layer is cached unless requirments.txt changes.
COPY requirments.txt .
RUN pip install --no-cache-dir -r requirments.txt

# Copy the application source (venv/.venv/__pycache__ excluded via .dockerignore).
COPY . .

EXPOSE 8000

# BASE_DIR and LOCAL_TEST are supplied by docker-compose at runtime.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
