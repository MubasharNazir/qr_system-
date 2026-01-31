#!/bin/sh
# Startup script that uses PORT environment variable
PORT=${PORT:-8080}
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
