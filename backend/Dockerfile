FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system deps (minimal)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml pytest.ini ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install .

# Copy application code
COPY app ./app
COPY tests ./tests

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Login command for repo:
# aws ecr get-login-password --region ap-south-1 docker login --username santosh --password-stdin 385046010545.dkr.ecr.ap-south-1.amazonaws.com
# docker build -t drive-api .
# docker tag drive-api:latest 385046010545.dkr.ecr.ap-south-1.amazonaws.com/drive-file-summary-backend:latest
# docker push 385046010545.dkr.ecr.ap-south-1.amazonaws.com/drive-file-summary-backend:latest



# aws ecr describe-repositories --repository-names google-drive-file-summary-backend --region ap-south-1